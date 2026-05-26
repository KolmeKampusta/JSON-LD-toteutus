#!/usr/bin/env python3
"""
validate.py — Drive validator.schema.org headlessly via Playwright to test
all static-JSON tags in /tags/.

⚠️  Use sparingly. Google rate-limits automated traffic to validator.schema.org
    and may show a CAPTCHA / "sorry" page after several runs from the same IP.
    The script defaults to a 5-second delay between tags to be polite.

Workflow:
  - Opens a real Chromium browser (visible by default, --headless to hide)
  - For each tag: pastes content, clicks Run Test, scrapes the result panel
  - Reports per-tag PASS/WARN/FAIL summary + a final table

Usage:
  python validate.py                  # all 22 static tags, 5s delay, visible browser
  python validate.py tag-01           # only tag-01 (substring match)
  python validate.py --headless       # invisible browser
  python validate.py --delay 10       # 10s delay between tags
  python validate.py --verbose        # show full error/warning text

Requirements:
  pip install playwright
  playwright install chromium
"""

import asyncio
import re
import sys
from pathlib import Path

try:
    from playwright.async_api import async_playwright, TimeoutError as PWTimeoutError
except ImportError:
    print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
TAGS_DIR = REPO_ROOT / "tags"
JS_DISPATCHER_TAGS = {"tag-06-smart-content", "tag-07-smart-section", "tag-08-debug"}
VALIDATOR_URL = "https://validator.schema.org/"
NAV_TIMEOUT = 30000
SETTLE_TIMEOUT = 8000


def get_static_tag_files(filter_substring: str = "") -> list[Path]:
    all_tags = sorted(TAGS_DIR.glob("tag-*.html"))
    static = [f for f in all_tags if f.stem not in JS_DISPATCHER_TAGS]
    if filter_substring:
        static = [f for f in static if filter_substring in f.stem]
    return static


async def validate_one(page, tag_file: Path) -> dict:
    """Validate a single tag against validator.schema.org. Returns dict with results."""
    name = tag_file.stem
    content = tag_file.read_text(encoding="utf-8")

    # Fresh navigation per tag to avoid state leakage
    await page.goto(VALIDATOR_URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
    await page.wait_for_timeout(800)  # allow CodeMirror init

    # Check for Google "sorry" rate-limit page
    if "sorry" in page.url.lower() or await page.locator("text=unusual traffic").count():
        return {"name": name, "status": "RATE_LIMITED", "errors": ["Google CAPTCHA / rate limit hit. Wait or use a different IP."], "warnings": [], "raw_text": ""}

    # Click "Code Snippet" tab (handle multilingual UI)
    for label in ("Code Snippet", "Koodinpätkä", "Code snippet"):
        try:
            btn = page.get_by_text(label, exact=True).first
            if await btn.count():
                await btn.click(timeout=3000)
                await page.wait_for_timeout(500)
                break
        except Exception:
            continue

    # Set CodeMirror content via the editor API
    try:
        await page.evaluate(
            """(content) => {
                const cm = document.querySelector('.CodeMirror');
                if (cm && cm.CodeMirror) {
                    cm.CodeMirror.setValue(content);
                    cm.CodeMirror.refresh();
                    return true;
                }
                return false;
            }""",
            content,
        )
    except Exception as e:
        return {"name": name, "status": "ERROR", "errors": [f"Failed to set editor: {e}"], "warnings": [], "raw_text": ""}

    await page.wait_for_timeout(500)

    # Click "Run Test" / "Tee testi"
    clicked = False
    for label in ("Run Test", "Run test", "Tee testi", "RUN TEST"):
        try:
            btn = page.get_by_text(label, exact=True).first
            if await btn.count():
                await btn.click(timeout=3000)
                clicked = True
                break
        except Exception:
            continue
    if not clicked:
        return {"name": name, "status": "ERROR", "errors": ["Run Test button not found"], "warnings": [], "raw_text": ""}

    # Wait for results panel — give it some time
    await page.wait_for_timeout(SETTLE_TIMEOUT)

    # Scrape result panel — best-effort, validator.schema.org markup may vary
    result_text = await page.evaluate(
        """() => {
            // Try to capture any visible result panel text
            const candidates = document.querySelectorAll('[class*="result"], [class*="error"], [class*="warning"], [class*="ItemResult"], main, .mdc-list');
            const texts = [...candidates].map(e => e.innerText).filter(t => t && t.length > 10);
            return texts.join('\\n---\\n').slice(0, 5000);
        }"""
    )

    # Heuristic error/warning detection from result text
    errors = []
    warnings = []
    if result_text:
        for line in result_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            low = line.lower()
            if low.startswith("error") or "errors" in low and re.search(r"\d+\s+errors", low):
                errors.append(line[:200])
            elif low.startswith("warning") or "warnings" in low and re.search(r"\d+\s+warnings", low):
                warnings.append(line[:200])

    status = "FAIL" if errors else ("WARN" if warnings else "PASS")
    return {"name": name, "status": status, "errors": errors, "warnings": warnings, "raw_text": result_text}


async def main():
    args = sys.argv[1:]
    headless = "--headless" in args
    verbose = "--verbose" in args or "-v" in args
    delay = 5
    if "--delay" in args:
        try:
            delay = int(args[args.index("--delay") + 1])
        except (IndexError, ValueError):
            pass
    filter_arg = next((a for a in args if not a.startswith("--") and a.isdigit() is False and not a.startswith("-")), "")

    tags = get_static_tag_files(filter_arg)
    if not tags:
        print(f"No matching tag files in {TAGS_DIR}")
        return 1

    print(f"validator.schema.org automation — {len(tags)} tag(s), delay={delay}s, headless={headless}")
    print("⚠️  Google rate-limits aggressive automation. If you see CAPTCHA, wait 15 min or change IP.")
    print()

    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()

        for i, tag_file in enumerate(tags, 1):
            print(f"[{i}/{len(tags)}] {tag_file.stem}... ", end="", flush=True)
            try:
                r = await validate_one(page, tag_file)
            except PWTimeoutError as e:
                r = {"name": tag_file.stem, "status": "TIMEOUT", "errors": [str(e)], "warnings": [], "raw_text": ""}
            except Exception as e:
                r = {"name": tag_file.stem, "status": "ERROR", "errors": [str(e)], "warnings": [], "raw_text": ""}

            results.append(r)
            print(f"{r['status']}  errors={len(r['errors'])}  warnings={len(r['warnings'])}")
            if verbose and (r["errors"] or r["warnings"]):
                for e in r["errors"][:5]:
                    print(f"    ERROR: {e}")
                for w in r["warnings"][:5]:
                    print(f"    WARN:  {w}")
            if r["status"] == "RATE_LIMITED":
                print("\nRate-limited. Stopping. Wait 10–15 minutes and retry, or switch IP.")
                break

            if i < len(tags):
                await asyncio.sleep(delay)

        await browser.close()

    # Final summary
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    for r in results:
        icon = {"PASS": "✓", "WARN": "⚠", "FAIL": "✗", "ERROR": "💥", "TIMEOUT": "⏱", "RATE_LIMITED": "🚫"}.get(r["status"], "?")
        print(f"  {icon} {r['name']:<45} {r['status']:>12}  e={len(r['errors'])} w={len(r['warnings'])}")

    failed = sum(1 for r in results if r["status"] in ("FAIL", "ERROR", "TIMEOUT", "RATE_LIMITED"))
    passed = sum(1 for r in results if r["status"] == "PASS")
    warned = sum(1 for r in results if r["status"] == "WARN")
    print(f"\n{passed} pass, {warned} warn, {failed} fail/error")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))

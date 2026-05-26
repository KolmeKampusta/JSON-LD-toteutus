# Testing scripts

Three Python scripts to speed up testing the 22 static-JSON tags in `/tags/` against schema validators.

## Setup (one-time)

```powershell
# Install dependencies
pip install -r requirements.txt

# Install Chromium for the Playwright script (only needed if you'll run validate.py)
playwright install chromium
```

Tested with Python 3.10+.

## The three scripts

### 1. `open-rrt.py` — Rich Results Test tab opener

Recommended for routine testing. Opens each tag in a new RRT tab, copies content to clipboard, pauses for you to paste + click TEST CODE, then continues.

```powershell
# One tag at a time (recommended workflow)
python scripts/open-rrt.py

# Specific tag(s) only — substring match
python scripts/open-rrt.py tag-01

# Batch mode (open all tabs at once — clipboard only holds last tag)
python scripts/open-rrt.py --batch
```

Per tag: ~10–15 seconds of your time (switch tab, paste, click, observe).
Total for 22 tags: ~5 minutes vs ~30 min purely manual.

### 2. `open-validator.py` — validator.schema.org tab opener

Identical workflow to `open-rrt.py` but targets validator.schema.org instead.

```powershell
python scripts/open-validator.py
python scripts/open-validator.py tag-03
python scripts/open-validator.py --batch
```

**Use validator.schema.org for**: strict schema.org spec compliance (property domain checks, type-vs-property correctness).
**Use RRT for**: Google rich result feature eligibility.

Both checks are valuable. Run validator.schema.org first to catch schema errors, then RRT to confirm Google sees the right rich result types.

### 3. `validate.py` — Playwright-based full automation

**⚠️ Use sparingly.** Google rate-limits automated traffic to validator.schema.org. After 2–3 full runs from the same IP in a short window, you may get a CAPTCHA / "sorry" page that requires waiting ~15 minutes.

When it does work, it drives a real Chromium browser through each tag, scrapes the result panel, and prints a summary table.

```powershell
# All 22 static tags, visible browser, 5s delay between each
python scripts/validate.py

# Headless (no visible browser)
python scripts/validate.py --headless

# Specific tag(s)
python scripts/validate.py tag-19

# Slower delay if rate limit hits
python scripts/validate.py --delay 10

# Verbose: show full error/warning text per tag
python scripts/validate.py --verbose
```

Output looks like:

```
[1/22] tag-01-organization...                 WARN   errors=0  warnings=90
[2/22] tag-02-website...                      PASS   errors=0  warnings=0
[3/22] tag-03-pajulahti-campus...             PASS   errors=0  warnings=0
...

============================================================
Summary
============================================================
  ⚠ tag-01-organization              WARN    e=0 w=90
  ✓ tag-02-website                   PASS    e=0 w=0
  ...

20 pass, 2 warn, 0 fail/error
```

If you see `🚫 RATE_LIMITED`, stop immediately — every further call may extend the timeout.

## When to use which

| Scenario | Recommended script |
|---|---|
| After making any tag edit, want to spot-check | `open-rrt.py tag-XX` |
| Full pre-publish validation pass | `open-validator.py` then `open-rrt.py` |
| Regression check before major releases | `validate.py` (if rate limit allows) + `open-rrt.py` |
| Quick eyeball of a single tag | Copy the file content manually into either tool |

## Notes on the JS dispatcher tags (6, 7, 8)

Tags 6, 7, 8 are JavaScript dispatchers that emit JSON-LD dynamically at runtime. They have no static JSON to paste, so neither validator nor RRT can test them in code paste mode. All three scripts **skip them automatically**.

To test them, use **GTM Preview Mode** on representative URLs:

- Tag 6: `/fi` (WebPage), `/fi/artikkelit/X` (Article), `/fi/uutiset/X` (NewsArticle), `/fi/blogi/X` (BlogPosting), `/fi/tapahtumat/X` (SportsEvent)
- Tag 7: `/fi/meista/yhteystiedot` (ContactPage), `/fi/meista/X` (AboutPage), `/fi/ryhmat-ja-leirit/X` (TouristTrip+Product), `/fi/vapaa-aika/aktiviteetit/X` (TouristAttraction), `/fi/yritykset/X` (Service)
- Tag 8: Any page — check browser DevTools console for the `[Schema.org]` log

After GTM publish, run **RRT URL mode** on the same URLs — it'll execute the JS, capture the injected JSON-LD, and validate it as a real end-to-end test.

## Troubleshooting

**`pyperclip` raises an error on Linux**:
```
sudo apt install xclip   # or xsel
```

**`playwright install chromium` fails**:
- Try `python -m playwright install chromium`
- On corporate networks, you may need to set `HTTPS_PROXY`

**Rate-limited by Google**:
- Wait 10–20 minutes
- Increase `--delay` to 10+ seconds
- Switch to mobile hotspot / different network briefly
- Use `open-rrt.py` / `open-validator.py` instead — they're not flagged because you're operating manually

**Tag content not on clipboard after running open-*.py**:
- On Windows, make sure no other clipboard manager is intercepting
- On WSL, install `xclip` and run with `DISPLAY=:0`

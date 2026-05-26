#!/usr/bin/env python3
"""
open-rrt.py — Open each static tag in its own Rich Results Test browser tab,
with the tag's JSON-LD content pre-copied to your clipboard so you can paste
immediately with Ctrl+V.

Workflow:
  1. Run this script
  2. For each tag:
     a. Script copies the tag's content to clipboard
     b. Script opens a new RRT tab in your default browser
     c. You: switch to that tab → click "Code" tab → paste (Ctrl+V) → click "TEST CODE"
     d. Observe result, then press Enter in terminal to move to the next tag
  3. Repeat until all 22 static tags tested

Usage:
  python open-rrt.py              # open all 22 static tags one by one
  python open-rrt.py tag-01       # only tag(s) matching this substring
  python open-rrt.py --batch      # open all 22 tabs at once (no per-tag pauses)
                                  # WARNING: only the LAST tag's content stays on clipboard

Requirements:
  pip install pyperclip
"""
import sys
import time
import webbrowser
from pathlib import Path

try:
    import pyperclip
except ImportError:
    print("ERROR: pyperclip not installed. Run: pip install pyperclip")
    sys.exit(1)

REPO_ROOT = Path(__file__).resolve().parent.parent
TAGS_DIR = REPO_ROOT / "tags"
JS_DISPATCHER_TAGS = {"tag-06-smart-content", "tag-07-smart-section", "tag-08-debug"}
RRT_URL = "https://search.google.com/test/rich-results"


def get_static_tag_files(filter_substring: str = "") -> list[Path]:
    """Return sorted list of static-JSON tag files (excludes JS dispatchers)."""
    all_tags = sorted(TAGS_DIR.glob("tag-*.html"))
    static = [f for f in all_tags if f.stem not in JS_DISPATCHER_TAGS]
    if filter_substring:
        static = [f for f in static if filter_substring in f.stem]
    return static


def main() -> int:
    args = sys.argv[1:]
    batch_mode = "--batch" in args
    filter_arg = next((a for a in args if not a.startswith("--")), "")

    tags = get_static_tag_files(filter_arg)
    if not tags:
        print(f"No matching tag files found in {TAGS_DIR}")
        return 1

    print(f"Rich Results Test helper — {len(tags)} tag(s) to test")
    print(f"Tags dir: {TAGS_DIR}")
    print()
    if batch_mode:
        print("Batch mode: opening all tabs at once.")
        print("Only the LAST tag's content stays on clipboard; you'll need to copy from files for the rest.")
        print()
        for t in tags:
            webbrowser.open_new_tab(RRT_URL)
            time.sleep(0.3)
        # Last tag content on clipboard
        pyperclip.copy(tags[-1].read_text(encoding="utf-8"))
        print(f"Clipboard now contains: {tags[-1].stem}")
        return 0

    print("Workflow per tag:")
    print("  1. Tag content is copied to your clipboard automatically.")
    print("  2. RRT opens in a new browser tab.")
    print("  3. In RRT: click 'Code' tab → paste (Ctrl+V) → click 'TEST CODE'.")
    print("  4. Observe result, then press Enter here for the next tag.")
    print()
    input("Press Enter to start with tag 1...")

    for i, tag_file in enumerate(tags, start=1):
        content = tag_file.read_text(encoding="utf-8")
        pyperclip.copy(content)
        webbrowser.open_new_tab(RRT_URL)
        print(f"\n[{i}/{len(tags)}] {tag_file.stem}")
        print(f"    Clipboard: ready ({len(content)} chars). Paste in RRT now.")
        if i < len(tags):
            input("    Press Enter when done to move to next tag...")
        else:
            print("    (last tag — no Enter needed)")

    print("\nAll tags opened. Happy testing.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

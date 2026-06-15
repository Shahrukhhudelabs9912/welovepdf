"""Verify all dynamic translation key variants identified by check-i18n.py.
Patterns scanned:
  - header.tsx: nameKey strings (top-level keys like 'common.tools', 'tools.merge_pdf', etc.)
  - tools-grid.tsx: tools.{key}.title / tools.{key}.description for 14 tools
  - features.tsx: features.{key}.title / features.{key}.description for 8 features
  - testimonials.tsx: testimonials.user{n}.{name,role,company,text} for 6 users
  - dashboard-layout.tsx: dashboard.{labelKey} for 3 nav links
  - activity-feed.tsx: dashboard.{labelKey} for 3 activity types
  - page-numbering: position_* and page_range_* (already verified)
  - compress-pdf: low/medium/high_compression(_desc), max/balanced/light_compression_desc (already verified)
"""
import json, sys, io
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

with open(ROOT / "messages/en.json", encoding="utf-8") as f: en = json.load(f)
with open(ROOT / "messages/hi.json", encoding="utf-8") as f: hi = json.load(f)

def get(d, dotted):
    cur = d
    for p in dotted.split("."):
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return None
    return cur

# ── Build the full list of dot-notation keys we expect ──
expected = []

# header.tsx — nameKey values
header_keys = [
    "common.tools","common.features","header.nav.ai_tools","common.blog","common.pricing",
    "header.tool_categories.merge_split","header.tool_categories.convert",
    "header.tool_categories.optimize","header.tool_categories.edit_enhance",
]
for k in header_keys: expected.append(("header", k))

# tools-grid.tsx — tools.{key}.title|description for 14 tools
tools_grid_keys = ["merge_pdf","split_pdf","compress_pdf","pdf_to_word","word_to_pdf",
    "pdf_to_jpg","jpg_to_pdf","protect_pdf","add_watermark","page_numbering",
    "organize_pdf","pdf_to_excel","excel_to_pdf","ai_summarization"]
for k in tools_grid_keys:
    expected.append(("tools-grid", f"tools.{k}.title"))
    expected.append(("tools-grid", f"tools.{k}.description"))

# features.tsx — features.{key}.title|description for 8 features
feature_keys = ["security","speed","ai","multilingual","browser","parallel","cloud","team"]
for k in feature_keys:
    expected.append(("features", f"features.{k}.title"))
    expected.append(("features", f"features.{k}.description"))

# testimonials.tsx — testimonials.user{1..6}.{name,role,company,text}
for n in range(1, 7):
    for sub in ("name","role","company","text"):
        expected.append(("testimonials", f"testimonials.user{n}.{sub}"))

# dashboard-layout.tsx — dashboard.{overview,history,reports}
for k in ("overview","history","reports"):
    expected.append(("dashboard-nav", f"dashboard.{k}"))

# activity-feed.tsx — dashboard.activity_*
for k in ("activity_ai_analysis","activity_report_exported","activity_login"):
    expected.append(("activity-feed", f"dashboard.{k}"))

# ── Run the check ──
missing = {"en": [], "hi": []}
for source, key in expected:
    if get(en, key) is None: missing["en"].append((source, key))
    if get(hi, key) is None: missing["hi"].append((source, key))

print(f"Total expected dynamic keys: {len(expected)}")
print(f"Missing in en.json: {len(missing['en'])}")
print(f"Missing in hi.json: {len(missing['hi'])}")
print()

for loc in ("en", "hi"):
    if not missing[loc]:
        print(f"  ✓ {loc}.json: all dynamic variants present")
        continue
    print(f"  ✗ {loc}.json missing:")
    by_source = {}
    for source, key in missing[loc]:
        by_source.setdefault(source, []).append(key)
    for source, keys in sorted(by_source.items()):
        print(f"    [{source}] ({len(keys)})")
        for k in keys: print(f"      - {k}")

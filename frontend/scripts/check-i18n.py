#!/usr/bin/env python
"""
Scan a next-intl Next.js project for translation key usages and report
which keys are missing in each locale JSON file under messages/.

Usage (from frontend/):
    python scripts/check-i18n.py
    python scripts/check-i18n.py --show-dynamic     # list t(`${var}`) refs needing manual review
    python scripts/check-i18n.py --show-unused      # list keys defined in JSON but never used
    python scripts/check-i18n.py --strict           # exit 1 if any missing keys

Detects:
  - const t  = useTranslations("ns")  -> t("key")  looks up ns.key
  - const tp = useTranslations("tool_pages") -> tp("file_removed") looks up tool_pages.file_removed
  - t.raw("key") and dot-notation keys (t("a.b"))
  - Flags template-literal calls (t(`${foo}.title`)) as dynamic
"""
import argparse, json, re, sys
from collections import defaultdict
from pathlib import Path

# Windows consoles default to cp1252 which can't encode emoji/check marks.
# Reconfigure stdout to UTF-8 so report output prints cleanly cross-platform.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

USE_TRANS_RE = re.compile(
    r"""(?:const|let)\s+(\w+)\s*=\s*useTranslations\(\s*(?:["']([^"']*)["'])?\s*\)"""
)
SCAN_DIRS = ["app", "components", "lib", "hooks"]
SCAN_EXTS = {".tsx", ".ts"}

# Matches {name} placeholders, but NOT '{name}' (ICU-escaped literal braces).
# We capture the position so we can verify it's not surrounded by single
# quotes — single quotes inside an ICU MessageFormat string escape the brace.
PLACEHOLDER_RE = re.compile(r"(?<!')\{([a-zA-Z_][a-zA-Z0-9_]*)\}(?!')")

def get_nested(d, key):
    cur = d
    for p in key.split("."):
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return None
    return cur

def _extract_arg_names(args_blob: str) -> set:
    """Extract identifier names from a JS-ish object literal body.

    Handles both 'key: value' pairs and shorthand '{ name }' / '{ a, b }'.
    Strips string values and nested expressions before scanning.
    """
    # Drop the values after `:` (best-effort — we only care about keys).
    cleaned = re.sub(r":[^,}]*", "", args_blob)
    # Now treat each comma-separated chunk as a single identifier.
    names = set()
    for chunk in cleaned.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        m = re.match(r"^([a-zA-Z_][a-zA-Z0-9_]*)$", chunk)
        if m:
            names.add(m.group(1))
    return names


def scan_file(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    bindings = {m.group(1): (m.group(2) or "") for m in USE_TRANS_RE.finditer(text)}
    if not bindings:
        return [], [], []
    refs, dyns, arg_calls = [], [], []
    for var, ns in bindings.items():
        v = re.escape(var)
        # Static call WITH explicit args: t("key", { foo: ... })
        # Match conservatively — the args object can't contain `)` at the top level.
        for m in re.finditer(
            rf'\b{v}(?:\.raw)?\(\s*["\']([^"\']+)["\']\s*,\s*\{{([^}}]*)\}}',
            text,
        ):
            key = m.group(1)
            args_blob = m.group(2)
            arg_names = _extract_arg_names(args_blob)
            arg_calls.append((ns, key, path, arg_names))
            refs.append((ns, key, path))
        # Static call without args (already captured above will dup; that's fine
        # because we only use refs for missing-key detection).
        for m in re.finditer(rf'\b{v}(?:\.raw)?\(\s*["\']([^"\']+)["\']', text):
            refs.append((ns, m.group(1), path))
        # Dynamic call: t(`...`) or t(varname)
        for m in re.finditer(rf'\b{v}(?:\.raw)?\(\s*[`a-zA-Z_$]', text):
            line = text[:m.start()].count("\n") + 1
            dyns.append((ns, var, path, line))
    return refs, dyns, arg_calls

def flatten(prefix, d, out):
    for k, v in d.items():
        full = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            flatten(full, v, out)
        else:
            out.add(full)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="frontend root (contains messages/)")
    ap.add_argument("--show-dynamic", action="store_true")
    ap.add_argument("--show-unused", action="store_true")
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    locales_dir = root / "messages"
    locale_files = sorted(locales_dir.glob("*.json"))
    if not locale_files:
        print(f"No locale files in {locales_dir}", file=sys.stderr)
        return 2
    locales = {}
    for f in locale_files:
        with open(f, encoding="utf-8") as fh:
            locales[f.stem] = json.load(fh)
    print(f"Loaded locales: {list(locales)}")

    refs, dyns, arg_calls = [], [], []
    for d in SCAN_DIRS:
        sd = root / d
        if not sd.exists():
            continue
        for p in sd.rglob("*"):
            if p.is_file() and p.suffix in SCAN_EXTS and "node_modules" not in p.parts:
                r, dy, ac = scan_file(p)
                refs.extend(r)
                dyns.extend(dy)
                arg_calls.extend(ac)

    used = defaultdict(set)              # namespace -> set of keys
    by_locale = {l: defaultdict(set) for l in locales}
    for ns, key, _path in refs:
        used[ns].add(key)
        for loc, data in locales.items():
            section = data if ns == "" else data.get(ns)
            if section is None:
                by_locale[loc][ns or "(root)"].add(f"{key}  (namespace missing)")
                continue
            if get_nested(section, key) is None:
                by_locale[loc][ns or "(root)"].add(key)

    total = 0
    for loc, by_ns in by_locale.items():
        n = sum(len(v) for v in by_ns.values())
        total += n
        print(f"\n=== {loc}.json — {n} missing keys ===")
        if not by_ns:
            print("  (none)")
            continue
        for ns in sorted(by_ns):
            keys = sorted(by_ns[ns])
            print(f"  [{ns}] ({len(keys)})")
            for k in keys:
                print(f"    - {k}")

    if args.show_dynamic and dyns:
        print(f"\n=== Dynamic key refs — {len(dyns)} (manual review) ===")
        seen = set()
        for ns, var, path, line in dyns:
            rel = path.relative_to(root); sig = (str(rel), line, var)
            if sig in seen: continue
            seen.add(sig)
            print(f"  {rel}:{line}  {var}(`...` or var) — namespace={ns or '(root)'}")

    # ── Placeholder consistency check ─────────────────────────────────────
    # For every locale + every key, compare {placeholders} found in the text
    # against the args supplied at the call site. Missing args at runtime
    # cause `IntlError: FORMATTING_ERROR` — exactly the bug class users hit.
    print(f"\n=== Placeholder consistency (FORMATTING_ERROR guard) ===")
    placeholder_issues = []
    # Build a map of which call sites pass which arg names per key.
    args_by_key = defaultdict(set)
    for ns, key, _path, arg_names in arg_calls:
        full = f"{ns}.{key}" if ns else key
        args_by_key[full] |= arg_names
    # Also track call sites that pass NO args object (those are at risk if
    # the string has placeholders).
    no_arg_callsites = defaultdict(list)
    for ns, key, path in refs:
        full = f"{ns}.{key}" if ns else key
        no_arg_callsites[full].append(path)

    for loc, data in locales.items():
        for ns, used_keys in used.items():
            for key in used_keys:
                full = f"{ns}.{key}" if ns else key
                section = data if ns == "" else data.get(ns)
                if not isinstance(section, dict):
                    continue
                value = get_nested(section, key)
                if not isinstance(value, str):
                    continue
                placeholders = set(PLACEHOLDER_RE.findall(value))
                if not placeholders:
                    continue
                supplied = args_by_key.get(full, set())
                missing = placeholders - supplied
                if missing:
                    # If at least one callsite passes args object, only flag
                    # if ANY callsite forgets — but more importantly, if NO
                    # callsite supplies args, every reference is broken.
                    callsites_without_args = [
                        p for p in no_arg_callsites.get(full, [])
                        if p.read_text(encoding="utf-8", errors="replace")
                            .find(f'{key}",') == -1
                        and p.read_text(encoding="utf-8", errors="replace")
                            .find(f"{key}',") == -1
                    ]
                    placeholder_issues.append((loc, full, sorted(placeholders),
                                                sorted(supplied), sorted(missing), value))

    if placeholder_issues:
        for loc, full, ph, sup, missing, text in placeholder_issues:
            print(f"  [FAIL] [{loc}] {full}")
            print(f"      text:      {text[:90]!r}")
            print(f"      needs:     {ph}")
            print(f"      supplied:  {sup}")
            print(f"      missing:   {missing}")
            print(f"      fix: either pass these as args at the call site, or wrap")
            print(f"           the literal braces in single quotes: '{{name}}'")
    else:
        print("  [OK] all placeholder strings have matching call-site args")

    if args.show_unused:
        print(f"\n=== Unused keys (defined but never referenced) ===")
        for loc, data in locales.items():
            for ns, used_keys in sorted(used.items()):
                section = data if ns == "" else data.get(ns)
                if not isinstance(section, dict): continue
                all_keys = set(); flatten("", section, all_keys)
                unused = sorted(all_keys - used_keys)
                if unused:
                    print(f"  [{loc}] [{ns or '(root)'}] unused ({len(unused)}):")
                    for k in unused: print(f"    - {k}")

    print(f"\nTotal missing across locales: {total}")
    print(f"Total static refs scanned: {len(refs)} | dynamic: {len(dyns)}")
    print(f"Placeholder consistency issues: {len(placeholder_issues)}")
    return 1 if (args.strict and (total > 0 or placeholder_issues)) else 0

if __name__ == "__main__":
    sys.exit(main())

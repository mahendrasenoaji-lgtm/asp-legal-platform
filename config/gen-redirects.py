#!/usr/bin/env python3
"""Regenerate config/redirects.js from data/redirects.csv."""
import csv, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rows = list(csv.DictReader(open(os.path.join(root, 'data/redirects.csv'), encoding='utf-8')))
red = [{"source": r['old_path'].rstrip('/') or '/', "destination": r['new_path'], "permanent": True}
       for r in rows if r['status'] == '301']
gone = [r['old_path'] for r in rows if r['status'] == '410']
blocked = [r['old_path'] for r in rows if r['status'] == 'BLOCK']
out = ("// Generated from data/redirects.csv by config/gen-redirects.py — do not hand-edit.\n\n"
       f"const redirects = {json.dumps(red, indent=2)};\n\n"
       f"const gone = {json.dumps(gone, indent=2)};\n\n"
       f"const blocked = {json.dumps(blocked, indent=2)};\n\n"
       "module.exports = { redirects, gone, blocked };\n")
open(os.path.join(root, 'config/redirects.js'), 'w').write(out)
print(f"{len(red)} redirects, {len(gone)} gone, {len(blocked)} blocked")

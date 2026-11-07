#!/usr/bin/env python3
"""Subset the existing Zhuque font for every included term and case."""
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'src/fonts/ZhuqueFangsong-Regular.ttf'
text = ''.join(path.read_text() for folder in [ROOT / 'src', ROOT / 'public'] for path in folder.rglob('*') if path.suffix in {'.json', '.html', '.js', '.mjs'})
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font(str(source), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, str(ROOT / 'public/term-assets/fonts/EntryAllCN.woff2'), options)
print('Built complete glyph coverage for all included content.')

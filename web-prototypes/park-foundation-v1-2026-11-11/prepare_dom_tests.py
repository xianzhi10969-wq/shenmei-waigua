#!/usr/bin/env python3
"""Optional DOM-only test helper. Not required to run the website."""
from pathlib import Path
from urllib.request import urlopen

path = Path('/tmp/park-dom-check')
path.mkdir(exist_ok=True)
with urlopen('https://unpkg.com/linkedom@0.18.12/worker.js', timeout=30) as response:
    (path / 'linkedom-worker.mjs').write_bytes(response.read())
print('Prepared LinkeDOM 0.18.12 (ISC license); run node test_dom.mjs and node test_art_bridge.mjs.')

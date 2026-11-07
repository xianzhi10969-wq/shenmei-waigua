#!/usr/bin/env python3
"""Separate the approved mobile seam from the old flattened export."""
from pathlib import Path
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/entrance/p3-stained-glass-v3-2026-10-23/assets'
SOURCE = ROOT / 'src/home-seam'
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)


def element(tag, attributes, parent):
    return ET.SubElement(parent, '{' + NS + '}' + tag, attributes)


def main():
    scene = ET.parse(ASSETS / 'm_p2_vector_v20261101.svg').getroot()
    geometry = json.loads((SOURCE / 'geometry.json').read_text())
    # Keep the original lower scene and its existing question outlines intact.
    image = list(scene)[0]
    definitions = element('defs', {}, scene)
    clip = element('clipPath', {'id': 'original-lower-scene'}, definitions)
    element('rect', {'y': '160', 'width': '390', 'height': '900'}, clip)
    image.set('clip-path', 'url(#original-lower-scene)')

    seam = element('g', {'id': 'independent-seam'}, scene)
    element('rect', {'width': '390', 'height': '160', 'fill': '#f7f4ec'}, seam)
    element('path', {
        'id': 'original-wave', 'd': geometry['boundary'] + ' L390,160 L0,160 Z',
        'fill': '#12161c',
    }, seam)
    # These parallel contours and ripples follow the original raster band.
    for offset, color, opacity in [(-7.5, '#bbb8af', '.5'), (10, '#62615b', '.35')]:
        element('path', {
            'd': geometry['boundary'], 'transform': f'translate(0 {offset})',
            'fill': 'none', 'stroke': color, 'stroke-width': '.8', 'opacity': opacity,
        }, seam)
    for index, path in enumerate(geometry['ripples']):
        element('path', {
            'd': path, 'fill': 'none', 'stroke': '#756d5c', 'stroke-width': '.8',
            'opacity': '.55' if index == 0 else '.3', 'stroke-linecap': 'round',
        }, seam)

    scene.set('aria-label', '四个审美问题与楼梯水面，接缝和问题文字为独立矢量')
    ET.ElementTree(scene).write(
        ASSETS / 'm_p2_layered_v20261107.svg', encoding='utf-8', xml_declaration=True,
    )


if __name__ == '__main__':
    main()

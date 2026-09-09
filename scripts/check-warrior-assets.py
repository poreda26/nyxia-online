"""Read-only verification of the two delivered PNG atlases and gameplay hashes."""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
for name, rows in (('warrior-human-v4.png',4), ('warrior-orc-v4.png',4), ('warrior-armor-v4.png',2)):
    im = Image.open(root / 'src/assets/world' / name)
    assert im.mode == 'RGBA', f'{name}: actual alpha required'
    assert im.getchannel('A').getextrema() == (0, 255)
    for row in range(rows):
        for col in range(4):
            cell = im.crop((round(col*im.width/4), round(row*im.height/rows),
                            round((col+1)*im.width/4), round((row+1)*im.height/rows)))
            alpha = cell.getchannel('A')
            opaque = alpha.point(lambda value: 255 if value > 96 else 0)
            bounds = opaque.getbbox()
            assert bounds, (name, row, col, 'empty cell')
            coverage = sum(alpha.histogram()[97:]) / (cell.width*cell.height)
            assert .1 < coverage < .75, (name, row, col, coverage)
            assert alpha.getpixel((0,0)) == 0, (name, row, col, 'opaque gutter')
    print(f'{name}: RGBA, {rows*4} populated cells, transparent gutters OK')

for item in json.loads((root / 'docs/visual-backup-v3/gameplay-hashes.json').read_text(encoding='utf-8-sig')):
    original_path = Path(item['Path'])
    path = root / original_path.relative_to(root)
    assert hashlib.sha256(path.read_bytes()).hexdigest().upper() == item['Hash'], path
print('Movement, combat, player, rewards and storage source hashes preserved.')

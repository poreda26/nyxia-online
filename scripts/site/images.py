"""Site görsellerini hazırlar: oyun görsellerinden küçük webp/jpg üretir (site/img/...).
Kullanım: python scripts/site/images.py
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'site', 'img')
for sub in ('regions', 'bestiary', 'chars', 'items'):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)


def load(path):
    return Image.open(os.path.join(SRC, path)).convert('RGBA')


def save_webp(img, rel, max_w=None, max_h=None, quality=82):
    img = img.copy()
    img.thumbnail((max_w or 10000, max_h or 10000), Image.LANCZOS)
    img.save(os.path.join(OUT, rel), 'WEBP', quality=quality, method=6)


# --- Büyük kapak görseli
arena = load('assets/battle/arena-v1.png').convert('RGB')
arena.thumbnail((1600, 1600), Image.LANCZOS)
arena.save(os.path.join(OUT, 'hero.jpg'), 'JPEG', quality=80, optimize=True)
w, h = load('assets/battle/arena-v1.png').size
og = load('assets/battle/arena-v1.png').convert('RGB').crop((0, int((h - w * 630 / 1200) / 2), w, int((h + w * 630 / 1200) / 2))).resize((1200, 630), Image.LANCZOS)
og.save(os.path.join(OUT, 'og.jpg'), 'JPEG', quality=82, optimize=True)

# --- Bölge arka planları (regions-v1: 3x2 ızgara)
regions = load('assets/battle/regions-v1.png')
cw, ch = regions.size[0] // 3, regions.size[1] // 2
order = ['fallow_valley', 'ashen_canyon', 'frostburn_summit', 'ruined_sanctuary', 'abyssal_pit', 'crimson_battlefront']
for i, map_id in enumerate(order):
    cell = regions.crop(((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch)).convert('RGB')
    cell.save(os.path.join(OUT, 'regions', map_id + '.webp'), 'WEBP', quality=84, method=6)

# --- Canavar sayfaları
sheets = {
    'ashen_canyon': 'assets/battle/ashen-v1.png', 'frostburn_summit': 'assets/battle/frost-v1.png', 'ruined_sanctuary': 'assets/battle/sanctuary-v1.png',
    'abyssal_pit': 'assets/battle/abyss-v1.png', 'crimson_battlefront': 'assets/battle/crimson-v1.png',
}
for map_id, path in sheets.items():
    save_webp(load(path), f'bestiary/{map_id}.webp', max_w=960)

actors = load('assets/battle/actors-v1.png')
aw, ah = actors.size
# Fallow Valley canavarları: sayfanın alt sırası
save_webp(actors.crop((0, int(ah * 0.69), aw, ah)), 'bestiary/fallow_valley.webp', max_w=960)

# --- Karakterler (alfa kanalından bileşenleri bulup kırp)
alpha = np.array(actors)[:, :, 3]
mask = (alpha > 40).astype(np.uint8)
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
count, labels, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
comps = [(i, tuple(stats[i][:4])) for i in range(1, count) if stats[i][4] > 15000 and stats[i][1] < ah * 0.66]
comps.sort(key=lambda c: (round((c[1][1] + c[1][3] / 2) / (ah * 0.34)), c[1][0]))
# Sıra: 1. satır: İnsan savaşçı, Ork savaşçı, İnsan okçu, Ork okçu; 2. satır: İnsan büyücü, Ork büyücü, (rahipler kaldırıldı)
names = ['warrior-human', 'warrior-orc', 'rogue-human', 'rogue-orc', 'mage-human', 'mage-orc']
if len(comps) < 6:
    print('UYARI: karakter sayısı beklenenden az:', len(comps), file=sys.stderr)
actors_np = np.array(actors)
for name, (label, (x, y, bw, bh)) in zip(names, comps):
    own = (labels == label).astype(np.uint8)  # yalnızca bu karakterin (genişletilmiş) alanı: komşu parçalar silinir
    cut = actors_np.copy()
    cut[:, :, 3] = np.where(own > 0, cut[:, :, 3], 0)
    pad = 8
    crop = Image.fromarray(cut).crop((max(0, x - pad), max(0, y - pad), min(aw, x + bw + pad), min(ah, y + bh + pad)))
    save_webp(crop, f'chars/{name}.webp', max_h=560)
boxes = comps

# --- Eşya simgeleri (build-site.mjs'in yazdığı liste)
manifest = os.path.join(OUT, 'manifest.json')
done = 0
if os.path.exists(manifest):
    for item in json.load(open(manifest, encoding='utf8'))['items']:
        src = os.path.join(SRC, item['src'])
        if not os.path.exists(src):
            continue
        if src.lower().endswith('.svg'):
            import shutil
            shutil.copyfile(src, os.path.join(OUT, 'items', item['key'] + '.svg'))
            done += 1
            continue
        img = Image.open(src).convert('RGBA')
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        save_webp(img, f"items/{item['key']}.webp", max_w=112, max_h=112, quality=88)
        done += 1
print('Görseller hazır. Eşya simgesi:', done, 'karakter kutusu:', len(boxes))

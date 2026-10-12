"""Nyxia Online: Android simgeleri, açılış ekranı ve mağaza grafikleri (store/) üretir.
Kaynak: src/assets/brand/nyxia-logo.png ve site/img/hero.jpg. Kullanım: python scripts/make-android-icons.py
"""
import os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
STORE = os.path.join(ROOT, 'store')
os.makedirs(STORE, exist_ok=True)

logo = Image.open(os.path.join(ROOT, 'src', 'assets', 'brand', 'nyxia-logo.png')).convert('RGB')
BG = logo.getpixel((3, 3))
BG = (max(BG[0], 8), max(BG[1], 8), max(BG[2], 12))
HEX = '#%02X%02X%02X' % BG

# Amblem (hilaller + mor taş): logonun üst kısmı. Koyu arka plan renk anahtarıyla şeffaflaştırılır (kutu görünmesin).
def keyed(img, lo=34, hi=96, soft=18):
    import numpy as np
    arr = np.asarray(img.convert('RGB')).astype('float32')
    peak = arr.max(axis=2)
    alpha = np.clip((peak - lo) / (hi - lo), 0, 1)
    alpha = alpha * alpha * (3 - 2 * alpha)
    a = Image.fromarray((alpha * 255).astype('uint8'), 'L')
    edge = Image.new('L', img.size, 0)
    ImageDraw.Draw(edge).rectangle((soft, soft, img.size[0] - soft, img.size[1] - soft), fill=255)
    edge = edge.filter(ImageFilter.GaussianBlur(soft * 0.6))
    from PIL import ImageChops
    out = img.convert('RGBA')
    out.putalpha(ImageChops.multiply(a, edge))
    return out

EMB = logo.crop((50, 0, 550, 322))
EMB_RGBA = keyed(EMB)


def emblem(width):
    h = round(EMB.size[1] * width / EMB.size[0])
    return EMB_RGBA.resize((width, h), Image.LANCZOS)


def glow_bg(size):
    img = Image.new('RGB', (size, size), BG)
    glow = Image.new('RGB', (size, size), (70, 30, 120))
    m = Image.new('L', (size, size), 0)
    ImageDraw.Draw(m).ellipse((size * .2, size * .25, size * .8, size * .75), fill=110)
    m = m.filter(ImageFilter.GaussianBlur(size * .12))
    img.paste(glow, (0, 0), m)
    return img


def master(size=1024):
    img = glow_bg(size).convert('RGBA')
    e = emblem(round(size * 0.80))
    img.alpha_composite(e, ((size - e.size[0]) // 2, (size - e.size[1]) // 2))
    return img


M = master(1024)
M.convert('RGB').resize((512, 512), Image.LANCZOS).save(os.path.join(STORE, 'icon-512.png'))


def rounded(img, size, radius_ratio=0.22, circle=False):
    img = img.resize((size, size), Image.LANCZOS)
    m = Image.new('L', (size * 4, size * 4), 0)
    d = ImageDraw.Draw(m)
    if circle:
        d.ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    else:
        d.rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=int(size * 4 * radius_ratio), fill=255)
    m = m.resize((size, size), Image.LANCZOS)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out


# Eski (legacy) ve yuvarlak simgeler
for folder, px in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    d = os.path.join(RES, f'mipmap-{folder}')
    rounded(M, px).save(os.path.join(d, 'ic_launcher.png'))
    rounded(M, px, circle=True).save(os.path.join(d, 'ic_launcher_round.png'))

# Uyarlanabilir simge: ön plan (amblem güvenli bölgede) + düz arka plan rengi
for folder, px in {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}.items():
    fg = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    e = emblem(round(px * 0.60))
    fg.alpha_composite(e, ((px - e.size[0]) // 2, (px - e.size[1]) // 2))
    fg.save(os.path.join(RES, f'mipmap-{folder}', 'ic_launcher_foreground.png'))

with open(os.path.join(RES, 'values', 'ic_launcher_background.xml'), 'w', encoding='utf8') as f:
    f.write(f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">{HEX}</color>\n</resources>\n')

# Açılış ekranı (Android 11 ve altı: drawable/splash.png; 12+: windowSplashScreen* öğeleri)
for dirname in sorted(os.listdir(RES)):
    if not (dirname == 'drawable' or dirname.startswith('drawable-port') or dirname.startswith('drawable-land')):
        continue
    p = os.path.join(RES, dirname, 'splash.png')
    if not os.path.exists(p):
        continue
    w, h = Image.open(p).size
    img = Image.new('RGB', (w, h), BG).convert('RGBA')
    e = emblem(round(min(w, h) * 0.62))
    img.alpha_composite(e, ((w - e.size[0]) // 2, (h - e.size[1]) // 2))
    img.convert('RGB').save(p)

# Android 12+ açılış simgesi (düz amblem, şeffaf)
si = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
e = emblem(round(432 * 0.60))
si.alpha_composite(e, ((432 - e.size[0]) // 2, (432 - e.size[1]) // 2))
si.save(os.path.join(RES, 'drawable', 'splash_icon.png'))

# Öne çıkan grafik 1024x500: oyun arka planı + logo
hero = Image.open(os.path.join(ROOT, 'site', 'img', 'hero.jpg')).convert('RGB')
fw, fh = 1024, 500
scale = max(fw / hero.size[0], fh / hero.size[1])
hero = hero.resize((round(hero.size[0] * scale), round(hero.size[1] * scale)), Image.LANCZOS)
left, top = (hero.size[0] - fw) // 2, (hero.size[1] - fh) // 2
fg_img = hero.crop((left, top, left + fw, top + fh)).convert('RGBA')
shade = Image.new('RGBA', (fw, fh), (BG[0], BG[1], BG[2], 150))
fg_img.alpha_composite(shade)
lg = keyed(logo, soft=10)
lh = 440
lw = round(lg.size[0] * lh / lg.size[1])
lg = lg.resize((lw, lh), Image.LANCZOS)
fg_img.alpha_composite(lg, ((fw - lw) // 2, (fh - lh) // 2))
fg_img.convert('RGB').save(os.path.join(STORE, 'feature-graphic.png'))
print('tamam', HEX)

"""Nyxia Online tanıtım fragmanı (site/trailer.mp4). Oyunun kendi görselleri ve müziğiyle üretilir.
Kullanım: python scripts/site/trailer.py [--poster-only]
"""
import math
import os
import random
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = os.path.join(ROOT, 'site')
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1280, 720, 30
TOTAL = 44.0
GOLD = (212, 175, 106)

random.seed(7)
np.random.seed(7)


def font(size, bold=True):
    return ImageFont.truetype(r'C:\Windows\Fonts\georgiab.ttf' if bold else r'C:\Windows\Fonts\georgia.ttf', size)


def load_rgb(path):
    return np.array(Image.open(os.path.join(ROOT, path)).convert('RGB'))


def load_rgba(path):
    return Image.open(os.path.join(ROOT, path)).convert('RGBA')


ARENA = load_rgb('src/assets/battle/arena-v1.png')
LOGO = load_rgba('site/nyxia-logo.png')
CHARS = {n: load_rgba(f'site/img/chars/{n}.webp') for n in ['warrior-human', 'warrior-orc', 'rogue-human', 'rogue-orc', 'mage-human', 'mage-orc']}
REGIONS = [(load_rgb(f'site/img/regions/{m}.webp'), name, lv) for m, name, lv in [
    ('fallow_valley', 'Fallow Valley', '1–15'), ('ashen_canyon', 'Ashen Canyon', '15–25'), ('frostburn_summit', 'Frostburn Summit', '25–40'),
    ('ruined_sanctuary', 'Ruined Sanctuary', '40–50'), ('abyssal_pit', 'Abyssal Pit', '50–60'), ('crimson_battlefront', 'Crimson Battlefront', '60–65')]]


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def kenburns(img, p, z0=1.0, z1=1.15, c0=(0.5, 0.5), c1=(0.5, 0.5)):
    bh, bw = img.shape[:2]
    zoom = z0 + (z1 - z0) * p
    cw = bw / zoom
    ch = cw * H / W
    if ch > bh:
        ch = bh / zoom
        cw = ch * W / H
    cx = (c0[0] + (c1[0] - c0[0]) * p) * bw
    cy = (c0[1] + (c1[1] - c0[1]) * p) * bh
    x0 = min(max(cx - cw / 2, 0), bw - cw)
    y0 = min(max(cy - ch / 2, 0), bh - ch)
    crop = img[int(y0):int(y0 + ch), int(x0):int(x0 + cw)]
    return cv2.resize(crop, (W, H), interpolation=cv2.INTER_CUBIC)


VIGNETTE = None


def vignette():
    global VIGNETTE
    if VIGNETTE is None:
        y, x = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        VIGNETTE = np.clip(1.0 - 0.55 * np.maximum(d - 0.35, 0) ** 1.4, 0.25, 1.0)[:, :, None]
    return VIGNETTE


def grade(frame, dark=0.0, tint=None):
    f = frame.astype(np.float32)
    if tint is not None:
        f = f * 0.78 + np.array(tint, np.float32) * 0.22
    f = f * (1.0 - dark) * vignette()
    return f


def paste(base, img, x, y, alpha=1.0, shadow=0.0):
    """RGBA PIL görselini float32 çerçevenin üstüne x,y'ye bırakır."""
    if alpha <= 0:
        return
    arr = np.array(img, np.float32)
    h, w = arr.shape[:2]
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + w, W), min(y + h, H)
    if x0 >= x1 or y0 >= y1:
        return
    sub = arr[y0 - y:y1 - y, x0 - x:x1 - x]
    a = (sub[:, :, 3:4] / 255.0) * alpha
    region = base[y0:y1, x0:x1]
    if shadow > 0:
        region *= (1 - a * shadow)
    base[y0:y1, x0:x1] = region * (1 - a) + sub[:, :, :3] * a


def text_layer(lines, size, color=(237, 232, 220), bold=True, anchor='ls', shadow=True):
    """Metin çizilmiş RGBA katman (tam çerçeve). lines: [(text, x, y)]"""
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    f = font(size, bold)
    for text, x, y in lines:
        if shadow:
            for dx, dy in ((3, 3), (2, 2), (0, 4)):
                d.text((x + dx, y + dy), text, font=f, fill=(0, 0, 0, 200), anchor=anchor)
        d.text((x, y), text, font=f, fill=color + (255,), anchor=anchor)
    return layer


def motes(base, t, n=70, alpha=0.55):
    rng = random.Random(3)
    for i in range(n):
        x0, y0 = rng.uniform(0, W), rng.uniform(0, H)
        sp, ph, r = rng.uniform(8, 26), rng.uniform(0, 6.28), rng.uniform(1.2, 3.0)
        x = (x0 + math.sin(t * 0.6 + ph) * 30) % W
        y = (y0 - sp * t) % H
        a = (0.35 + 0.65 * (0.5 + 0.5 * math.sin(t * 1.7 + ph))) * alpha
        cv2.circle(base, (int(x), int(y)), int(r) + 1, tuple(float(c) * a for c in GOLD[::-1][::-1]), -1, cv2.LINE_AA) if False else None
        xi, yi = int(x), int(y)
        if 2 <= xi < W - 2 and 2 <= yi < H - 2:
            base[yi - 1:yi + 2, xi - 1:xi + 2] = base[yi - 1:yi + 2, xi - 1:xi + 2] * (1 - a) + np.array(GOLD, np.float32) * a


def fade_edges(f, t, start, end, fin=0.5, fout=0.5):
    a = min(ease((t - start) / fin) if fin else 1.0, ease((end - t) / fout) if fout else 1.0)
    return f * a


def scene_intro(t):
    p = t / 9.0
    f = grade(kenburns(ARENA, p, 1.0, 1.22, (0.5, 0.55), (0.5, 0.45)), dark=0.18)
    motes(f, t)
    if t < 5.0:
        a = ease((t - 0.8) / 1.4) * (1 - ease((t - 4.1) / 0.8))
        s = 0.92 + 0.08 * ease((t - 0.8) / 2.5)
        logo = LOGO.resize((int(LOGO.width * 1.0 * s), int(LOGO.height * 1.0 * s)), Image.LANCZOS)
        paste(f, logo, W // 2 - logo.width // 2, H // 2 - logo.height // 2 - 20, a, shadow=0.0)
    else:
        a1 = ease((t - 5.0) / 0.9) * (1 - ease((t - 8.3) / 0.7))
        layer = text_layer([('Kendi efsaneni yaz.', W // 2, H // 2 + 10)], 78, anchor='ms')
        paste(f, layer, 0, 0, a1)
        layer2 = text_layer([('MOBİL ONLINE RPG', W // 2, H // 2 + 70)], 28, color=GOLD, anchor='ms')
        paste(f, layer2, 0, 0, ease((t - 5.6) / 0.9) * (1 - ease((t - 8.3) / 0.7)))
    return fade_edges(f, t, 0, 9, fin=1.0, fout=0.0)


CLASSES = [
    ('warrior', 'WARRIOR', 'Ön safın sağlam savaşçısı', (201, 122, 61), (0.3, 0.5)),
    ('rogue', 'ROGUE', 'Hızlı atışlar, ölümcül kritikler', (139, 111, 201), (0.55, 0.5)),
    ('mage', 'MAGE', 'Yıkıcı büyüler, en yüksek hasar', (79, 195, 217), (0.7, 0.5)),
]


def scene_class(t, index):
    key, title, desc, color, center = CLASSES[index]
    dur = 4.0
    p = t / dur
    f = grade(kenburns(ARENA, p, 1.12, 1.28, (center[0], 0.5), (center[0] + 0.05 * (1 if index % 2 else -1), 0.48)), dark=0.22, tint=color)
    motes(f, t + index * 7, n=40, alpha=0.4)
    h_h, h_o = CHARS[f'{key}-human'], CHARS[f'{key}-orc']
    target_h = 560
    human = h_h.resize((int(h_h.width * target_h / h_h.height), target_h), Image.LANCZOS)
    orc = h_o.resize((int(h_o.width * target_h / h_o.height), target_h), Image.LANCZOS)
    a_in = ease(t / 0.9)
    slide = (1 - a_in) * 140
    baseline = H - 50
    paste(f, human, int(W * 0.50 - human.width - 20 + slide * -1), baseline - human.height, a_in, shadow=0.0)
    paste(f, orc, int(W * 0.50 + 30 + slide), baseline - orc.height + 10, a_in)
    lt = ease((t - 0.5) / 0.7)
    layer = text_layer([(title, 70, 140)], 70, color=color, anchor='ls')
    paste(f, layer, int((1 - lt) * -60), 0, lt)
    layer2 = text_layer([(desc, 72, 188)], 30, bold=False, anchor='ls')
    paste(f, layer2, int((1 - lt) * -60), 0, lt)
    return fade_edges(f, t, 0, dur, fin=0.45, fout=0.45)


def scene_regions(t):
    dur = 10.0
    f = grade(kenburns(ARENA, t / dur, 1.15, 1.05), dark=0.55)
    cols, rows = 3, 2
    cw, ch, gap = 372, 262, 18
    x0 = (W - (cols * cw + (cols - 1) * gap)) // 2
    y0 = 170
    head = text_layer([('6 bölge · 65 seviye', W // 2, 88)], 46, anchor='ms')
    paste(f, head, 0, 0, ease(t / 0.8))
    sub = text_layer([('Her bölgenin kendi canavarları, bossları ve zindanı', W // 2, 128)], 24, color=GOLD, bold=False, anchor='ms')
    paste(f, sub, 0, 0, ease((t - 0.3) / 0.8))
    for i, (img, name, lv) in enumerate(REGIONS):
        st = 0.9 + i * 0.7
        a = ease((t - st) / 0.6)
        if a <= 0:
            continue
        c, r = i % cols, i // cols
        card = Image.fromarray(img).convert('RGBA').resize((cw, ch), Image.LANCZOS)
        d = ImageDraw.Draw(card)
        d.rectangle((0, ch - 62, cw, ch), fill=(0, 0, 0, 170))
        d.text((16, ch - 36), name, font=font(24), fill=(255, 255, 255, 255), anchor='lm')
        d.text((16, ch - 14), f'Seviye {lv}', font=font(16, False), fill=GOLD + (255,), anchor='lm')
        d.rectangle((0, 0, cw - 1, ch - 1), outline=GOLD + (190,), width=2)
        s = 0.9 + 0.1 * a
        card = card.resize((int(cw * s), int(ch * s)), Image.LANCZOS)
        paste(f, card, x0 + c * (cw + gap) + (cw - card.width) // 2, y0 + r * (ch + gap) + (ch - card.height) // 2, a)
    return fade_edges(f, t, 0, dur, fin=0.5, fout=0.5)


FEATURES = [
    'Klan zindanları ve boss savaşları',
    'Savaş alanı ve haftalık sıralama',
    '6 kalitede silah, zırh, kanat ve setler',
    'Oyuncu pazarı ve eşya geliştirme',
    'Hep çevrimiçi: ilerlemen hesabında',
]


def scene_features(t):
    dur = 7.0
    f = grade(kenburns(ARENA, t / dur, 1.25, 1.1, (0.5, 0.4), (0.4, 0.5)), dark=0.5)
    motes(f, t + 20, n=50, alpha=0.5)
    y = 190
    for i, line in enumerate(FEATURES):
        st = 0.5 + i * 0.9
        a = ease((t - st) / 0.6)
        layer = text_layer([('•', 252, y + i * 82), (line, 300, y + i * 82)], 44, anchor='ls')
        paste(f, layer, int((1 - a) * 70), 0, a)
    return fade_edges(f, t, 0, dur, fin=0.5, fout=0.5)


def scene_end(t):
    dur = 6.0
    f = grade(kenburns(ARENA, t / dur, 1.2, 1.0), dark=0.3)
    motes(f, t + 40, n=80, alpha=0.6)
    a = ease(t / 1.0)
    logo = LOGO.resize((int(LOGO.width * 0.8), int(LOGO.height * 0.8)), Image.LANCZOS)
    paste(f, logo, W // 2 - logo.width // 2, 60, a)
    layer = text_layer([('nyxiaonline.com', W // 2, 530)], 56, anchor='ms')
    paste(f, layer, 0, 0, ease((t - 0.8) / 0.9))
    layer2 = text_layer([('Yakında Google Play ve App Store\'da', W // 2, 590)], 30, color=GOLD, bold=False, anchor='ms')
    paste(f, layer2, 0, 0, ease((t - 1.5) / 0.9))
    return fade_edges(f, t, 0, dur, fin=0.6, fout=1.2)


SCENES = [(0.0, 9.0, scene_intro)] + [(9.0 + 4.0 * i, 13.0 + 4.0 * i, (lambda i: lambda t: scene_class(t, i))(i)) for i in range(3)] + [(21.0, 31.0, scene_regions), (31.0, 38.0, scene_features), (38.0, 44.0, scene_end)]


def frame_at(t):
    for start, end, fn in SCENES:
        if start <= t < end or (fn is SCENES[-1][2] and t >= start):
            return fn(t - start)
    return np.zeros((H, W, 3), np.float32)


def to_u8(f):
    grain = np.random.normal(0, 3.0, f.shape).astype(np.float32)
    return np.clip(f + grain, 0, 255).astype(np.uint8)


def main():
    poster_only = '--poster-only' in sys.argv
    os.makedirs(os.path.join(SITE, 'img'), exist_ok=True)
    poster = to_u8(frame_at(6.3))
    Image.fromarray(poster).save(os.path.join(SITE, 'img', 'trailer-poster.jpg'), quality=85, optimize=True)
    if poster_only:
        return
    video = os.path.join(SITE, '_trailer_silent.mp4')
    cmd = [FF, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', video]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    total = int(TOTAL * FPS)
    for i in range(total):
        proc.stdin.write(to_u8(frame_at(i / FPS)).tobytes())
        if i % 150 == 0:
            print(f'{i}/{total}', flush=True)
    proc.stdin.close()
    proc.wait()
    audio = os.path.join(ROOT, 'src', 'assets', 'audio', 'mist-valley.mp3')
    out = os.path.join(SITE, 'trailer.mp4')
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', video, '-ss', '3', '-t', str(TOTAL), '-i', audio,
                    '-af', f'afade=t=in:d=2.5,afade=t=out:st={TOTAL - 3.5}:d=3.5,volume=2.4,alimiter=limit=0.9', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], check=True)
    os.remove(video)
    print('Fragman hazır:', out, round(os.path.getsize(out) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()

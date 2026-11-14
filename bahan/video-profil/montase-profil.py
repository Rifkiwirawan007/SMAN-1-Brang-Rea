#!/usr/bin/env python3
"""Montase video profil SMAN 1 Brang Rea (gaya promo Pertamina: potongan cepat berirama, kilatan putih hanya di pergantian bagian).

Sumber: sumber.mp4 (YouTube 1PU1U5qi0J4, 1280x720). Watermark "DI KURASI / LOMBA PEMBUATAN VIDEO
PROFIL SEKOLAH" di x>=1070, y 570-640: setiap potongan dijaga tidak menyentuh area itu.
Hasil: profil-hd.mp4 (1920x1080), profil-hp.mp4 (540x960), profil-poster.jpg.
"""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FF = glob.glob(os.path.expanduser("~/.hermes/tools/ffmpeg-*/ffmpeg"))[0]
FONT = "PlusJakartaSans.ttf"
LOGO = "/Users/rifkiwirawan/Documents/WEB APP/SMAN 1 Brang Rea/public/images/logo-sman1brangrea.png"
TOTAL = 20.0

# (detik sumber, durasi, potongan lanskap, x potongan potret, zoom)
# Lanskap A: w=1056,h=594,x=0,y=0..126 (kanan watermark terbuang). B: w=996,h=560,y=0,x=0..284 (bawah terbuang).
# zoom: +n = perlahan mendekat n%, -n = perlahan menjauh n%.
SHOTS = [
    (48.0, 1.5, ("A", 63), 437, 5),      # 0 drone lapangan upacara       | SELAMAT DATANG
    (41.6, 1.0, ("A", 63), 437, -5),     # 1 drone atap sekolah           | SELAMAT DATANG
    (190.4, 1.6, ("A", 63), 437, 6),     # 2 drone barisan upacara        | SMAN 1 BRANG REA (garis -> isi)
    (33.2, 1.0, ("B", 142), "utuh", 4),  # 3 gerbang (papan nama sudah bertuliskan nama sekolah: tanpa judul)
    (69.6, 0.8, ("A", 63), 250, 6),      # 4 siswi bermotor masuk gerbang
    (94.3, 0.6, ("A", 40), 300, 8),      # 5 lab bahasa, headset
    (103.0, 0.9, ("A", 63), 437, -6),    # 6 praktik lab sains
    (299.5, 0.6, ("A", 63), 437, 8),     # 7 lab komputer
    (302.8, 0.8, ("A", 63), 300, 6),     # 8 praktik kimia, siswi berjas lab
    (114.8, 0.7, ("A", 63), 437, -6),    # 9 kelas seni lukis
    (238.6, 1.0, ("A", 30), 430, 5),     # 10 senam, instruktur di depan
    (390.2, 1.2, ("B", 142), 330, 5),    # 11 paskibra hormat              | BERPRESTASI • BERKARAKTER
    (382.6, 0.7, ("A", 63), 600, 8),     # 12 plakat & medali
    (373.6, 0.9, ("A", 63), 437, -6),    # 13 lemari piala                  |
    (309.5, 1.1, ("A", 63), 437, 6),     # 14 drone: tari formasi lingkaran | SUMBAWA BARAT, NTB
    (519.4, 0.8, ("A", 63), 230, 6),     # 15 penyanyi bertopi merah        |
    (522.6, 0.7, ("A", 63), 300, -6),    # 16 busana adat                   |
    (23.2, 1.0, ("A", 63), 437, 5),      # 17 tari di lapangan
    (538.8, 1.0, ("A", 126), 437, -4),   # 18 foto bersama di depan gedung
    (241.5, 2.1, ("A", 63), 437, 4),     # 19 penutup: lapangan hijau (digelapkan) + kartu
]
assert abs(sum(s[1] for s in SHOTS) - TOTAL) < 1e-6, sum(s[1] for s in SHOTS)
POTONG = []
t = 0.0
for s in SHOTS[:-1]:
    t += s[1]
    POTONG.append(round(t, 3))
AKHIR = POTONG[-1]  # mulai kartu penutup


def awal(k):
    """Detik mulai shot ke-k di video hasil."""
    return 0.0 if k == 0 else POTONG[k - 1]


# Judul: (teks lanskap, teks potret, mulai, selesai)
JUDUL = [
    ("SELAMAT DATANG", "SELAMAT\nDATANG", 0.3, awal(2) - 0.12),
    ("BERPRESTASI  •  BERKARAKTER", "BERPRESTASI\nBERKARAKTER", awal(11) + 0.15, awal(14) - 0.12),
    ("SUMBAWA BARAT, NTB", "SUMBAWA BARAT\nNTB", awal(14) + 0.15, awal(17) - 0.12),
]
# Frasa bergaris (outline) yang bergeser, lalu terisi penuh.
GESER = ("SMAN 1 BRANG REA", "SMAN 1\nBRANG REA", awal(2) + 0.12, awal(3) - 0.1)
# Kilatan putih HANYA di pergantian bagian (bukan di setiap potongan).
KILAT = [awal(11), awal(14), AKHIR]

def font(px, berat="ExtraBold"):
    f = ImageFont.truetype(FONT, px)
    f.set_variation_by_name(berat)
    return f


def teks_png(path, teks, px, W, H, spasi=0.08, garis=False, latar=True, lebar_maks=0.84):
    """Teks di tengah kanvas transparan WxH, dengan bayangan lembut. Otomatis mengecil bila terlalu lebar."""
    while True:
        f = font(px)
        baris = teks.split("\n")
        track = int(px * spasi)
        def lebar(b):
            return sum(f.getlength(c) for c in b) + track * (len(b) - 1)
        if max(lebar(b) for b in baris) <= W * lebar_maks or px < 14:
            break
        px -= 2
    tinggi_baris = int(px * 1.12)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    if latar:  # bayangan gelap lembut di belakang teks agar terbaca
        bg = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(bg)
        lw = max(lebar(b) for b in baris) * 0.62 + px
        lh = tinggi_baris * len(baris) * 0.9 + px
        d.ellipse((W / 2 - lw, H / 2 - lh, W / 2 + lw, H / 2 + lh), fill=105)
        bg = bg.filter(ImageFilter.GaussianBlur(px * 1.2))
        im.paste((0, 0, 0, 255), (0, 0), bg)
    lapis = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lapis)
    y0 = H / 2 - tinggi_baris * len(baris) / 2
    for i, b in enumerate(baris):
        x = W / 2 - lebar(b) / 2
        y = y0 + i * tinggi_baris
        for c in b:
            if garis:
                d.text((x, y), c, font=f, fill=(0, 0, 0, 0), stroke_width=max(2, px // 28), stroke_fill=(255, 255, 255, 255))
            else:
                d.text((x, y), c, font=f, fill=(255, 255, 255, 255))
            x += f.getlength(c) + track
    bay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bay.paste((0, 0, 0, 150), (0, 0), lapis.split()[3].filter(ImageFilter.GaussianBlur(max(3, px // 10))))
    im = Image.alpha_composite(im, bay)
    im = Image.alpha_composite(im, lapis)
    im.save(path)


def kartu_png(path, W, H, potret):
    """Kartu penutup: logo + nama + wilayah, garis siku kiri-bawah."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    s = W / 1920 if not potret else W / 1080 * 1.25
    logo = Image.open(LOGO).convert("RGBA")
    ukuran = int((120 if not potret else 150) * s)
    logo = logo.resize((ukuran, ukuran), Image.LANCZOS)
    f1, f2 = font(int(54 * s)), font(int(24 * s), "SemiBold")
    nama, wil = "SMAN 1 BRANG REA", "DESA BERU  •  BRANG REA  •  SUMBAWA BARAT, NTB" if not potret else "SUMBAWA BARAT, NTB"
    d = ImageDraw.Draw(im)
    if not potret:
        x0, yc = int(W * 0.14), H // 2
        im.alpha_composite(logo, (x0, yc - ukuran // 2))
        tx = x0 + ukuran + int(36 * s)
        d.text((tx, yc - int(52 * s)), nama, font=f1, fill="white")
        d.text((tx, yc + int(16 * s)), wil, font=f2, fill=(255, 255, 255, 220))
        g = int(4 * s)
        d.rectangle((x0 - int(40 * s), yc - int(110 * s), x0 - int(40 * s) + g, yc + int(110 * s)), fill="white")
        d.rectangle((x0 - int(40 * s), yc + int(110 * s) - g, x0 + int(260 * s), yc + int(110 * s)), fill="white")
    else:
        yc = int(H * 0.46)
        im.alpha_composite(logo, (W // 2 - ukuran // 2, yc - ukuran - int(10 * s)))
        for teks, f, y in ((nama, f1, yc + int(20 * s)), (wil, f2, yc + int(20 * s) + int(70 * s))):
            d.text((W / 2 - f.getlength(teks) / 2, y), teks, font=f, fill="white")
        g = int(4 * s)
        x0 = int(W * 0.12)
        d.rectangle((x0, yc - int(230 * s), x0 + g, yc + int(160 * s)), fill="white")
        d.rectangle((x0, yc + int(160 * s) - g, x0 + int(170 * s), yc + int(160 * s)), fill="white")
    im.save(path)


def render(potret):
    W, H = (540, 960) if potret else (1920, 1080)
    px = 40 if potret else 62  # ukuran judul: sengaja tidak besar
    nama = "hp" if potret else "hd"
    os.makedirs("png", exist_ok=True)
    png = []
    for i, (l, p, a, b) in enumerate(JUDUL):
        f = f"png/{nama}-judul{i}.png"
        teks_png(f, p if potret else l, px, W, H)
        png.append((f, a, b, "tengah"))
    # frasa bergeser: outline (lebih lebar dari layar agar bisa digeser), lalu versi isi
    l, p, a, b = GESER
    tengah = round(a + (b - a) * 0.5, 2)
    teks_png(f"png/{nama}-garis.png", p if potret else l, px + (4 if potret else 8), W, H, garis=True, latar=True, lebar_maks=0.9)
    teks_png(f"png/{nama}-isi.png", p if potret else l, px + (4 if potret else 8), W, H, lebar_maks=0.9)
    png.append((f"png/{nama}-garis.png", a, tengah, "geser"))
    png.append((f"png/{nama}-isi.png", tengah - 0.05, b, "tengah"))
    kartu_png(f"png/{nama}-kartu.png", W, H, potret)
    gelap = Image.new("RGBA", (W, H), (0, 0, 0, 140))
    gelap.save(f"png/{nama}-gelap.png")
    png.append((f"png/{nama}-gelap.png", AKHIR + 0.05, TOTAL, "tengah"))
    png.append((f"png/{nama}-kartu.png", AKHIR + 0.35, TOTAL, "tengah"))

    args = [FF, "-hide_banner", "-loglevel", "error", "-y"]
    for s0, dur, *_ in SHOTS:
        args += ["-ss", f"{s0}", "-t", f"{dur + 0.2}", "-i", "sumber.mp4"]
    for f, a, b, _ in png:
        args += ["-loop", "1", "-t", f"{TOTAL}", "-i", f]
    fc = []
    for k, (s0, dur, (jenis, pos), xp, zoom) in enumerate(SHOTS):
        if potret and xp == "utuh":
            # papan nama terlalu lebar untuk potongan tegak: tampilkan utuh di tengah di atas salinan buramnya
            fc.append(
                f"[{k}:v]fps=30,trim=duration={dur},setpts=PTS-STARTPTS,crop=996:560:{pos}:0,hqdn3d=1.5:1.5:3:3,split[g{k}a][g{k}b];"
                f"[g{k}a]scale=-2:{H},crop={W}:{H},boxblur=20:2,eq=brightness=-0.12[g{k}l];"
                f"[g{k}b]scale={W}:-2:flags=lanczos,unsharp=5:5:0.4[g{k}d];"
                f"[g{k}l][g{k}d]overlay=0:(H-h)/2,setsar=1,format=yuv420p[v{k}]"
            )
            continue
        if potret:
            assert 0 <= xp <= 1066 - 405
            cr = f"crop=405:720:{xp}:0"
        elif jenis == "A":
            assert 0 <= pos <= 126
            cr = f"crop=1056:594:0:{pos}"
        else:
            assert 0 <= pos <= 284
            cr = f"crop=996:560:{pos}:0"
        n = round(dur * 30)
        z = abs(zoom) / 100
        zexp = f"1+{z}*on/{n}" if zoom > 0 else f"1+{z}*(1-on/{n})"
        # zoompan pada kanvas 1,5x agar gerak perbesarannya halus (tidak bergetar per piksel)
        W2, H2 = int(W * 1.5) // 2 * 2, int(H * 1.5) // 2 * 2
        fc.append(
            f"[{k}:v]fps=30,trim=duration={dur},setpts=PTS-STARTPTS,{cr},hqdn3d=1.5:1.5:3:3,"
            f"scale={W2}:{H2}:flags=lanczos,"
            f"zoompan=z='{zexp}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps=30,"
            f"unsharp=5:5:0.5,setsar=1,format=yuv420p[v{k}]"
        )
    fc.append("".join(f"[v{k}]" for k in range(len(SHOTS))) + f"concat=n={len(SHOTS)}:v=1:a=0[dasar]")
    cur = "dasar"
    n0 = len(SHOTS)
    for j, (f, a, b, mode) in enumerate(png):
        i = n0 + j
        fade = f"fade=t=in:st={a}:d=0.3:alpha=1,fade=t=out:st={b - 0.3:.2f}:d=0.3:alpha=1" if b < TOTAL - 0.01 else f"fade=t=in:st={a}:d=0.4:alpha=1"
        fc.append(f"[{i}:v]format=rgba,{fade}[t{j}]")
        if mode == "geser":
            # dari kiri ke tengah, melambat (ease-out)
            jarak = 90 if potret else 260
            x = f"-{jarak}*pow(1-min(1,(t-{a})/({b}-{a})),2)"
        else:
            x = "0"
        fc.append(f"[{cur}][t{j}]overlay=x='{x}':y=0:enable='between(t,{a},{b})':eval=frame[o{j}]")
        cur = f"o{j}"
    # kilatan putih di setiap pergantian klip: naik cepat sebelum potongan, turun pelan sesudahnya
    suku = []
    for c in KILAT:
        suku.append(f"0.9*if(lt(t,{c}),exp(-pow(({c}-t)/0.035,2)),exp(-pow((t-{c})/0.15,2)))")
    kilat = "min(1," + "+".join(suku) + ")"
    fc.append(f"[{cur}]eq=brightness='-0.03+{kilat}':contrast=1.08:saturation=1.05:eval=frame,format=yuv420p[keluar]")
    graf = ";".join(fc)
    open(f"filter-{nama}.txt", "w").write(graf)
    out = f"profil-{nama}.mp4"
    args += ["-/filter_complex", f"filter-{nama}.txt", "-map", "[keluar]", "-t", f"{TOTAL}", "-an",
             "-c:v", "libx264", "-preset", "slow", "-crf", "23" if not potret else "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    r = subprocess.run(args)
    if r.returncode:
        sys.exit(r.returncode)
    print(out, os.path.getsize(out) // 1024, "KB")


if __name__ == "__main__":
    pilih = sys.argv[1:] or ["hd", "hp"]
    if "hd" in pilih:
        render(False)
    if "hp" in pilih:
        render(True)

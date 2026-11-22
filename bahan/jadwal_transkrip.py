"""Transkripsi jadwal pelajaran semester ganjil 2026/2027 dari foto WhatsApp sekolah."""
import json

KELAS = ["X-1", "X-2", "X-3", "X-4", "X-5", "XI-1", "XI-2", "XI-3", "XI-4", "XI-5", "XII-1", "XII-2", "XII-3", "XII-4"]

# Jam umum (Senin-Kamis, Sabtu). Jam ke-2 di foto tertulis 07.25-08.00 -> diduga salah ketik, dipakai 08.25-09.00.
JAM_UMUM = {1: ("07:50", "08:25"), 2: ("08:25", "09:00"), 3: ("09:00", "09:35"), 4: ("09:50", "10:25"),
            5: ("10:25", "11:00"), 6: ("11:00", "11:35"), 7: ("11:50", "12:25"), 8: ("12:25", "13:00")}
JAM_JUMAT = {1: ("08:00", "08:35"), 2: ("08:35", "09:10"), 3: ("09:10", "09:45"), 4: ("10:00", "10:35"), 5: ("10:35", "11:15")}

T = {
    "senin": [
        [9, 4, 38, 10, 20, 33, 3, 24, 24, 29, 18, 8, 17, 42],
        [9, 4, 38, 10, 20, 33, 3, 24, 24, 29, 18, 8, 17, 42],
        [9, 4, 38, 42, 20, 29, 31, 24, 24, 32, 18, 8, 12, 6],
        [19, 40, 10, 42, 27, 29, 31, 14, 4, 32, 2, 18, 12, 6],
        [19, 40, 10, 42, 27, 35, 29, 14, 4, 23, 2, 18, 12, 6],
        [1, 40, 33, 36, 27, 35, 29, 14, 4, 23, 8, 6, 15, 16],
        [1, 13, 33, 36, 10, 31, 35, 12, 23, 19, 8, 6, 15, 16],
        [1, 13, 33, 36, 10, 31, 35, 12, 23, 19, 8, 6, 15, 16],
    ],
    "selasa": [
        [13, 38, 27, 8, 10, 5, 18, 4, 12, 22, 24, 24, 2, 31],
        [13, 38, 27, 8, 10, 5, 18, 4, 12, 22, 24, 24, 2, 31],
        [42, 38, 27, 8, 39, 5, 18, 4, 12, 22, 24, 24, 25, 19],
        [42, 27, 8, 35, 39, 18, 33, 29, 14, 7, 11, 9, 25, 19],
        [42, 27, 8, 35, 39, 18, 33, 29, 14, 7, 11, 9, 19, 2],
        [39, 27, 8, 41, 26, 18, 1, 6, 14, 4, 15, 9, 19, 2],
        [39, 10, 19, 41, 26, 31, 1, 6, 29, 4, 15, 2, 7, 23],
        [39, 10, 19, 41, 26, 31, 1, 6, 29, 4, 15, 2, 7, 23],
    ],
    "rabu": [
        [10, 13, 40, 20, 33, 38, 38, 12, 29, 24, 2, 18, 25, 15],
        [10, 13, 40, 20, 33, 38, 38, 12, 29, 24, 2, 18, 25, 15],
        [28, 8, 40, 20, 33, 38, 38, 12, 4, 24, 9, 18, 25, 15],
        [28, 8, 36, 32, 19, 1, 3, 14, 4, 5, 9, 30, 16, 25],
        [28, 8, 36, 32, 19, 1, 3, 14, 35, 5, 9, 30, 16, 25],
        [21, 33, 36, 40, 41, 1, 3, 28, 35, 5, 6, 30, 16, 25],
        [21, 33, 10, 40, 41, 29, 31, 28, 32, 4, 6, 19, 2, 12],
        [21, 33, 10, 40, 41, 29, 31, 28, 32, 4, 6, 19, 2, 12],
    ],
    "kamis": [
        [34, 10, 13, 38, 36, 18, 29, 7, 5, 41, 35, 2, 24, 25],
        [34, 10, 13, 38, 36, 18, 29, 7, 5, 41, 35, 2, 24, 25],
        [34, 39, 21, 38, 36, 23, 1, 35, 5, 41, 7, 30, 24, 31],
        [4, 39, 21, 10, 32, 23, 1, 35, 19, 17, 7, 30, 6, 31],
        [4, 39, 21, 10, 32, 3, 18, 29, 19, 17, 8, 31, 6, 7],
        [4, 20, 42, 33, 40, 3, 18, 29, 36, 17, 8, 31, 6, 7],
        [10, 20, 42, 33, 40, 19, 7, 32, 36, 22, 31, 8, 16, 35],
        [10, 20, 42, 33, 40, 19, 7, 32, 36, 22, 31, 8, 16, 35],
    ],
    "jumat": [
        [37, 19, 26, 27, 38, 3, 33, 5, 7, 32, 18, 15, 31, 12],
        [37, 19, 26, 27, 38, 3, 33, 5, 7, 32, 18, 15, 31, 12],
        [20, 42, 26, 27, 38, 3, 33, 5, 6, 36, 11, 15, 17, 12],
        [20, 42, 35, 19, 32, 1, 23, 4, 6, 36, 11, 7, 17, 2],
        [20, 42, 35, 19, 32, 1, 23, 4, 6, 36, 11, 7, 17, 2],
    ],
    "sabtu": [
        [38, 37, 39, 26, 42, 33, 6, 32, 14, 29, 9, 35, 23, 24],
        [38, 37, 39, 26, 42, 33, 6, 32, 14, 29, 9, 35, 23, 24],
        [38, 21, 39, 26, 42, 33, 6, 19, 12, 36, 23, 31, 35, 24],
        [27, 21, 13, 39, 8, 7, 5, 19, 12, 36, 23, 31, 35, 16],
        [27, 21, 13, 39, 8, 7, 5, 23, 32, 35, 19, 9, 31, 16],
        [27, 25, 20, 39, 8, 6, 5, 23, 32, 35, 19, 9, 31, 42],
        [13, 25, 20, 32, 35, 6, 19, 28, 36, 17, 31, 23, 12, 42],
        [13, 25, 20, 32, 35, 6, 19, 28, 36, 17, 31, 23, 12, 42],
    ],
}

GURU = [
    (1, "Humaidi, S.Pd.", "Biologi"), (2, "Ainurrahmi, S.Pd.", "Matematika"), (3, "Ainurrahmi, S.Pd.", "Matematika Lanjut"),
    (4, "Drs. Bambang Purwanta", "Sosiologi"), (5, "Afrianingsih, S.Pd.", "Bahasa Inggris"), (6, "Asmarawati, S.Pd.", "Pendidikan Agama Islam"),
    (7, "Mohammad Saipuddin, S.Pd., M.", "Sejarah"), (8, "Darmika, S.Pd.", "Biologi"), (9, "Hasnawati, S.Pd.", "Fisika"),
    (10, "M. Kasyudin, S.Pd.", "Matematika"), (11, "M. Kasyudin, S.Pd.", "Matematika Lanjut"), (12, "Fitriani, S.E.", "Ekonomi"),
    (13, "Desy Fasriatin, S.Pd.", "Bahasa Indonesia"), (14, "Desy Fasriatin, S.Pd.", "Bahasa Indonesia Lanjut"),
    (15, "Benny Budiawan Arzamnur, S.", "Bahasa Inggris"), (16, "Eka Prihatin, S.Pd., M.Pd.", "Sosiologi"),
    (17, "Eka Prihatin, S.Pd., M.Pd.", "Antropologi"), (18, "Cinintya Ramanda Pratiwi, S.Pd.", "Kimia"),
    (19, "Eka Andam Dewi, S.Pd.", "Seni Budaya"), (20, "Siti Aisyah, S.Pd.", "Bahasa Inggris"), (21, "Siti Aisyah, S.Pd.", "Pendidikan Agama Islam"),
    (22, "Bidawansari, S.Pd.", "Ekonomi"), (23, "Bidawansari, S.Pd.", "Prakarya"), (24, "Dedy Wahyudin, S.Pd.", "Penjaskes"),
    (25, "Novitasari, S.Pd.", "Geografi"), (26, "Novitasari, S.Pd.", "Sosiologi"), (27, "Hilmiati, S.Pd.", "Ekonomi"),
    (28, "Hilmiati, S.Pd.", "Geografi"), (29, "Lilik Fitria Ningsih, S.Pd.", "Matematika"), (30, "Lilik Fitria Ningsih, S.Pd.", "Matematika Lanjut"),
    (31, "Satria Nofebriansyah, S.Pd.", "Bahasa Indonesia"), (32, "Eni Nuraini, S.Pd.", "Bahasa Indonesia"),
    (33, "Eti Sulastri, S.Pd.", "Fisika"), (34, "Eti Sulastri, S.Pd.", "Kimia"), (35, "Yuliana Putri, S.Pd.", "PKN"),
    (36, "Rahmah, S.Pd.", "Geografi"), (37, "Rahmah, S.Pd.", "PKN"), (38, "Heriyanto, S.Pd.", "Penjaskes"),
    (39, "Nova Ordalita, S.Pd.", "Sejarah"), (40, "Nova Ordalita, S.Pd.", "Kimia"),
    (41, "Muhammad Imam Afisi, S.Pd.", "Pendidikan Agama Islam"), (42, "Muhammad Imam Afisi, S.Pd.", "Informatika"),
    (43, "Adenan Taurik, S.Pd.", "BP/BK"), (44, "Lisdayanti, S.Pd.", "BP/BK"), (45, "Nursaid, S.Pd.", "BP/BK"),
]

kode = {k for k, *_ in GURU}
for hari, baris in T.items():
    assert len(baris) == (5 if hari == "jumat" else 8), hari
    for b in baris:
        assert len(b) == 14 and all(x in kode for x in b), (hari, b)

# cek bentrok: satu guru (nama) di >1 kelas pada jam yang sama
nama_kode = {k: n for k, n, _ in GURU}
for hari, baris in T.items():
    for j, b in enumerate(baris, 1):
        per = {}
        for kls, k in zip(KELAS, b):
            per.setdefault(nama_kode[k], []).append(f"{kls}({k})")
        for n, v in per.items():
            if len(v) > 1:
                print("BENTROK", hari, "jam", j, n, v)

out = {
    "tahunAjaran": "2026/2027", "semester": "Ganjil",
    "jam": {"umum": {str(k): list(v) for k, v in JAM_UMUM.items()}, "jumat": {str(k): list(v) for k, v in JAM_JUMAT.items()}},
    "guru": [{"kode": k, "nama": n, "mapel": m} for k, n, m in GURU],
    "jadwal": {h: {kls: [b[i] for b in baris] for i, kls in enumerate(KELAS)} for h, baris in T.items()},
}
json.dump(out, open("/Users/rifkiwirawan/.hermes/cache/scratch/xl/jadwal.json", "w"), ensure_ascii=False, indent=1)
print("ok", len(set(n for _, n, _ in GURU)), "guru unik")

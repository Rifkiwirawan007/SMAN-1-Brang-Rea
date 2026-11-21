# Panduan Online: SMA Negeri 1 Brang Rea

Website dipasang di VPS (DomaiNesia Cloud VPS Lite 2GB, Ubuntu 24.04).
Setelah disiapkan sekali, setiap **push ke branch `main`** otomatis meng-update website online.

```
VS Code  --push-->  GitHub  --GitHub Actions-->  VPS
                                                  /srv/sman1/current   kode versi aktif (diganti tiap update)
                                                  /srv/sman1/data      isi dashboard: berita, foto, akun, absensi (TIDAK disentuh update)
                                                  /srv/sman1/backup    backup harian data (14 hari)
```

## Aturan penting

- **Kode** (tampilan, fitur, desain): ubah di VS Code, lalu commit dan push.
- **Isi** (berita, agenda, foto, data siswa): ubah lewat **dashboard website online**, bukan dari file `data/` di laptop.
  Folder `data/` di laptop hanya data contoh untuk mencoba-coba; tidak dikirim ke server saat update.
- Kalau build gagal (ada error), website **tetap memakai versi lama**. Cek tab **Actions** di GitHub untuk melihat errornya.
- Kalau versi baru gagal menyala, server otomatis **kembali ke versi sebelumnya**.

---

## A. Penyiapan sekali di awal

### 1. Beli layanan (akun atas nama & email resmi sekolah)
- DomaiNesia **Cloud VPS Lite 2GB**, sistem operasi **Ubuntu 24.04**, **tanpa panel**.
- Domain **sman1brangrea.sch.id** (dokumen: surat kepala sekolah + KTP penanggung jawab, surat kuasa bila diwakilkan).
- Catat **alamat IP** VPS dari email/dashboard DomaiNesia.

### 2. Buat kunci SSH di laptop (sekali saja)
Di Terminal Mac:
```bash
ssh-keygen -t ed25519 -C "laptop-rifki"        # tekan Enter terus
ssh-copy-id root@IP_SERVER                      # masukkan sandi root dari DomaiNesia (ketik sendiri)
ssh root@IP_SERVER                              # sekarang bisa masuk tanpa sandi
```

### 3. Siapkan server
Masih di dalam server (`ssh root@IP_SERVER`):
```bash
curl -fsSL https://raw.githubusercontent.com/Rifkiwirawan007/SMAN-1-Brang-Rea/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh
```
- Tanpa domain, website dapat alamat uji `https://IP-DENGAN-STRIP.sslip.io` (sudah https, kamera absensi bisa dites).
- Di akhir, layar menampilkan isi untuk GitHub Secrets dan perintah menampilkan kunci.

### 4. Isi GitHub Secrets
GitHub > repo **SMAN-1-Brang-Rea** > Settings > Secrets and variables > Actions > New repository secret:

| Nama | Isi |
|--|--|
| `VPS_HOST` | alamat IP server |
| `VPS_SSH_KEY` | hasil `cat /root/kunci-github-actions` (dari `-----BEGIN` sampai `END-----`) |

Setelah disalin, hapus file kunci di server: `rm /root/kunci-github-actions`.

### 5. Kirim data awal (sekali saja)
Dari folder proyek di laptop:
```bash
bash deploy/kirim-data.sh IP_SERVER
```
Skrip menolak mengirim bila server sudah berisi data, supaya data online tidak tertimpa.

### 6. Deploy pertama
GitHub > tab **Actions** > **Deploy ke VPS** > **Run workflow**. Tunggu centang hijau (sekitar 3-5 menit), lalu buka alamat website.

### 7. Setelah domain .sch.id aktif
1. Di pengelola DNS domain: buat record **A** `@` -> IP server dan **A** `www` -> IP server.
2. Di server: `bash setup-server.sh sman1brangrea.sch.id` (https untuk domain dibuat otomatis).
3. Jalankan ulang workflow **Deploy ke VPS** supaya alamat situs baru ikut ter-build.

---

## B. Update rutin (setelah online)

1. Ubah kode di VS Code, cek di `npm run dev`.
2. Source Control > tulis pesan > **Commit** > **Sync/Push**.
3. Tunggu 2-4 menit. Progres terlihat di GitHub tab **Actions**.

Push lagi sebelum update sebelumnya selesai? Aman, deploy dijalankan berurutan.

## C. Perintah berguna di server

```bash
ssh sekolah@IP_SERVER
pm2 status                       # website jalan atau tidak
pm2 logs sman1 --lines 100       # lihat log / error
pm2 restart sman1                # nyalakan ulang
ls /srv/sman1/releases           # 3 versi terakhir yang tersimpan
ls /srv/sman1/backup             # backup harian data
DATA_DIR=/srv/sman1/data node /srv/sman1/current/scripts/reset-sandi.mjs   # reset sandi dashboard
```

Kembali ke versi sebelumnya secara manual:
```bash
cd /srv/sman1 && ls -1t releases        # pilih folder versi lama
ln -sfn /srv/sman1/releases/NAMA_FOLDER current.baru && mv -Tf current.baru current
pm2 restart sman1
```

## D. Backup

- Otomatis setiap hari jam 02.30 WITA ke `/srv/sman1/backup` (disimpan 14 hari).
- Salinan ke laptop (lakukan rutin, misalnya tiap minggu, lalu upload ke Google Drive sekolah):
  ```bash
  bash deploy/ambil-backup.sh IP_SERVER
  ```

## E. Isi file di folder deploy/

| File | Fungsi |
|--|--|
| `setup-server.sh` | menyiapkan VPS sekali (Node, PM2, Caddy/https, firewall, swap, backup harian) |
| `deploy.sh` | dijalankan GitHub Actions: build versi baru, aktifkan, cek, kembali ke versi lama bila gagal |
| `ecosystem.config.cjs` | pengaturan PM2 (menjaga website tetap menyala) |
| `backup.sh` | backup harian folder data |
| `kirim-data.sh` | kirim data awal dari laptop ke server (sekali) |
| `ambil-backup.sh` | salin data server ke laptop |
| `../.github/workflows/deploy.yml` | alur otomatis push -> deploy |

Folder `bahan/` (foto mentah) tidak ikut dikirim ke server (`.gitattributes`).

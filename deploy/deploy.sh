#!/usr/bin/env bash
# Pasang versi baru website di VPS (dijalankan otomatis oleh GitHub Actions, user "sekolah").
#
#   bash deploy.sh <commit-sha>
#
# Alur: ambil arsip kode dari incoming/ -> folder rilis baru -> npm ci -> build
#       -> pindahkan "current" ke rilis baru -> restart PM2 -> cek website hidup
#       -> kalau gagal, kembali ke rilis lama. Folder data/ TIDAK pernah disentuh.
set -euo pipefail

APP_DIR="${APP_DIR:-/srv/sman1}"
APP_PORT="${APP_PORT:-3000}"
PM2_NAMA="${PM2_NAMA:-sman1}"
SIMPAN_RILIS="${SIMPAN_RILIS:-3}"
export APP_DIR APP_PORT PM2_NAMA # dibaca ecosystem.config.cjs

SHA="${1:?Pakai: deploy.sh <commit-sha>}"
ARSIP="$APP_DIR/incoming/$SHA.tgz"
REL="$APP_DIR/releases/$(date +%Y%m%d-%H%M%S)-${SHA:0:7}"
log() { printf '\n==> %s\n' "$*"; }

[ -f "$ARSIP" ] || { echo "Arsip $ARSIP tidak ada." >&2; exit 1; }
[ -f "$APP_DIR/shared/.env" ] || { echo "$APP_DIR/shared/.env belum ada (jalankan setup-server.sh dulu)." >&2; exit 1; }

# Hanya satu deploy dalam satu waktu.
exec 9>"$APP_DIR/.deploy.lock"
flock -w 900 9 || { echo "Deploy lain masih berjalan." >&2; exit 1; }

log "Membongkar kode ${SHA:0:7} ke $REL"
mkdir -p "$REL"
tar -xzf "$ARSIP" -C "$REL"
rm -f "$ARSIP"

# Pengaturan rahasia (DATA_DIR, ADMIN_RAHASIA, dll.) dibaca Next.js dari .env.production.local.
ln -sfn "$APP_DIR/shared/.env" "$REL/.env.production.local"
# Penanda versi: browser lama otomatis muat ulang penuh setelah update (version skew).
printf 'NEXT_DEPLOYMENT_ID=%s\n' "${SHA:0:12}" > "$REL/.env.production"

SEBELUM="$(readlink -f "$APP_DIR/current" 2>/dev/null || true)"
# Pakai ulang cache build rilis sebelumnya supaya build lebih cepat.
if [ -n "$SEBELUM" ] && [ -d "$SEBELUM/.next/cache" ]; then
  mkdir -p "$REL/.next"
  cp -a "$SEBELUM/.next/cache" "$REL/.next/cache"
fi

# Hapus lalu start dari ecosystem rilis aktif, supaya perubahan pengaturan PM2 ikut terpakai
# (pm2 restart memakai pengaturan lama yang tersimpan). Jeda mati hanya beberapa detik.
jalankan_pm2() {
  pm2 delete "$PM2_NAMA" >/dev/null 2>&1 || true
  # Gagal start tidak langsung menghentikan skrip: pengecekan di bawah yang memutuskan rollback.
  pm2 start "$APP_DIR/current/deploy/ecosystem.config.cjs" --update-env >/dev/null || echo "PM2 gagal menyalakan rilis ini." >&2
  pm2 save >/dev/null || true
}

gagal_build() {
  echo "Build gagal. Website tetap memakai versi lama." >&2
  rm -rf "$REL"
  exit 1
}

cd "$REL"
log "Memasang paket (npm ci)"
npm ci --no-audit --no-fund || gagal_build

log "Build Next.js"
NODE_OPTIONS="--max-old-space-size=1536" NEXT_TELEMETRY_DISABLED=1 npm run build || gagal_build

log "Mengaktifkan rilis baru"
ln -sfn "$REL" "$APP_DIR/current.baru"
mv -Tf "$APP_DIR/current.baru" "$APP_DIR/current"
jalankan_pm2

log "Mengecek website"
hidup=0
for _ in $(seq 1 30); do
  if curl -fsS -o /dev/null --max-time 10 "http://127.0.0.1:$APP_PORT/"; then hidup=1; break; fi
  sleep 2
done

if [ "$hidup" -ne 1 ]; then
  echo "Website tidak merespons setelah update." >&2
  if [ -n "$SEBELUM" ] && [ -d "$SEBELUM" ]; then
    echo "Kembali ke rilis sebelumnya: $SEBELUM" >&2
    ln -sfn "$SEBELUM" "$APP_DIR/current.baru"
    mv -Tf "$APP_DIR/current.baru" "$APP_DIR/current"
    jalankan_pm2
  fi
  rm -rf "$REL"
  exit 1
fi

log "Membersihkan rilis lama (simpan $SIMPAN_RILIS terbaru)"
cd "$APP_DIR/releases"
ls -1dt -- */ 2>/dev/null | tail -n +"$((SIMPAN_RILIS + 1))" | while read -r lama; do
  [ "$(readlink -f "$lama")" = "$(readlink -f "$APP_DIR/current")" ] || rm -rf -- "$lama"
done

log "Selesai: versi ${SHA:0:7} sudah online."

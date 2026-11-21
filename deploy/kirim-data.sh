#!/usr/bin/env bash
# Kirim folder data/ dari laptop ke server, SEKALI saja sebelum website online.
#
#   bash deploy/kirim-data.sh <ip-server>
#   bash deploy/kirim-data.sh <ip-server> --paksa   -> timpa walau server sudah berisi data
#
# Setelah online, isi website diubah lewat dashboard. Jangan kirim ulang tanpa --paksa,
# karena data di server (berita, absensi, akun) akan tertimpa data laptop.
set -euo pipefail
HOST="${1:?Pakai: bash deploy/kirim-data.sh <ip-server> [--paksa]}"
PAKSA="${2:-}"
TUJUAN="sekolah@$HOST:/srv/sman1/data/"
cd "$(dirname "$0")/.."

isi="$(ssh "sekolah@$HOST" 'ls -A /srv/sman1/data 2>/dev/null | wc -l')"
if [ "$isi" -gt 0 ] && [ "$PAKSA" != "--paksa" ]; then
  echo "Server sudah berisi data. Tidak dikirim supaya data online tidak tertimpa."
  echo "Kalau memang mau menimpa: bash deploy/kirim-data.sh $HOST --paksa"
  exit 1
fi

echo "Mengirim data/ ke $TUJUAN ..."
rsync -az --stats --exclude '.DS_Store' data/ "$TUJUAN"
ssh "sekolah@$HOST" 'chmod 750 /srv/sman1/data && find /srv/sman1/data/privat -type f -exec chmod 600 {} + 2>/dev/null || true'
echo "Selesai. Deploy ulang (push / jalankan workflow) supaya halaman memakai data ini."

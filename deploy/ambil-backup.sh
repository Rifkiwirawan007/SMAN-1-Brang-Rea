#!/usr/bin/env bash
# Salin data terbaru dari server ke laptop (cadangan tambahan di luar server).
#
#   bash deploy/ambil-backup.sh <ip-server>
#
# Hasil: ~/Documents/Backup SMAN 1 Brang Rea/<tanggal>/ (simpan juga ke Google Drive sekolah).
set -euo pipefail
HOST="${1:?Pakai: bash deploy/ambil-backup.sh <ip-server>}"
TUJUAN="$HOME/Documents/Backup SMAN 1 Brang Rea/$(date +%Y-%m-%d_%H%M)"
mkdir -p "$TUJUAN"
rsync -az --stats "sekolah@$HOST:/srv/sman1/data/" "$TUJUAN/data/"
echo "Backup tersimpan di: $TUJUAN"

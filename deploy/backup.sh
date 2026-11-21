#!/usr/bin/env bash
# Backup harian folder data (isi dashboard, foto unggahan, akun, absensi). Dijalankan cron di server.
set -euo pipefail
APP_DIR="${APP_DIR:-/srv/sman1}"
SIMPAN_HARI="${SIMPAN_HARI:-14}"
TUJUAN="$APP_DIR/backup"
NAMA="data-$(date +%Y-%m-%d_%H%M).tgz"

mkdir -p "$TUJUAN"
tar -czf "$TUJUAN/$NAMA.sementara" -C "$APP_DIR" data
mv "$TUJUAN/$NAMA.sementara" "$TUJUAN/$NAMA"
find "$TUJUAN" -name 'data-*.tgz' -mtime +"$SIMPAN_HARI" -delete
echo "$(date '+%F %T') backup $NAMA ($(du -h "$TUJUAN/$NAMA" | cut -f1))"

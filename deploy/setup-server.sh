#!/usr/bin/env bash
# Penyiapan VPS sekali di awal (Ubuntu 24.04, dijalankan sebagai root).
#
#   bash setup-server.sh                       -> pakai alamat uji otomatis <ip>.sslip.io
#   bash setup-server.sh sman1brangrea.sch.id  -> pakai domain sekolah
#
# Yang dipasang: swap 2 GB, zona waktu WITA, firewall, fail2ban, update keamanan otomatis,
# Node.js 22, PM2, Caddy (https otomatis), user "sekolah", folder /srv/sman1, backup harian.
# Aman dijalankan ulang (mis. untuk ganti domain): yang sudah ada tidak ditimpa, kecuali Caddyfile.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Jalankan sebagai root." >&2; exit 1; }

APP_DIR=/srv/sman1
PENGGUNA=sekolah
log() { printf '\n==> %s\n' "$*"; }

IP="$(curl -4fsS https://ifconfig.me || curl -4fsS https://api.ipify.org)"
DOMAIN="${1:-${IP//./-}.sslip.io}"

log "Update sistem dan paket dasar"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git rsync ufw fail2ban unattended-upgrades ca-certificates gnupg \
  debian-keyring debian-archive-keyring apt-transport-https openssl

log "Zona waktu WITA"
timedatectl set-timezone Asia/Makassar

log "Swap 2 GB (supaya build tidak kehabisan RAM)"
if ! swapon --show | grep -q '/swapfile'; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
sysctl -p /etc/sysctl.d/99-swap.conf

log "Node.js 22 dan PM2"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm install -g pm2@latest

log "Caddy (server web + sertifikat https otomatis)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

log "User '$PENGGUNA' untuk menjalankan website"
if ! id "$PENGGUNA" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$PENGGUNA"
fi
install -d -m 700 -o "$PENGGUNA" -g "$PENGGUNA" "/home/$PENGGUNA/.ssh"
touch "/home/$PENGGUNA/.ssh/authorized_keys"
# Kunci SSH laptopmu (yang dipakai masuk sebagai root) ikut boleh masuk sebagai "sekolah".
if [ -f /root/.ssh/authorized_keys ]; then
  while read -r baris; do
    [ -n "$baris" ] && ! grep -qxF "$baris" "/home/$PENGGUNA/.ssh/authorized_keys" && echo "$baris" >> "/home/$PENGGUNA/.ssh/authorized_keys"
  done < /root/.ssh/authorized_keys
fi
# Kunci khusus GitHub Actions (hanya dibuat sekali).
KUNCI=/root/kunci-github-actions
if [ ! -f "$KUNCI" ]; then
  ssh-keygen -t ed25519 -N "" -C "github-actions-deploy" -f "$KUNCI" >/dev/null
  cat "$KUNCI.pub" >> "/home/$PENGGUNA/.ssh/authorized_keys"
fi
chown "$PENGGUNA:$PENGGUNA" "/home/$PENGGUNA/.ssh/authorized_keys"
chmod 600 "/home/$PENGGUNA/.ssh/authorized_keys"

log "Folder aplikasi $APP_DIR"
install -d -o "$PENGGUNA" -g "$PENGGUNA" "$APP_DIR" "$APP_DIR/releases" "$APP_DIR/incoming" "$APP_DIR/shared" "$APP_DIR/backup"
install -d -m 750 -o "$PENGGUNA" -g "$PENGGUNA" "$APP_DIR/data"

ENVF="$APP_DIR/shared/.env"
if [ ! -f "$ENVF" ]; then
  cat > "$ENVF" <<EOF
# Pengaturan rahasia website (JANGAN dibagikan / di-commit).
DATA_DIR=$APP_DIR/data
NEXT_PUBLIC_URL_SITUS=https://$DOMAIN
ADMIN_RAHASIA=$(openssl rand -hex 48)
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF
else
  # Jalankan ulang dengan domain baru -> perbarui alamat situs (perlu deploy ulang supaya ikut ter-build).
  sed -i "s#^NEXT_PUBLIC_URL_SITUS=.*#NEXT_PUBLIC_URL_SITUS=https://$DOMAIN#" "$ENVF"
fi
chown "$PENGGUNA:$PENGGUNA" "$ENVF"
chmod 600 "$ENVF"

log "Caddyfile untuk $DOMAIN"
WWW=""
case "$DOMAIN" in
  *.sslip.io) ;;
  *) WWW="www.$DOMAIN {
	redir https://$DOMAIN{uri} permanent
}" ;;
esac
cat > /etc/caddy/Caddyfile <<EOF
# Dibuat oleh setup-server.sh. Ganti domain: bash setup-server.sh <domain-baru>
$DOMAIN {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000 {
		# Next.js mengirim halaman bertahap (streaming); jangan ditahan.
		flush_interval -1
	}
	header {
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		-Server
	}
	log {
		output file /var/log/caddy/sman1.log {
			roll_size 10MiB
			roll_keep 5
		}
	}
}
$WWW
EOF
caddy fmt --overwrite /etc/caddy/Caddyfile
systemctl enable caddy
systemctl reload caddy || systemctl restart caddy

log "Firewall (SSH, http, https)"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

log "fail2ban dan update keamanan otomatis"
systemctl enable --now fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

log "PM2 menyala otomatis saat server restart"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$PENGGUNA" --hp "/home/$PENGGUNA" >/dev/null

log "Backup data harian jam 02.30 WITA (disimpan 14 hari)"
cat > /etc/cron.d/sman1-backup <<EOF
30 2 * * * $PENGGUNA [ -f $APP_DIR/current/deploy/backup.sh ] && bash $APP_DIR/current/deploy/backup.sh >> $APP_DIR/backup/backup.log 2>&1
EOF

cat <<EOF

=====================================================================
 Server siap.  Alamat website: https://$DOMAIN
=====================================================================
Isi GitHub > repo > Settings > Secrets and variables > Actions:
  VPS_HOST     = $IP
  VPS_SSH_KEY  = isi file kunci di bawah ini (dari -----BEGIN sampai END-----)

Tampilkan kuncinya (salin, lalu HAPUS file-nya):
  cat $KUNCI
  rm $KUNCI

Langkah berikutnya: kirim data awal dari laptop (deploy/kirim-data.sh),
lalu push ke GitHub atau jalankan workflow "Deploy ke VPS" secara manual.
EOF

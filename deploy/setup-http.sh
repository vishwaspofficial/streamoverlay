#!/usr/bin/env bash
set -euo pipefail

DOMAIN="vepo.in"

apt-get update
apt-get install -y nginx

mkdir -p "/var/www/$DOMAIN"
chown -R "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" "/var/www/$DOMAIN" || true

cp "$(dirname "$0")/nginx-vepo.in.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "HTTP is configured at http://$DOMAIN"
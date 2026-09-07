#!/usr/bin/env bash
set -euo pipefail

DOMAIN="vepo.in"
EMAIL="${1:-}"

if [[ -z "$EMAIL" ]]; then
  echo "Usage: sudo bash deploy/setup-https.sh you@example.com"
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run this script with sudo."
  exit 1
fi

apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

mkdir -p "/var/www/$DOMAIN"
chown -R "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" "/var/www/$DOMAIN" || true

cp "$(dirname "$0")/nginx-vepo.in.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

certbot --nginx \
  --non-interactive \
  --agree-tos \
  --no-eff-email \
  --email "$EMAIL" \
  --redirect \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

systemctl enable --now certbot.timer
echo "HTTPS is configured for https://$DOMAIN"
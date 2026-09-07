#!/usr/bin/env bash
set -euo pipefail

DOMAIN="vepo.in"

apt-get update
apt-get install -y nginx python3-venv rsync

mkdir -p "/var/www/$DOMAIN"
rsync -a --delete --exclude '.git/' --exclude '.venv/' ./ "/var/www/$DOMAIN/"
chown -R "${SUDO_USER:-ubuntu}:${SUDO_USER:-ubuntu}" "/var/www/$DOMAIN" || true

python3 -m venv "/var/www/$DOMAIN/.venv"
"/var/www/$DOMAIN/.venv/bin/pip" install --upgrade pip
"/var/www/$DOMAIN/.venv/bin/pip" install -r "/var/www/$DOMAIN/requirements.txt"
"/var/www/$DOMAIN/.venv/bin/python" "/var/www/$DOMAIN/manage.py" migrate --noinput
"/var/www/$DOMAIN/.venv/bin/python" "/var/www/$DOMAIN/manage.py" collectstatic --noinput

cp "$(dirname "$0")/focusroom.service" /etc/systemd/system/focusroom.service
systemctl daemon-reload
systemctl enable --now focusroom

cp "$(dirname "$0")/nginx-vepo.in.conf" "/etc/nginx/sites-available/$DOMAIN"
ln -sfn "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "HTTP is configured at http://$DOMAIN"
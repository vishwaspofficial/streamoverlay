# Deployment

This is a static 1280x720 overlay. GitHub Actions deploys the repository to `/var/www/vepo.in` on the configured Ubuntu/nginx host whenever `main` changes.

## GitHub Actions secrets

Add these repository secrets:

- `DEPLOY_HOST`: `13.60.95.118`
- `DEPLOY_USER`: your non-root Ubuntu SSH user
- `DEPLOY_SSH_KEY`: the private key whose public key is installed in that user's `~/.ssh/authorized_keys`

## One-time EC2 setup

```bash
sudo mkdir -p /var/www/vepo.in
sudo chown -R "$USER":"$USER" /var/www/vepo.in
sudo apt update
sudo apt install -y nginx
sudo cp deploy/nginx-vepo.in.conf /etc/nginx/sites-available/vepo.in
sudo ln -s /etc/nginx/sites-available/vepo.in /etc/nginx/sites-enabled/vepo.in
sudo nginx -t
sudo systemctl reload nginx
```

Point the `vepo.in` and `www.vepo.in` DNS A records to `13.60.95.118`. After DNS resolves, enable HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d vepo.in -d www.vepo.in
```
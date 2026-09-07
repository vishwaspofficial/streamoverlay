# Deployment

This is a static 1280x720 overlay. GitHub Actions deploys the repository to `/var/www/vepo.in` on the configured Ubuntu/nginx host whenever `main` changes.

## GitHub Actions secrets

Add these repository secrets:

- `DEPLOY_HOST`: `13.60.95.118`
- `DEPLOY_USER`: your non-root Ubuntu SSH user
- `DEPLOY_SSH_KEY`: the private key whose public key is installed in that user's `~/.ssh/authorized_keys`

## One-time EC2 setup

After allowing SSH (22), HTTP (80), and HTTPS (443) in the EC2 security group, copy the repository to the server and run the HTTPS setup script:

```bash
ssh ubuntu@13.60.95.118
sudo apt update && sudo apt install -y git
git clone https://github.com/vishwaspofficial/streamoverlay.git
cd streamoverlay
sudo bash deploy/setup-https.sh you@example.com
```

The domain must already resolve to `13.60.95.118` before Certbot runs. The script configures nginx, requests certificates for `vepo.in` and `www.vepo.in`, redirects HTTP to HTTPS, and enables automatic renewal.

For manual setup without Certbot:

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
sudo certbot --nginx -d vepo.in -d www.vepo.in --redirect
```
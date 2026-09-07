# Deployment

This is a static 1280x720 overlay. GitHub Actions deploys the repository to `/var/www/vepo.in` on the configured Ubuntu/nginx host whenever `main` changes.

The shared control page is available at `http://vepo.in/control.html`; OBS should use `http://vepo.in/`.

## Shared state setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase-schema.sql` from this repository.
3. In Supabase Project Settings -> API, copy the Project URL and the public anon key.
4. On EC2, create the ignored runtime config:

```bash
cd /var/www/vepo.in
cp supabase-config.example.js supabase-config.js
nano supabase-config.js
```

Set the file contents to:

```js
window.OVERLAY_SUPABASE_CONFIG = {
	url: 'https://YOUR_PROJECT.supabase.co',
	anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

`supabase-config.js` is intentionally excluded from GitHub and from the deployment sync, so future CI/CD deployments preserve it on EC2. The public anon key is designed for browser use; never put a Supabase service-role key in this file.

## GitHub Actions secrets

Add these repository secrets:

- `DEPLOY_HOST`: `16.192.142.60`
- `DEPLOY_USER`: your non-root Ubuntu SSH user
- `DEPLOY_SSH_KEY`: the private key whose public key is installed in that user's `~/.ssh/authorized_keys`

## One-time EC2 setup

After allowing SSH (22) and HTTP (80) in the EC2 security group, copy the repository to the server and run the HTTP-only setup script:

```bash
ssh ubuntu@16.192.142.60
sudo apt update && sudo apt install -y git
git clone https://github.com/vishwaspofficial/streamoverlay.git
cd streamoverlay
sudo bash deploy/setup-http.sh
```

The domain must already resolve to `16.192.142.60`. This configures nginx at `http://vepo.in` without HTTPS or Certbot.

When DNSSEC is fixed later, replace the HTTP setup with:

```bash
sudo bash deploy/setup-https.sh you@example.com
```

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

Point the `vepo.in` and `www.vepo.in` DNS A records to `16.192.142.60`. After DNS resolves, enable HTTPS with Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d vepo.in -d www.vepo.in --redirect
```
# PDFOrca — Production Deployment Guide (VPS + Docker Compose)

This deploys the full stack on one Linux VPS (2 vCPU / 4 GB RAM tested):
Nginx (TLS) -> Next.js frontend + FastAPI backend, with Redis for rate-limit
storage. MongoDB runs on **Atlas (cloud)**, not on the box.

```
Internet -> Nginx (443 TLS) -> /api/* -> backend (Gunicorn, 2 workers) -> Redis
                            -> /*     -> frontend (Next.js standalone)
backend also calls: MongoDB Atlas (cloud), Groq API (AI, cloud)
```

---

## 1. One-time VPS setup

```bash
# Ubuntu 22.04+
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker

# Swap as an OOM safety net on a 4 GB box
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Firewall: only SSH + HTTP + HTTPS
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw --force enable
```

**DNS:** point an A-record for `pdforca.com` (and `www`) at the VPS IP.

**MongoDB Atlas:** create a free/shared cluster, add the VPS IP to the
Network Access allowlist, copy the SRV connection string.

**Groq:** get a free API key at https://console.groq.com (no card needed).

---

## 2. Configure secrets

```bash
git clone <your-repo> pdforca && cd pdforca
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

Fill in:
- `JWT_SECRET` — run `openssl rand -hex 32`
- `ADMIN_TOKEN` — run `openssl rand -hex 24`
- `MONGO_URL` — your Atlas SRV string
- `GROQ_API_KEY` — your Groq key
- `CORS_ORIGINS` — your real domains

The backend **refuses to boot** in production with insecure defaults, so this
step is enforced for you.

---

## 3. Issue TLS certificates (first time)

The Nginx config expects certs under `nginx/certbot/conf`. Bootstrap them:

```bash
mkdir -p nginx/certbot/www nginx/certbot/conf

# Start nginx alone so the ACME challenge can be served over :80.
# (Temporarily comment out the 443 server block in nginx/nginx.conf for the
#  very first issue, or use --standalone on a host certbot — your choice.)
docker compose up -d nginx

docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d pdforca.com -d www.pdforca.com --email you@example.com --agree-tos --no-eff-email

# Re-enable the 443 block if you commented it out, then reload.
docker compose restart nginx
```

Auto-renew (cron): `0 3 * * * cd /path/pdforca && docker compose run --rm certbot renew && docker compose restart nginx`

---

## 4. Build and launch

```bash
docker compose up -d --build
docker compose ps          # all services should become healthy
docker compose logs -f backend   # watch first boot
```

---

## 5. Verify

```bash
curl https://pdforca.com/health          # {"status":"healthy"}
curl https://pdforca.com/api/limits       # JSON with upload limits
```

Then in a browser test one tool per category:
- **merge-pdf** (fast path)
- **pdf-to-jpg** (Poppler)
- **word-to-pdf** (LibreOffice — proves the Linux binary resolves)
- **ai-tools** (Groq cloud)

**Event-loop block test (the Phase 1 payoff):** start a large word-to-pdf
in one tab, immediately hit `/health` in another — it should respond
instantly. Before Phase 1 it would hang.

**Load test:**
```bash
k6 run -e BASE_URL=https://pdforca.com scripts/loadtest.k6.js
```
Target: `/health` p95 < 500ms under load, 0% 5xx. Seeing 429s on heavy
endpoints is correct (rate limiting), not an error.

**Reboot test:** `sudo reboot`, then `docker compose ps` — everything should
come back up on its own (`restart: unless-stopped`).

---

## 6. Tuning notes (2 vCPU / 4 GB)

- `WEB_CONCURRENCY=2` (2 Gunicorn UvicornWorkers) — each has its own thread
  pool, so blocking conversions never freeze the loop (Phase 1).
- `HEAVY_JOB_CONCURRENCY=1` — at most 2 heavy jobs (AI/OCR/LibreOffice) across
  the box at once, matching the 2 cores. Raise on a bigger VPS.
- AI uses Groq cloud, so `torch`/`transformers` are intentionally NOT in the
  Linux image (they'd OOM a 4 GB box). The code falls back gracefully.
- Redis capped at 256 MB with LRU eviction; MongoDB offloaded to Atlas.

---

## 7. Updating after a code change

```bash
git pull
docker compose up -d --build
```

---

## 8. Scaling beyond this box

- More capacity on the same box: `docker compose up -d --scale backend=3`
  and add an Nginx `upstream` entry per replica.
- Bigger traffic: move to a larger VPS (bump `WEB_CONCURRENCY` /
  `HEAVY_JOB_CONCURRENCY`), or a second VPS with shared Redis + Nginx LB.
- Very long jobs (huge OCR / batch): **Phase 2b** — add Celery + Redis queue
  + S3 object storage. That changes the frontend to a poll-for-result model
  (the current hook downloads synchronously).

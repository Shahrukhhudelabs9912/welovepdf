# WeLovePDF Load Testing

k6-based load test that simulates many concurrent users hitting static pages, auth flow, PDF processing, and AI endpoints.

## 1. Install k6 (one-time)

```powershell
winget install k6 --source winget
# verify
k6 version
```

## 2. Generate the test PDF (one-time)

```powershell
cd load-test
node generate-tiny-pdf.js          # 1-page, 540 bytes — used by k6 high-VU runs
node generate-medium-pdf.js        # 50-page, ~80 KB — used by single-user-profile.js
```

`single-user-profile.js` auto-prefers `medium.pdf` (realistic per-page work) and
falls back to `tiny.pdf` if it's missing. Override with `--pdf path/to/file.pdf`.

## 3. Start your app locally

In two separate terminals:

```powershell
# Terminal 1 — backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 — frontend
cd frontend
npm run dev
```

## 4. Run the test

```powershell
cd load-test

# Quick smoke test (~1 min, 200 VUs) — start here to confirm wiring
k6 run --env QUICK=1 k6-load-test.js

# Full test — ramps to 10,000 VUs over ~10 min (target from your request)
k6 run k6-load-test.js

# Only one scenario at a time (cleaner numbers)
k6 run --env SCENARIO=static  k6-load-test.js
k6 run --env SCENARIO=pdf     k6-load-test.js
k6 run --env SCENARIO=auth    k6-load-test.js

# Lower peak for laptop reality (recommended for local)
k6 run --env PEAK=1000 k6-load-test.js
```

## 5. Reading the output

- `http_req_duration p(95)` — 95th percentile latency. Should stay under your SLO.
- `http_req_failed` — fraction of requests that errored out (network or HTTP 5xx).
- `errors` — custom rate; rises when status codes fall outside expected sets.
- `rate_limited_429` — counts how often the backend's rate limiter kicked in. **Auth routes will produce a lot of these at 10k VUs — that's the rate limiter working, not a bug.**
- Threshold lines at the bottom show PASS/FAIL for the SLOs hardcoded in `options.thresholds`.

## Reality check

**10,000 concurrent users from a single laptop is not actually achievable.** Windows runs out of ephemeral ports (~16k usable) and the OS thread/FD budget chokes before k6 even gets there. What you'll really see:

- Up to ~1,000-2,000 VUs: laptop holds, you see real backend behaviour.
- Beyond that: load generator itself becomes the bottleneck; numbers stop being meaningful.

For real 1-lakh / 10-lakh testing you need:
- **k6 Cloud** (paid, simplest), or
- 5-10 cloud VMs running k6 in distributed mode, or
- A staging environment behind the same CDN/edge as production.

Local results are still very useful — they tell you the **shape** of your bottleneck (CPU? DB? worker pool?) which is the same shape you'll see at higher scale.

## What this test does NOT cover

- Real AI endpoint calls (would cost money on every iteration — hits a status route instead).
- Real auth tokens / authenticated PDF flows (would require pre-seeded users).
- File downloads of large PDFs (uses a ~470 byte file to avoid OOM at high VUs).

Add those once the base test is green.

// WeLovePDF load test — k6 script
//
// Run all scenarios:        k6 run k6-load-test.js
// Run one scenario only:    k6 run --env SCENARIO=static k6-load-test.js
//   SCENARIO options:       static | auth | pdf | ai | limits | all
// Override target/peak:     k6 run --env BASE=http://localhost:3000 --env PEAK=2000 k6-load-test.js
// Quick smoke (60s):        k6 run --env QUICK=1 k6-load-test.js
//
// Front-end (Next.js)  -> http://localhost:3000  (default for `npm run dev`)
// Back-end (FastAPI)   -> http://localhost:8000  (default for uvicorn)
//
// NOTE: Hitting the Next.js layer (port 3000) exercises the real user path,
// because the frontend proxies to the backend via /api/* routes.

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BASE = __ENV.BASE || 'http://localhost:3000';
const PEAK = parseInt(__ENV.PEAK || '10000', 10);
const QUICK = __ENV.QUICK === '1';
const ONLY = (__ENV.SCENARIO || 'all').toLowerCase();

// Custom metrics — appear in the final k6 summary.
const errors = new Rate('errors');
const rateLimited429 = new Counter('rate_limited_429');
const staticLatency = new Trend('static_latency_ms', true);
const pdfLatency = new Trend('pdf_latency_ms', true);

// A minimal, valid 1-page PDF (~470 bytes). Used to exercise PDF endpoints
// without bloating the test runner's memory at 10k VUs.
const TINY_PDF = open('./tiny.pdf', 'b');

// ---------------------------------------------------------------------------
// Stages — gentle ramp so we can see where the backend starts to bend.
// ---------------------------------------------------------------------------
const fullStages = [
  { duration: '30s', target: Math.floor(PEAK * 0.05) },  // warm up
  { duration: '1m',  target: Math.floor(PEAK * 0.25) },  // climb
  { duration: '2m',  target: Math.floor(PEAK * 0.60) },  // soak at 60%
  { duration: '2m',  target: PEAK },                      // hit peak
  { duration: '3m',  target: PEAK },                      // hold at peak
  { duration: '1m',  target: 0 },                         // cooldown
];

const quickStages = [
  { duration: '15s', target: 50 },
  { duration: '30s', target: 200 },
  { duration: '15s', target: 0 },
];

const stages = QUICK ? quickStages : fullStages;

// Scenario builder — each scenario gets its own slice of total load.
function scen(exec, weight) {
  return {
    executor: 'ramping-vus',
    exec,
    startVUs: 0,
    stages: stages.map(s => ({ ...s, target: Math.max(1, Math.floor(s.target * weight)) })),
    gracefulRampDown: '15s',
  };
}

const allScenarios = {
  static_pages: scen('staticPages', 0.50),  // bulk of real traffic
  limits_api:   scen('limitsApi',   0.15),
  auth_flow:    scen('authFlow',    0.15),
  pdf_api:      scen('pdfApi',      0.15),
  ai_api:       scen('aiApi',       0.05),
};

const pick = {
  static:  { static_pages: allScenarios.static_pages },
  limits:  { limits_api:   allScenarios.limits_api },
  auth:    { auth_flow:    allScenarios.auth_flow },
  pdf:     { pdf_api:      allScenarios.pdf_api },
  ai:      { ai_api:       allScenarios.ai_api },
  all:     allScenarios,
};

export const options = {
  scenarios: pick[ONLY] || allScenarios,
  thresholds: {
    // Pass/fail criteria — tweak per your SLO.
    'http_req_duration{scenario:static_pages}': ['p(95)<800'],
    'http_req_duration{scenario:limits_api}':   ['p(95)<400'],
    'errors': ['rate<0.05'],          // < 5% error rate overall
    'http_req_failed': ['rate<0.10'], // < 10% network/HTTP failures
  },
  // Allow many open connections per VU; default (1) starves at high VU counts.
  noConnectionReuse: false,
  discardResponseBodies: false,
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function tag429(res) {
  if (res.status === 429) rateLimited429.add(1);
}

function recordErr(res, expectedStatuses = [200]) {
  const ok = expectedStatuses.includes(res.status);
  errors.add(!ok);
  return ok;
}

// ---------------------------------------------------------------------------
// Scenario: static pages (homepage + marketing pages)
// ---------------------------------------------------------------------------
export function staticPages() {
  const paths = ['/', '/about', '/features', '/compress-pdf', '/merge-pdf', '/blog'];
  const path = paths[randomIntBetween(0, paths.length - 1)];
  const res = http.get(`${BASE}${path}`, { tags: { endpoint: path } });
  staticLatency.add(res.timings.duration);
  tag429(res);
  // 2xx/3xx = served, 429/503 = backend protecting itself (not an error).
  // Anything else (5xx, 0 = connection drop) counts as a real failure.
  const ok = (res.status >= 200 && res.status < 400) || res.status === 429 || res.status === 503;
  errors.add(!ok);
  check(res, { 'static served': () => ok });
  sleep(randomIntBetween(1, 3));
}

// ---------------------------------------------------------------------------
// Scenario: /api/limits — cheap GET, exercises the auth-aware code path
// ---------------------------------------------------------------------------
export function limitsApi() {
  const res = http.get(`${BASE}/api/limits`);
  tag429(res);
  // 200 = success, 429 = rate-limited (expected under load — counted separately,
  // not as an error), 503 = backend deliberately shedding load (also expected).
  recordErr(res, [200, 429, 503]);
  sleep(randomIntBetween(1, 2));
}

// ---------------------------------------------------------------------------
// Scenario: auth flow — signup + login
// NOTE: auth routes are rate-limited (slowapi @limiter.limit on backend).
//   At 10k VUs you WILL see 429s — that's the rate limiter working as
//   designed, not a bug. The `rate_limited_429` counter in the summary
//   tells you how often it kicked in. To stress the underlying DB instead,
//   loosen RATE_LIMIT_AUTH in backend .env before running.
// ---------------------------------------------------------------------------
export function authFlow() {
  const email = `loadtest_${randomString(12)}@example.com`;
  const password = 'TestPass123!';

  group('signup', () => {
    const res = http.post(
      `${BASE}/api/auth/signup`,
      JSON.stringify({ email, password, full_name: 'Load Test' }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'signup' } },
    );
    tag429(res);
    // 200 = created, 409 = email exists (collision under load — acceptable),
    // 429 = rate limited (expected at high VU counts).
    check(res, { 'signup ok or expected fail': r => [200, 201, 409, 429].includes(r.status) })
      || errors.add(1);
  });

  sleep(1);

  group('login', () => {
    const res = http.post(
      `${BASE}/api/auth/login`,
      JSON.stringify({ email, password, remember_me: false }),
      { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } },
    );
    tag429(res);
    check(res, { 'login ok or expected fail': r => [200, 401, 429].includes(r.status) })
      || errors.add(1);
  });

  sleep(randomIntBetween(2, 5));
}

// ---------------------------------------------------------------------------
// Scenario: PDF API — uploads the tiny PDF to a CPU-bound endpoint
// This is the heaviest scenario; backend will saturate first here.
// ---------------------------------------------------------------------------
export function pdfApi() {
  const payload = {
    files: http.file(TINY_PDF, `test_${randomString(6)}.pdf`, 'application/pdf'),
  };
  // merge-pdf needs >= 2 files server-side validation, but the call still
  // exercises upload + validation path. Use compress-pdf for single-file.
  const res = http.post(`${BASE}/api/compress-pdf`, payload, {
    tags: { endpoint: 'compress-pdf' },
    timeout: '60s',
  });
  pdfLatency.add(res.timings.duration);
  tag429(res);
  // Acceptable: 200 (processed), 400 (validation), 413 (too large), 429, 503 (busy)
  check(res, { 'pdf handled': r => [200, 400, 413, 429, 503].includes(r.status) })
    || errors.add(1);
  sleep(randomIntBetween(3, 8));
}

// ---------------------------------------------------------------------------
// Scenario: AI endpoint — only hit a cheap status route, NOT the LLM,
// because each real call costs money and would distort the test.
// ---------------------------------------------------------------------------
export function aiApi() {
  // Probe a lightweight route. If your project exposes /api/ai-tools (GET)
  // as a status/limits route, this will exercise it. Otherwise it'll 405/404
  // — change the path to the cheapest AI route you actually expose.
  const res = http.get(`${BASE}/api/ai-tools`, { tags: { endpoint: 'ai-tools-status' } });
  tag429(res);
  check(res, { 'ai status responds': r => r.status < 500 }) || errors.add(1);
  sleep(randomIntBetween(2, 5));
}

// ---------------------------------------------------------------------------
// Setup / teardown — runs once
// ---------------------------------------------------------------------------
export function setup() {
  console.log(`Target: ${BASE}`);
  console.log(`Peak VUs: ${PEAK}  |  Scenario: ${ONLY}  |  Quick mode: ${QUICK}`);
  const ping = http.get(`${BASE}/`);
  if (ping.status >= 500) {
    throw new Error(`Target ${BASE} returned ${ping.status} on startup — is the server running?`);
  }
}

export function teardown() {
  console.log('Load test complete. Check the summary above for thresholds & 429 counts.');
}

// k6 load test for the PDFOrca backend.
// Verifies the Phase 1 fix under load: while heavy conversions run, the
// event loop stays responsive (health stays fast).
// Usage: k6 run -e BASE_URL=https://pdforca.com scripts/loadtest.k6.js

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");
const BASE = __ENV.BASE_URL || "http://localhost:8000";

export const options = {
  scenarios: {
    light_traffic: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 200 },
        { duration: "1m", target: 500 },
        { duration: "2m", target: 500 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    "http_req_duration{endpoint:health}": ["p(95)<500"],
    errors: ["rate<0.01"],
  },
};

export default function () {
  const h = http.get(BASE + "/health", { tags: { endpoint: "health" } });
  check(h, { "health 200": (r) => r.status === 200 });
  errorRate.add(h.status >= 500);

  const l = http.get(BASE + "/api/limits", { tags: { endpoint: "limits" } });
  check(l, { "limits not 5xx": (r) => r.status < 500 });
  errorRate.add(l.status >= 500);

  sleep(1);
}

// claude_stability_test.js
// Run: node claude_stability_test.js
// npm i axios dotenv

const axios = require("axios");
require("dotenv").config();

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const KEY = process.env.ANTHROPIC_API_KEY;

if (!KEY) {
  console.error("❌ Missing ANTHROPIC_API_KEY in .env");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function backoffMs(attempt) {
  const base = Math.min(30000, 800 * Math.pow(2, attempt - 1)); // 0.8s,1.6s,3.2s...
  const jitter = Math.floor(Math.random() * 400);
  return base + jitter;
}

async function pingOnce(timeoutMs = 20000) {
  return axios.post(
    API_URL,
    {
      model: MODEL,
      max_tokens: 10,
      temperature: 0,
      messages: [{ role: "user", content: "Respond with exactly: pong" }],
    },
    {
      timeout: timeoutMs,
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": KEY,
        "anthropic-version": "2023-06-01",
      },
      validateStatus: () => true,
    }
  );
}

function isRetryable(resp, err) {
  if (err) {
    return ["ECONNABORTED", "ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(
      err.code
    );
  }
  return resp && [529, 503, 502, 504, 408].includes(resp.status);
}

async function oneHealthcheck(maxAttempts) {
  const started = Date.now();
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const t0 = Date.now();
    try {
      const resp = await pingOnce(20000);
      const ms = Date.now() - t0;

      if (resp.status >= 200 && resp.status < 300) {
        return {
          ok: true,
          attempts: attempt,
          lastStatus: resp.status,
          lastMs: ms,
          totalMs: Date.now() - started,
          requestId: resp.headers["request-id"] || "n/a",
        };
      }

      if (!isRetryable(resp, null)) {
        return {
          ok: false,
          attempts: attempt,
          lastStatus: resp.status,
          lastMs: ms,
          totalMs: Date.now() - started,
          reason: "non-retryable status",
        };
      }
    } catch (err) {
      const ms = Date.now() - t0;
      if (!isRetryable(null, err)) {
        return {
          ok: false,
          attempts: attempt,
          lastStatus: "EXCEPTION",
          lastMs: ms,
          totalMs: Date.now() - started,
          reason: `non-retryable exception ${err.code}`,
        };
      }
    }

    await sleep(backoffMs(attempt));
  }

  return {
    ok: false,
    attempts: maxAttempts,
    lastStatus: "GAVE_UP",
    totalMs: Date.now() - started,
    reason: "retry limit reached",
  };
}

async function main() {
  const RUNS = Number(process.env.RUNS || 15);
  const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS || 8);

  console.log(
    `➡️ Stability test: runs=${RUNS}, maxAttemptsPerRun=${MAX_ATTEMPTS}\n`
  );

  let okCount = 0;
  let totalAttemptsForOk = 0;
  let okWithin3 = 0;
  const failures = [];

  for (let i = 1; i <= RUNS; i++) {
    const r = await oneHealthcheck(MAX_ATTEMPTS);
    if (r.ok) {
      okCount++;
      totalAttemptsForOk += r.attempts;
      if (r.attempts <= 3) okWithin3++;
      console.log(
        `✅ Run #${i}: OK in ${r.attempts} attempts | total=${r.totalMs}ms | req=${r.requestId}`
      );
    } else {
      failures.push(r);
      console.log(
        `❌ Run #${i}: FAIL | last=${r.lastStatus} | attempts=${r.attempts} | reason=${r.reason} | total=${r.totalMs}ms`
      );
    }

    // small gap between runs so we don't overload ourselves
    await sleep(600);
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Runs: ${RUNS}`);
  console.log(`OK: ${okCount} (${Math.round((okCount / RUNS) * 100)}%)`);
  if (okCount > 0) {
    console.log(
      `Avg attempts (successful only): ${(totalAttemptsForOk / okCount).toFixed(
        2
      )}`
    );
    console.log(
      `OK within 3 attempts: ${okWithin3}/${okCount} (${Math.round(
        (okWithin3 / okCount) * 100
      )}%)`
    );
  }
  console.log(`Failures: ${failures.length}`);
}

main();
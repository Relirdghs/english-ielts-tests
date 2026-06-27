const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const qaStorageDir = path.join(os.tmpdir(), `acc-secure-delivery-${process.pid}-${Date.now()}`);
process.env.ASSESSMENT_STORAGE_DIR = qaStorageDir;
const { startServer, loadAttempts } = require("./secure_delivery_server");

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json();
  return { status: response.status, body };
}

async function requestText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.text();
  return { status: response.status, body };
}

function containsHiddenKey(value) {
  const text = JSON.stringify(value);
  return /"correct"\s*:|rationale|answer key|sourceCorrect|displayCorrect/i.test(text);
}

(async () => {
  const previousToken = process.env.ASSESSMENT_ADMIN_TOKEN;
  const runtimeToken = crypto.randomBytes(24).toString("hex");
  process.env.ASSESSMENT_ADMIN_TOKEN = runtimeToken;
  const { server, port } = await startServer({ port: 0 });
  const baseUrl = `http://127.0.0.1:${port}`;
  const evidence = {};
  try {
    const health = await requestJson(`${baseUrl}/health`);
    if (health.status !== 200 || health.body.itemCount !== 300 || health.body.storageMode !== "file-backed-json") throw new Error(`Bad health response: ${JSON.stringify(health)}`);
    evidence.health = health.body;

    const attempt = await requestJson(`${baseUrl}/api/attempts`, {
      method: "POST",
      body: JSON.stringify({ candidateId: "qa_candidate", itemIds: ["ACC_001", "ACC_101", "ACC_201"] })
    });
    if (attempt.status !== 201 || !attempt.body.attemptId || !attempt.body.candidateAccessToken || !attempt.body.nextItem) throw new Error(`Attempt creation failed: ${JSON.stringify(attempt)}`);
    if (containsHiddenKey(attempt.body.nextItem)) throw new Error("Candidate nextItem leaked answer key or rationale.");
    evidence.candidatePayloadRedacted = true;
    const candidateAuth = { authorization: `Bearer ${attempt.body.candidateAccessToken}` };

    const blockedCandidateSummary = await requestJson(`${baseUrl}/api/attempts/${attempt.body.attemptId}`);
    if (blockedCandidateSummary.status !== 401) throw new Error(`Candidate attempt endpoint was not blocked without token: ${JSON.stringify(blockedCandidateSummary)}`);
    evidence.candidateTokenRequired = true;

    const blockedAdmin = await requestJson(`${baseUrl}/api/admin/items`);
    if (blockedAdmin.status !== 401) throw new Error(`Admin endpoint was not blocked without token: ${JSON.stringify(blockedAdmin)}`);
    evidence.adminBlockedWithoutToken = true;

    const admin = await requestJson(`${baseUrl}/api/admin/items`, {
      headers: { authorization: `Bearer ${runtimeToken}` }
    });
    if (admin.status !== 200 || !Array.isArray(admin.body.items) || admin.body.items.length !== 300) throw new Error(`Admin endpoint failed with token: ${JSON.stringify(admin).slice(0, 200)}`);
    if (!JSON.stringify(admin.body.items[0]).includes("correct")) throw new Error("Admin payload did not include answer keys for evaluator/server use.");
    evidence.adminTokenBoundary = true;

    const submit = await requestJson(`${baseUrl}/api/attempts/${attempt.body.attemptId}/responses`, {
      method: "POST",
      headers: candidateAuth,
      body: JSON.stringify({ itemId: "ACC_001", selected: ["D"], confidence: "high", timeSeconds: 91 })
    });
    if (submit.status !== 200 || submit.body.score !== 1 || containsHiddenKey(submit.body.nextItem)) throw new Error(`Submit failed or leaked hidden key: ${JSON.stringify(submit)}`);
    evidence.serverScoring = { itemId: submit.body.itemId, score: submit.body.score };

    const finalize = await requestJson(`${baseUrl}/api/attempts/${attempt.body.attemptId}/finalize`, { method: "POST", headers: candidateAuth, body: "{}" });
    if (finalize.status !== 200 || finalize.body.submitted !== 1 || finalize.body.itemCount !== 3) throw new Error(`Finalize failed: ${JSON.stringify(finalize)}`);
    evidence.finalize = finalize.body;

    const stored = JSON.parse(fs.readFileSync(path.join(qaStorageDir, "attempts.json"), "utf8"));
    const storedAttempt = stored.attempts.find((row) => row.attemptId === attempt.body.attemptId);
    if (!storedAttempt || storedAttempt.responses.length !== 1 || !storedAttempt.finalizedAt) throw new Error("Durable attempts file did not persist finalized attempt.");
    const storedText = JSON.stringify(stored);
    if (storedText.includes(attempt.body.candidateAccessToken) || !storedAttempt.candidateTokenHash) throw new Error("Candidate access token was stored raw or token hash was missing.");
    const reloadedAttempts = loadAttempts();
    const safeSummary = await requestJson(`${baseUrl}/api/attempts/${attempt.body.attemptId}`, {
      headers: candidateAuth
    });
    if (reloadedAttempts < 1 || safeSummary.status !== 200 || containsHiddenKey(safeSummary.body)) throw new Error(`Durable reload or safe summary failed: ${JSON.stringify(safeSummary)}`);
    evidence.durableStorage = {
      storageMode: "file-backed-json",
      persistedAttempts: stored.attempts.length,
      reloadedAttempts,
      candidateSummaryRedacted: true,
      candidateTokenStoredHashOnly: true
    };

    const blockedCandidateReport = await requestText(`${baseUrl}/api/attempts/${attempt.body.attemptId}/report/candidate`);
    if (blockedCandidateReport.status !== 401) throw new Error("Candidate report endpoint was not blocked without token.");
    const candidateReport = await requestText(`${baseUrl}/api/attempts/${attempt.body.attemptId}/report/candidate`, {
      headers: candidateAuth
    });
    if (candidateReport.status !== 200 || /Correct|rationale|answer key|sourceCorrect|displayCorrect/i.test(candidateReport.body)) throw new Error("Candidate report leaked evaluator-only material.");
    evidence.candidateReportRedacted = true;

    const blockedEvaluatorReport = await requestText(`${baseUrl}/api/admin/attempts/${attempt.body.attemptId}/report/evaluator`);
    if (blockedEvaluatorReport.status !== 401) throw new Error("Evaluator report endpoint was not protected.");
    const evaluatorReport = await requestText(`${baseUrl}/api/admin/attempts/${attempt.body.attemptId}/report/evaluator`, {
      headers: { authorization: `Bearer ${runtimeToken}` }
    });
    if (evaluatorReport.status !== 200 || !/Correct/.test(evaluatorReport.body) || !/false-synchrony/i.test(evaluatorReport.body)) throw new Error("Evaluator report did not include authorized scoring evidence.");
    evidence.evaluatorReportBoundary = true;

    const adminAttempts = await requestJson(`${baseUrl}/api/admin/attempts`, {
      headers: { authorization: `Bearer ${runtimeToken}` }
    });
    if (adminAttempts.status !== 200 || !adminAttempts.body.attempts.some((row) => row.attemptId === attempt.body.attemptId)) throw new Error("Admin attempts endpoint did not expose persisted attempt.");
    evidence.adminAttemptRegistry = true;

    const auditLog = await requestJson(`${baseUrl}/api/admin/audit-log?limit=50`, {
      headers: { authorization: `Bearer ${runtimeToken}` }
    });
    const auditActions = new Set((auditLog.body.rows || []).map((row) => row.action));
    for (const action of ["attempt.created", "candidate.attempt.denied", "candidate.report.denied", "response.submitted", "attempt.finalized", "admin.items.denied", "admin.items.read"]) {
      if (!auditActions.has(action)) throw new Error(`Audit action missing: ${action}`);
    }
    evidence.auditLog = {
      rows: auditLog.body.rows.length,
      requiredActionsPresent: true
    };

    const report = {
      generatedAt: new Date().toISOString(),
      status: "prototype-pass",
      serverSurface: "dependency-free Node.js HTTP prototype with local durable attempt storage",
      hiddenKeyBoundary: "candidate endpoints require per-attempt bearer tokens and omit correct answers and rationales; admin endpoints and evaluator reports require runtime-only authorization token",
      limitations: [
        "Prototype stores candidate access token hashes, not raw candidate tokens.",
        "Prototype uses local JSON/JSONL storage; production still requires a managed database, backups and retention policy.",
        "Production still requires hosted authentication, rate limits, TLS, operational monitoring and proctoring policy.",
        "The QA token is runtime-only in this test process and is not written to outputs."
      ],
      evidence
    };
    fs.writeFileSync(path.join(outputDir, "secure_delivery_readiness_report.json"), JSON.stringify(report, null, 2), "utf8");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previousToken === undefined) delete process.env.ASSESSMENT_ADMIN_TOKEN;
    else process.env.ASSESSMENT_ADMIN_TOKEN = previousToken;
    delete process.env.ASSESSMENT_STORAGE_DIR;
    fs.rmSync(qaStorageDir, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

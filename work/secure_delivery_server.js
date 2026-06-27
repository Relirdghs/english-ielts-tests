const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const bankPath = process.env.ASSESSMENT_BANK_PATH || path.join(outputDir, "item_bank.json");
const storageDir = path.resolve(process.env.ASSESSMENT_STORAGE_DIR || path.join(root, "work", "secure_delivery_data"));
const attemptsPath = path.join(storageDir, "attempts.json");
const auditLogPath = path.join(storageDir, "audit-log.jsonl");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const items = bank.items || [];
const itemById = new Map(items.map((item) => [item.id, item]));
const letters = ["A", "B", "C", "D", "E"];
const attempts = new Map();

function json(res, status, body) {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(text);
}

function html(res, status, body) {
  res.writeHead(status, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("request-body-too-large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("invalid-json"));
      }
    });
    req.on("error", reject);
  });
}

function ensureStorage() {
  fs.mkdirSync(storageDir, { recursive: true });
}

function loadAttempts() {
  ensureStorage();
  if (!fs.existsSync(attemptsPath)) return 0;
  const parsed = JSON.parse(fs.readFileSync(attemptsPath, "utf8"));
  const rows = Array.isArray(parsed) ? parsed : parsed.attempts || [];
  attempts.clear();
  for (const attempt of rows) {
    if (attempt?.attemptId && Array.isArray(attempt.itemIds)) attempts.set(attempt.attemptId, attempt);
  }
  return attempts.size;
}

function persistAttempts() {
  ensureStorage();
  const body = {
    schemaVersion: 1,
    bankVersion: bank.bankVersion,
    savedAt: new Date().toISOString(),
    attempts: [...attempts.values()]
  };
  const tmpPath = `${attemptsPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(body, null, 2), "utf8");
  fs.renameSync(tmpPath, attemptsPath);
}

function candidateHash(candidateId) {
  return crypto.createHash("sha256").update(String(candidateId || "anonymous")).digest("hex").slice(0, 16);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function authorizationToken(req) {
  return String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
}

function appendAudit(action, details = {}) {
  ensureStorage();
  const row = {
    at: new Date().toISOString(),
    action,
    bankVersion: bank.bankVersion,
    ...details
  };
  fs.appendFileSync(auditLogPath, `${JSON.stringify(row)}\n`, "utf8");
}

function readAuditLog(limit = 200) {
  if (!fs.existsSync(auditLogPath)) return [];
  const rows = fs.readFileSync(auditLogPath, "utf8").trim().split(/\n+/).filter(Boolean);
  return rows.slice(-Math.max(1, Math.min(1000, Number(limit) || 200))).map((line) => JSON.parse(line));
}

function scoreQuestion(item, selectedLetters) {
  const selected = new Set(selectedLetters);
  const correct = new Set(item.correct);
  if (item.type === "single") return selected.size === 1 && correct.has([...selected][0]) ? 1 : 0;
  const trueHits = [...selected].filter((letter) => correct.has(letter)).length;
  const falseHits = [...selected].filter((letter) => !correct.has(letter)).length;
  const possibleWrong = 5 - correct.size;
  return Math.max(0, Math.min(1, trueHits / correct.size - falseHits / Math.max(1, possibleWrong)));
}

function safeItem(item) {
  return {
    id: item.id,
    category: item.category,
    type: item.type,
    expectedSelections: item.expectedSelections,
    passage: item.passage,
    prompt: item.prompt,
    options: item.options.map((text, idx) => ({ letter: letters[idx], text })),
    dataDisplay: item.dataDisplay || null,
    skillModule: item.skillModule,
    difficultyTier: item.difficultyTier,
    estimatedTimeSeconds: item.estimatedTimeSeconds,
    sourceHorizon: item.sourceHorizon,
    sourceUrl: item.sourceUrl
  };
}

function assertAdmin(req) {
  const expected = process.env.ASSESSMENT_ADMIN_TOKEN;
  if (!expected) return false;
  const supplied = authorizationToken(req);
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function assertCandidate(req, attempt) {
  if (!attempt?.candidateTokenHash) return false;
  const supplied = tokenHash(authorizationToken(req));
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(attempt.candidateTokenHash);
  return suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

function candidateUnauthorized(res, attemptId, action) {
  appendAudit(action, { attemptId });
  return json(res, 401, { error: "candidate-token-required" });
}

function createAttempt(body = {}) {
  const requestedIds = Array.isArray(body.itemIds) ? body.itemIds.filter((id) => itemById.has(id)) : [];
  const itemIds = requestedIds.length ? requestedIds : items.slice(0, Number(body.limit || 20)).map((item) => item.id);
  const attemptId = crypto.randomUUID();
  const candidateAccessToken = crypto.randomBytes(24).toString("base64url");
  attempts.set(attemptId, {
    attemptId,
    candidateId: String(body.candidateId || "anonymous"),
    candidateTokenHash: tokenHash(candidateAccessToken),
    bankVersion: bank.bankVersion,
    schemaVersion: bank.schemaVersion,
    itemIds,
    cursor: 0,
    responses: [],
    startedAt: new Date().toISOString(),
    finalizedAt: null
  });
  persistAttempts();
  appendAudit("attempt.created", {
    attemptId,
    candidateHash: candidateHash(body.candidateId),
    itemCount: itemIds.length
  });
  return { attempt: attempts.get(attemptId), candidateAccessToken };
}

function nextItem(attempt) {
  const nextId = attempt.itemIds[attempt.cursor];
  return nextId ? safeItem(itemById.get(nextId)) : null;
}

function safeAttempt(attempt) {
  return {
    attemptId: attempt.attemptId,
    candidateId: attempt.candidateId,
    bankVersion: attempt.bankVersion,
    schemaVersion: attempt.schemaVersion,
    itemCount: attempt.itemIds.length,
    submitted: attempt.responses.length,
    cursor: attempt.cursor,
    startedAt: attempt.startedAt,
    finalizedAt: attempt.finalizedAt,
    authenticated: true,
    responses: attempt.responses.map((row) => ({
      itemId: row.itemId,
      selected: row.selected,
      score: row.score,
      confidence: row.confidence,
      timeSeconds: row.timeSeconds,
      submittedAt: row.submittedAt
    })),
    nextItem: attempt.finalizedAt ? null : nextItem(attempt)
  };
}

function submitResponse(attempt, body = {}) {
  const itemId = String(body.itemId || "");
  if (!attempt.itemIds.includes(itemId)) throw new Error("item-not-in-attempt");
  const item = itemById.get(itemId);
  const selected = Array.isArray(body.selected)
    ? body.selected.map((letter) => String(letter).toUpperCase()).filter((letter) => letters.includes(letter))
    : [];
  if (!selected.length) throw new Error("empty-selection");
  const score = scoreQuestion(item, selected);
  const response = {
    itemId,
    selected,
    score,
    confidence: String(body.confidence || "medium").toLowerCase(),
    timeSeconds: Number(body.timeSeconds || 0),
    submittedAt: new Date().toISOString()
  };
  attempt.responses = attempt.responses.filter((row) => row.itemId !== itemId).concat(response);
  const currentIndex = attempt.itemIds.indexOf(itemId);
  if (currentIndex >= attempt.cursor) attempt.cursor = currentIndex + 1;
  persistAttempts();
  appendAudit("response.submitted", {
    attemptId: attempt.attemptId,
    itemId,
    score,
    selectedCount: selected.length
  });
  return {
    itemId,
    accepted: true,
    score,
    nextItem: nextItem(attempt)
  };
}

function finalizeAttempt(attempt) {
  attempt.finalizedAt = new Date().toISOString();
  const weightedPossible = attempt.itemIds.reduce((sum, itemId) => sum + (Number(itemById.get(itemId)?.scoringWeight) || 1), 0);
  const weightedScore = attempt.responses.reduce((sum, row) => {
    const item = itemById.get(row.itemId);
    return sum + row.score * (Number(item?.scoringWeight) || 1);
  }, 0);
  const summary = {
    attemptId: attempt.attemptId,
    candidateId: attempt.candidateId,
    bankVersion: attempt.bankVersion,
    submitted: attempt.responses.length,
    itemCount: attempt.itemIds.length,
    weightedScore: Number(weightedScore.toFixed(3)),
    weightedPossible: Number(weightedPossible.toFixed(3)),
    weightedPercent: weightedPossible ? Number((weightedScore / weightedPossible).toFixed(4)) : 0,
    finalizedAt: attempt.finalizedAt
  };
  persistAttempts();
  appendAudit("attempt.finalized", {
    attemptId: attempt.attemptId,
    submitted: attempt.responses.length,
    weightedPercent: summary.weightedPercent
  });
  return summary;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function reportShell(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.45;margin:32px;color:#111827}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top}th{background:#f3f4f6}.note{color:#4b5563}</style></head><body>${body}</body></html>`;
}

function candidateReport(attempt) {
  const rows = attempt.responses.map((row) => `<tr><td>${escapeHtml(row.itemId)}</td><td>${escapeHtml(row.selected.join(", "))}</td><td>${escapeHtml(row.score)}</td><td>${escapeHtml(row.confidence)}</td><td>${escapeHtml(row.timeSeconds)}</td></tr>`).join("");
  return reportShell("Academic Assessment Candidate Report", `<h1>Academic Assessment Candidate Report</h1><p class="note">Generated from bank ${escapeHtml(attempt.bankVersion)}. This report omits evaluator-only scoring material.</p><p>Submitted: ${attempt.responses.length} / ${attempt.itemIds.length}. Finalized: ${escapeHtml(attempt.finalizedAt || "no")}.</p><table><thead><tr><th>ID</th><th>Selected</th><th>Score</th><th>Confidence</th><th>Time seconds</th></tr></thead><tbody>${rows}</tbody></table>`);
}

function evaluatorReport(attempt) {
  const rows = attempt.responses.map((row) => {
    const item = itemById.get(row.itemId);
    return `<tr><td>${escapeHtml(row.itemId)}</td><td>${escapeHtml(row.selected.join(", "))}</td><td>${escapeHtml(item?.correct?.join(", ") || "")}</td><td>${escapeHtml(row.score)}</td><td>${escapeHtml(row.confidence)}</td><td>${escapeHtml(row.timeSeconds)}</td><td>${escapeHtml(item?.rationale || "")}</td></tr>`;
  }).join("");
  return reportShell("Academic Assessment Evaluator Report", `<h1>Academic Assessment Evaluator Report</h1><p class="note">Generated from bank ${escapeHtml(attempt.bankVersion)}. Includes answer keys and rationales for authorized evaluator use.</p><p>Submitted: ${attempt.responses.length} / ${attempt.itemIds.length}. Finalized: ${escapeHtml(attempt.finalizedAt || "no")}.</p><table><thead><tr><th>ID</th><th>Selected</th><th>Correct</th><th>Score</th><th>Confidence</th><th>Time seconds</th><th>Rationale</th></tr></thead><tbody>${rows}</tbody></table>`);
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true, bankVersion: bank.bankVersion, itemCount: items.length, storageMode: "file-backed-json", attemptCount: attempts.size });
    }
    if (req.method === "POST" && url.pathname === "/api/attempts") {
      const { attempt, candidateAccessToken } = createAttempt(await readBody(req));
      return json(res, 201, {
        attemptId: attempt.attemptId,
        candidateAccessToken,
        bankVersion: attempt.bankVersion,
        itemCount: attempt.itemIds.length,
        nextItem: nextItem(attempt)
      });
    }
    const attemptMatch = url.pathname.match(/^\/api\/attempts\/([^/]+)$/);
    if (req.method === "GET" && attemptMatch) {
      const attempt = attempts.get(attemptMatch[1]);
      if (!attempt) return json(res, 404, { error: "attempt-not-found" });
      if (!assertCandidate(req, attempt)) return candidateUnauthorized(res, attempt.attemptId, "candidate.attempt.denied");
      return json(res, 200, safeAttempt(attempt));
    }
    const submitMatch = url.pathname.match(/^\/api\/attempts\/([^/]+)\/responses$/);
    if (req.method === "POST" && submitMatch) {
      const attempt = attempts.get(submitMatch[1]);
      if (!attempt) return json(res, 404, { error: "attempt-not-found" });
      if (!assertCandidate(req, attempt)) return candidateUnauthorized(res, attempt.attemptId, "candidate.response.denied");
      return json(res, 200, submitResponse(attempt, await readBody(req)));
    }
    const finalizeMatch = url.pathname.match(/^\/api\/attempts\/([^/]+)\/finalize$/);
    if (req.method === "POST" && finalizeMatch) {
      const attempt = attempts.get(finalizeMatch[1]);
      if (!attempt) return json(res, 404, { error: "attempt-not-found" });
      if (!assertCandidate(req, attempt)) return candidateUnauthorized(res, attempt.attemptId, "candidate.finalize.denied");
      return json(res, 200, finalizeAttempt(attempt));
    }
    const candidateReportMatch = url.pathname.match(/^\/api\/attempts\/([^/]+)\/report\/candidate$/);
    if (req.method === "GET" && candidateReportMatch) {
      const attempt = attempts.get(candidateReportMatch[1]);
      if (!attempt) return json(res, 404, { error: "attempt-not-found" });
      if (!assertCandidate(req, attempt)) return candidateUnauthorized(res, attempt.attemptId, "candidate.report.denied");
      return html(res, 200, candidateReport(attempt));
    }
    if (req.method === "GET" && url.pathname === "/api/admin/items") {
      if (!assertAdmin(req)) {
        appendAudit("admin.items.denied");
        return json(res, 401, { error: "admin-token-required" });
      }
      appendAudit("admin.items.read", { itemCount: items.length });
      return json(res, 200, { bankVersion: bank.bankVersion, items });
    }
    if (req.method === "GET" && url.pathname === "/api/admin/attempts") {
      if (!assertAdmin(req)) {
        appendAudit("admin.attempts.denied");
        return json(res, 401, { error: "admin-token-required" });
      }
      appendAudit("admin.attempts.read", { attemptCount: attempts.size });
      return json(res, 200, { bankVersion: bank.bankVersion, attempts: [...attempts.values()] });
    }
    if (req.method === "GET" && url.pathname === "/api/admin/audit-log") {
      if (!assertAdmin(req)) {
        appendAudit("admin.audit.denied");
        return json(res, 401, { error: "admin-token-required" });
      }
      const limit = Number(url.searchParams.get("limit") || 200);
      appendAudit("admin.audit.read", { limit });
      return json(res, 200, { rows: readAuditLog(limit) });
    }
    const evaluatorReportMatch = url.pathname.match(/^\/api\/admin\/attempts\/([^/]+)\/report\/evaluator$/);
    if (req.method === "GET" && evaluatorReportMatch) {
      if (!assertAdmin(req)) {
        appendAudit("admin.evaluator-report.denied", { attemptId: evaluatorReportMatch[1] });
        return json(res, 401, { error: "admin-token-required" });
      }
      const attempt = attempts.get(evaluatorReportMatch[1]);
      if (!attempt) return json(res, 404, { error: "attempt-not-found" });
      appendAudit("admin.evaluator-report.read", { attemptId: attempt.attemptId });
      return html(res, 200, evaluatorReport(attempt));
    }
    return json(res, 404, { error: "not-found" });
  } catch (error) {
    return json(res, error.message === "invalid-json" ? 400 : 422, { error: error.message });
  }
}

loadAttempts();

function startServer(options = {}) {
  const server = http.createServer(handler);
  const port = options.port === undefined ? Number(process.env.PORT || 8790) : Number(options.port);
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

if (require.main === module) {
  startServer().then(({ port }) => {
    console.log(JSON.stringify({ ok: true, url: `http://127.0.0.1:${port}`, bankVersion: bank.bankVersion }, null, 2));
  });
}

module.exports = {
  startServer,
  safeItem,
  safeAttempt,
  scoreQuestion,
  createAttempt,
  submitResponse,
  finalizeAttempt,
  loadAttempts,
  readAuditLog
};

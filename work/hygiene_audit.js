const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const workDir = path.join(root, "work");

const allowedEmails = new Set(["zakirhautov@gmail.com", "bazarbajzanadilov@gmail.com"]);
const allowedHttpHosts = new Set(["127.0.0.1", "localhost"]);
const allowedExtensions = new Set([".csv", ".html", ".js", ".json", ".md", ".py", ".txt", ".webmanifest"]);
const ignoredSegments = new Set(["node_modules", "__pycache__", "secure_delivery_data"]);
const ignoredExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".ttf", ".woff", ".woff2"]);
const ignoredFiles = new Set(["hygiene_audit_report.json"]);

const tokenPatterns = [
  { type: "openai-api-key", pattern: /sk-proj-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{20,}/g },
  { type: "github-token", pattern: /ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/g },
  { type: "vercel-token", pattern: /vercel_[A-Za-z0-9]{20,}/g },
  { type: "slack-token", pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/g }
];

function shouldScan(filePath) {
  if (ignoredFiles.has(path.basename(filePath))) return false;
  const relative = path.relative(root, filePath);
  const parts = relative.split(path.sep);
  if (parts.some((part) => ignoredSegments.has(part))) return false;
  const ext = path.extname(filePath).toLowerCase();
  if (ignoredExtensions.has(ext)) return false;
  return allowedExtensions.has(ext);
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredSegments.has(entry.name)) walk(fullPath, files);
    } else if (shouldScan(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function finding(type, filePath, line, detail) {
  return {
    type,
    file: path.relative(root, filePath).replace(/\\/g, "/"),
    line,
    detail
  };
}

function scanFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const findings = [];

  const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  for (const match of text.matchAll(emailPattern)) {
    const email = match[0].toLowerCase();
    if (!allowedEmails.has(email)) findings.push(finding("unexpected-email", filePath, lineNumber(text, match.index), "redacted email literal"));
  }

  for (const { type, pattern } of tokenPatterns) {
    for (const match of text.matchAll(pattern)) {
      findings.push(finding(type, filePath, lineNumber(text, match.index), "redacted token-like literal"));
    }
  }

  const remoteScriptPattern = /<script\s+[^>]*src=["']https?:\/\/([^/"']+)/gi;
  for (const match of text.matchAll(remoteScriptPattern)) {
    const host = match[1].toLowerCase();
    if (!allowedHttpHosts.has(host)) findings.push(finding("remote-script-dependency", filePath, lineNumber(text, match.index), host));
  }

  if (path.basename(filePath) !== "hygiene_audit.js") {
    const cdnPattern = /cdn\.jsdelivr|unpkg|tailwindcss\.com/gi;
    for (const match of text.matchAll(cdnPattern)) {
      findings.push(finding("cdn-reference", filePath, lineNumber(text, match.index), match[0].toLowerCase()));
    }
  }

  const httpPattern = /http:\/\/([A-Za-z0-9.-]+)/gi;
  for (const match of text.matchAll(httpPattern)) {
    const host = match[1].toLowerCase().replace(/:\d+$/, "");
    if (!allowedHttpHosts.has(host)) findings.push(finding("unexpected-plain-http", filePath, lineNumber(text, match.index), host));
  }

  return findings;
}

const files = [...walk(outputDir), ...walk(workDir)].sort((a, b) => a.localeCompare(b));
const findings = files.flatMap(scanFile);
const secureDeliveryDataExists = fs.existsSync(path.join(workDir, "secure_delivery_data"));
if (secureDeliveryDataExists) findings.push(finding("leftover-secure-delivery-data", path.join(workDir, "secure_delivery_data"), 1, "remove local attempt storage after QA"));

const report = {
  generatedAt: new Date().toISOString(),
  status: findings.length ? "fail" : "pass",
  scannedFiles: files.length,
  ignored: {
    directories: [...ignoredSegments].sort(),
    binaryExtensions: [...ignoredExtensions].sort()
  },
  allowedIdentityPolicy: {
    githubAuthorEmail: "zakirhautov@gmail.com",
    vercelAccountEmail: "bazarbajzanadilov@gmail.com",
    note: "Allowed identities are policy exceptions; output artifacts should not need to contain them."
  },
  checks: {
    noUnexpectedEmails: findings.every((row) => row.type !== "unexpected-email"),
    noTokenLiterals: findings.every((row) => !row.type.endsWith("-token") && row.type !== "openai-api-key"),
    noRemoteScriptDependencies: findings.every((row) => row.type !== "remote-script-dependency" && row.type !== "cdn-reference"),
    noUnexpectedPlainHttp: findings.every((row) => row.type !== "unexpected-plain-http"),
    noDefaultSecureDeliveryData: !secureDeliveryDataExists
  },
  findings
};

fs.writeFileSync(path.join(outputDir, "hygiene_audit_report.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({ status: report.status, scannedFiles: report.scannedFiles, findings: report.findings.length }, null, 2));
if (findings.length) process.exitCode = 1;

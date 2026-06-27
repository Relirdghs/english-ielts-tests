const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const bankPath = path.join(outputDir, "item_bank.json");
let tests;
if (fs.existsSync(bankPath)) {
  tests = JSON.parse(fs.readFileSync(bankPath, "utf8")).items;
} else {
  const html = fs.readFileSync(path.join(outputDir, "academic_test_platform.html"), "utf8");
  const match = html.match(/const TESTS = (.*?);\n    const letters/s);
  if (!match) throw new Error("Cannot locate TESTS payload in HTML.");
  tests = JSON.parse(match[1]);
}
const urls = [...new Map(tests.map((test) => [
  test.sourceUrl,
  test.sourceHorizon.replace(/ \(https?:\/\/[^)]+\)/, "")
])).entries()];

function isArticleLevel(url) {
  return url.includes("nature.com/articles/") || url.includes("science.org/doi/");
}

function acceptableStatus(url, status) {
  if (status >= 200 && status < 400) return true;
  return url.includes("science.org/doi/") && status === 403;
}

(async () => {
  const results = [];
  for (const [url, title] of urls) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "Mozilla/5.0 Codex QA" }
      });
      results.push({
        url,
        title,
        status: response.status,
        articleLevel: isArticleLevel(url),
        accepted: acceptableStatus(url, response.status) && isArticleLevel(url),
        note: response.status === 403 && url.includes("science.org/doi/")
          ? "Science.org DOI returned 403 to automated fetch; DOI URL shape is article-level."
          : ""
      });
    } catch (error) {
      results.push({
        url,
        title,
        status: "ERR",
        articleLevel: isArticleLevel(url),
        accepted: false,
        error: error.message
      });
    }
  }
  const summary = {
    checkedAt: new Date().toISOString(),
    uniqueSourceUrls: results.length,
    accepted: results.filter((item) => item.accepted).length,
    natureStatus200: results.filter((item) => item.url.includes("nature.com/articles/") && item.status === 200).length,
    scienceDoi403Accepted: results.filter((item) => item.url.includes("science.org/doi/") && item.status === 403).length,
    allArticleLevel: results.every((item) => item.articleLevel),
    failures: results.filter((item) => !item.accepted)
  };
  const verificationPath = path.join(outputDir, "source_verification_report.json");
  if (fs.existsSync(verificationPath)) {
    const verificationReport = JSON.parse(fs.readFileSync(verificationPath, "utf8"));
    const byUrl = new Map(results.map((item) => [item.url, item]));
    verificationReport.lastAutomatedUrlAuditAt = summary.checkedAt;
    verificationReport.sources = verificationReport.sources.map((source) => {
      const result = byUrl.get(source.url);
      if (!result) return source;
      return {
        ...source,
        automatedFetchStatus: result.status,
        acceptedByUrlAudit: result.accepted,
        status: result.accepted ? "accepted-by-url-audit" : "failed-url-audit",
        auditNote: result.note || result.error || ""
      };
    });
    fs.writeFileSync(verificationPath, JSON.stringify(verificationReport, null, 2), "utf8");
  }
  fs.writeFileSync(path.join(outputDir, "source_url_audit.json"), JSON.stringify({ summary, results }, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length) process.exitCode = 1;
})();

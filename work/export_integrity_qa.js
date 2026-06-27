const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("./qa_node/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const htmlPath = path.join(outputDir, "academic_test_platform.html");
const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "academic_test_manifest.json"), "utf8"));

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("No Edge/Chrome executable found for export integrity QA.");

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function saveDownload(download, tmpDir) {
  const filePath = path.join(tmpDir, download.suggestedFilename());
  await download.saveAs(filePath);
  return {
    suggestedFilename: download.suggestedFilename(),
    filePath,
    bytes: fs.statSync(filePath).size,
    text: fs.readFileSync(filePath, "utf8")
  };
}

function pass(name, evidence) {
  return { name, status: "pass", evidence };
}

function fail(name, evidence, detail) {
  return { name, status: "fail", evidence, detail };
}

(async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "acc-export-qa-"));
  const checks = [];
  const downloads = {};
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".option", { timeout: 10000 });

  await page.locator(".option").nth(0).click();
  await page.getByRole("button", { name: "Submit Answer" }).click();
  await page.waitForSelector(".review", { timeout: 10000 });
  await page.locator("aside.left select").nth(0).selectOption("evaluator");
  await page.locator("textarea[placeholder='Manual comment for this item']").fill("manual export QA note");
  await page.evaluate(() => {
    window.__printCount = 0;
    window.print = () => {
      window.__printCount += 1;
    };
  });

  let download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  downloads.json = await saveDownload(await download, tmpDir);
  const json = JSON.parse(downloads.json.text);
  checks.push(json.bankInfo?.bankVersion === manifest.bankVersion && json.items?.length === 300 && json.session?.answerHistory?.ACC_001
    ? pass("json-export", {
      filename: downloads.json.suggestedFilename,
      bytes: downloads.json.bytes,
      bankVersion: json.bankInfo?.bankVersion,
      itemCount: json.items?.length,
      answerHistoryRecords: Object.keys(json.session?.answerHistory || {}).length
    })
    : fail("json-export", {
      filename: downloads.json.suggestedFilename,
      bankVersion: json.bankInfo?.bankVersion,
      itemCount: json.items?.length
    }, "JSON export missing bank, items or answer history"));
  checks.push(json.session?.examProtocol?.sections?.length === 3
    && json.session.examProtocol.finalProtocolReady === false
    && json.session.examProtocol.breaks
    ? pass("json-exam-protocol", {
      sections: json.session.examProtocol.sections.length,
      finalProtocolReady: json.session.examProtocol.finalProtocolReady,
      breakKeys: Object.keys(json.session.examProtocol.breaks).join("|")
    })
    : fail("json-exam-protocol", {
      sections: json.session?.examProtocol?.sections?.length || 0,
      finalProtocolReady: json.session?.examProtocol?.finalProtocolReady,
      breaks: json.session?.examProtocol?.breaks
    }, "JSON export missing exam protocol snapshot"));
  checks.push(json.profile?.profileExplanation?.summary
    && json.profile.profileExplanation.limitation
    && json.profile.profileExplanation.evidence?.length >= 3
    ? pass("json-cefr-explanation", {
      profile: json.profile.profileExplanation.profile,
      weightedPercent: json.profile.profileExplanation.weightedPercent,
      evidenceRows: json.profile.profileExplanation.evidence.length
    })
    : fail("json-cefr-explanation", {
      profileExplanation: json.profile?.profileExplanation || null
    }, "JSON export missing CEFR explanation"));
  checks.push(json.session?.questionOrder?.blocks?.length === 3
    && json.session.questionOrder.blocks.every((block) => block.count === 100)
    ? pass("json-question-order", {
      randomQuestions: json.session.questionOrder.randomQuestions,
      blocks: json.session.questionOrder.blocks.map((block) => `${block.key}:${block.firstPosition}-${block.lastPosition}`).join("|")
    })
    : fail("json-question-order", {
      questionOrder: json.session?.questionOrder || null
    }, "JSON export missing section question order evidence"));

  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  downloads.csv = await saveDownload(await download, tmpDir);
  const csvLines = downloads.csv.text.trim().split(/\r?\n/);
  const csvHeader = csvLines[0] || "";
  checks.push(downloads.csv.suggestedFilename.includes("academic-assessment-results")
    && csvLines.length === 301
    && csvHeader.includes("correct_source")
    && csvHeader.includes("confidence_adjusted_score")
    && csvHeader.includes("evaluator_note")
    ? pass("csv-export", {
      filename: downloads.csv.suggestedFilename,
      bytes: downloads.csv.bytes,
      rowCount: csvLines.length - 1,
      hasCorrectSourceColumn: csvHeader.includes("correct_source"),
      hasEvaluatorNoteColumn: csvHeader.includes("evaluator_note")
    })
    : fail("csv-export", {
      filename: downloads.csv.suggestedFilename,
      rowCount: csvLines.length - 1,
      header: csvHeader
    }, "CSV export missing required columns or 300 rows"));

  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Candidate", exact: true }).click();
  downloads.candidate = await saveDownload(await download, tmpDir);
  const candidateLower = downloads.candidate.text.toLowerCase();
  const candidateLeakage = [
    "false-synchrony",
    "manual export qa note",
    "<th>correct</th>",
    "<th>rationale</th>"
  ].filter((needle) => candidateLower.includes(needle));
  checks.push(downloads.candidate.suggestedFilename.includes("candidate-report")
    && candidateLower.includes("candidate report")
    && candidateLower.includes("intentionally omits")
    && candidateLeakage.length === 0
    ? pass("candidate-report-boundary", {
      filename: downloads.candidate.suggestedFilename,
      bytes: downloads.candidate.bytes,
      leakageTerms: candidateLeakage.length
    })
    : fail("candidate-report-boundary", {
      filename: downloads.candidate.suggestedFilename,
      leakageTerms: candidateLeakage
    }, "Candidate report leaked evaluator-only material"));

  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Evaluator", exact: true }).click();
  downloads.evaluator = await saveDownload(await download, tmpDir);
  const evaluatorLower = downloads.evaluator.text.toLowerCase();
  checks.push(downloads.evaluator.suggestedFilename.includes("evaluator-report")
    && evaluatorLower.includes("<th>correct</th>")
    && evaluatorLower.includes("<th>rationale</th>")
    && evaluatorLower.includes("false-synchrony")
    && evaluatorLower.includes("manual export qa note")
    ? pass("evaluator-report-boundary", {
      filename: downloads.evaluator.suggestedFilename,
      bytes: downloads.evaluator.bytes,
      hasCorrectColumn: evaluatorLower.includes("<th>correct</th>"),
      hasRationaleColumn: evaluatorLower.includes("<th>rationale</th>"),
      hasEvaluatorNote: evaluatorLower.includes("manual export qa note")
    })
    : fail("evaluator-report-boundary", {
      filename: downloads.evaluator.suggestedFilename,
      hasCorrectColumn: evaluatorLower.includes("<th>correct</th>"),
      hasRationaleColumn: evaluatorLower.includes("<th>rationale</th>"),
      hasEvaluatorNote: evaluatorLower.includes("manual export qa note")
    }, "Evaluator report missing key, rationale or note"));

  await page.getByRole("button", { name: "PDF", exact: true }).click();
  const printCount = await page.evaluate(() => window.__printCount || 0);
  checks.push(printCount === 1
    ? pass("pdf-print-surface", { printCount })
    : fail("pdf-print-surface", { printCount }, "PDF button did not call print"));

  await browser.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const failures = checks.filter((check) => check.status !== "pass");
  const report = {
    generatedAt: new Date().toISOString(),
    bankVersion: manifest.bankVersion,
    schemaVersion: manifest.schemaVersion,
    status: failures.length ? "export-integrity-fail" : "export-integrity-pass",
    browser: executablePath,
    checks,
    privacyBoundary: {
      candidateReportRedacted: checks.find((check) => check.name === "candidate-report-boundary")?.status === "pass",
      evaluatorReportIncludesKeys: checks.find((check) => check.name === "evaluator-report-boundary")?.status === "pass"
    },
    failures
  };
  const matrixRows = [
    ["check", "status", "filename", "bytes", "detail"],
    ...checks.map((check) => [
      check.name,
      check.status,
      check.evidence?.filename || "",
      check.evidence?.bytes || "",
      check.detail || ""
    ])
  ];
  fs.writeFileSync(path.join(outputDir, "export_integrity_report.json"), JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(path.join(outputDir, "export_integrity_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
  console.log(JSON.stringify({
    bankVersion: report.bankVersion,
    status: report.status,
    checks: checks.length,
    failures: failures.length
  }, null, 2));
  if (failures.length) process.exitCode = 1;
})();

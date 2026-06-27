const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("./qa_node/node_modules/playwright-core");

const root = __dirname ? path.resolve(__dirname, "..") : process.cwd();
const htmlPath = path.join(root, "outputs", "academic_test_platform.html");
const bankPath = path.join(root, "outputs", "item_bank.json");
const outputDir = path.join(root, "outputs");
const pilotFixturePath = path.join(root, "work", "pilot_responses_fixture.csv");
const expertFixturePath = path.join(root, "work", "expert_review_fixture.csv");
fs.writeFileSync(
  pilotFixturePath,
  [
    '"candidate_id","item_id","selected","score","confidence","time_seconds","submitted_at"',
    '"cand_001","ACC_001","D","1","high","92","2026-06-26T00:00:00Z"',
    '"cand_001","ACC_002","A","1","medium","88","2026-06-26T00:01:00Z"',
    '"cand_001","ACC_003","E","1","high","95","2026-06-26T00:02:00Z"',
    '"cand_002","ACC_001","A","0","high","105","2026-06-26T00:00:00Z"',
    '"cand_002","ACC_002","A","1","medium","91","2026-06-26T00:01:00Z"',
    '"cand_002","ACC_003","C","0","low","112","2026-06-26T00:02:00Z"',
    '"cand_003","ACC_001","D","1","medium","87","2026-06-26T00:00:00Z"',
    '"cand_003","ACC_002","D","0","low","99","2026-06-26T00:01:00Z"',
    '"cand_003","ACC_003","E","1","high","90","2026-06-26T00:02:00Z"'
  ].join("\n") + "\n",
  "utf8"
);
fs.writeFileSync(
  expertFixturePath,
  [
    '"reviewer_id","item_id","decision","construct_alignment","key_defensibility","distractor_plausibility","language_quality","source_scope","severity","notes","reviewed_at"',
    '"rev_alpha","ACC_001","approve","pass","pass","pass","pass","pass","","key defensible","2026-06-26"',
    '"rev_beta","ACC_001","approve","pass","pass","pass","pass","pass","","independent agreement","2026-06-26"',
    '"rev_alpha","ACC_002","revise","concern","pass","concern","pass","pass","medium","tighten one distractor","2026-06-26"'
  ].join("\n") + "\n",
  "utf8"
);

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("No Edge/Chrome executable found for QA.");

(async () => {
  const errors = [];
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, acceptDownloads: true });
  await context.addInitScript(() => localStorage.clear());
  const page = await context.newPage();
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) errors.push(`${msg.type()}: ${msg.text()}`);
  });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".option", { timeout: 10000 });
  const initial = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent,
    testCount: TESTS.length,
    options: document.querySelectorAll(".option").length,
    hasBlockTimer: document.body.innerText.toLowerCase().includes("block timer"),
    hasCefr: document.body.innerText.toLowerCase().includes("cefr profile"),
    cefrExplanation: document.body.innerText.toLowerCase().includes("cefr rationale") && document.body.innerText.toLowerCase().includes("interpretation limit") && document.body.innerText.toLowerCase().includes("weakest module"),
    hasItemCounter: document.body.innerText.includes("1/300"),
    leftSelects: document.querySelectorAll("aside.left select").length,
    blockOptions: document.querySelectorAll("aside.left select")[2]?.querySelectorAll("option").length || 0,
    sourceLinks: document.querySelectorAll(".source a[href^='http']").length,
    expectedAnswerChip: [...document.querySelectorAll(".chip")].some((node) => /answer/.test(node.textContent)),
    progressMapDots: document.querySelectorAll(".map-dot").length,
    confidenceButtons: [...document.querySelectorAll(".segmented button")].filter((node) => ["low","medium","high"].includes(node.textContent.trim())).length,
    metadataCells: document.querySelectorAll(".metadata-grid div").length,
    dataTables: document.querySelectorAll(".data-card table").length,
    exportButtons: [...document.querySelectorAll("button")].filter((node) => ["JSON","CSV","Candidate","Evaluator","PDF"].includes(node.textContent.trim())).length,
    candidateCleanChips: ![...document.querySelectorAll(".chip")].map((node) => node.textContent).some((text) => /C1-|C2-|PhD-screening|Reading Synthesis|Use of Academic English|Data Interpretation|Methodological Reasoning|Abstract Revision|Evidence Evaluation/.test(text)),
    bankControls: document.body.innerText.toLowerCase().includes("bank io") && document.querySelectorAll("input[type='file']").length === 1,
    manifestHref: document.querySelector("link[rel='manifest']")?.getAttribute("href") || "",
    roleMode: document.body.innerText.toLowerCase().includes("candidate"),
    sessionControls: document.body.innerText.toLowerCase().includes("session plan") && document.body.innerText.toLowerCase().includes("adaptive drill"),
    examProtocol: document.body.innerText.toLowerCase().includes("exam protocol") && document.body.innerText.includes("0/100"),
    breakButtons: [...document.querySelectorAll("button")].filter((node) => /^Break [AB]$/.test(node.textContent.trim())).length,
    breakAria: [...document.querySelectorAll("button")].filter((node) => /^Break [AB]$/.test(node.textContent.trim()) && node.hasAttribute("aria-pressed")).length,
    namedSlotInput: Boolean(document.querySelector("input[aria-label='Session name']")) && document.body.innerText.toLowerCase().includes("save named"),
    resetControls: document.body.innerText.toLowerCase().includes("current block") && document.body.innerText.toLowerCase().includes("timers"),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));
  if (initial.testCount !== 300) throw new Error(`Expected 300 tests, got ${initial.testCount}`);
  if (initial.options !== 5) throw new Error(`Expected 5 visible options, got ${initial.options}`);
  if (!initial.hasBlockTimer || !initial.hasCefr || !initial.cefrExplanation) throw new Error("Timer or CEFR panel missing.");
  if (!initial.hasItemCounter || initial.leftSelects < 7 || initial.blockOptions !== 30 || !initial.sourceLinks || !initial.expectedAnswerChip || initial.progressMapDots !== 300 || initial.confidenceButtons !== 3 || initial.exportButtons !== 5 || !initial.bankControls || initial.manifestHref !== "app.webmanifest" || !initial.sessionControls || !initial.examProtocol || initial.breakButtons !== 2 || initial.breakAria !== 2 || !initial.namedSlotInput || !initial.resetControls || !initial.candidateCleanChips) {
    throw new Error(`Navigation or metadata controls missing: ${JSON.stringify(initial)}`);
  }
  if (initial.horizontalOverflow) throw new Error("Desktop horizontal overflow detected.");

  await page.getByRole("button", { name: "Break A", exact: true }).click();
  const examProtocolToggle = await page.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem("acc_exam_breaks") || "{}"),
    pressed: document.querySelector("button[onclick=\"toggleExamBreak('afterA')\"]")?.getAttribute("aria-pressed")
  }));
  if (examProtocolToggle.stored.afterA !== true || examProtocolToggle.pressed !== "true") throw new Error(`Exam protocol break state failed: ${JSON.stringify(examProtocolToggle)}`);

  await page.getByLabel("Session name").fill("QA Named Attempt");
  await page.getByRole("button", { name: "Save Named", exact: true }).click();
  const namedSlot = await page.evaluate(() => {
    const labels = JSON.parse(localStorage.getItem("acc_slot_labels") || "{}");
    const active = localStorage.getItem("acc_active_slot");
    const saved = active ? JSON.parse(localStorage.getItem("acc_slot_" + active) || "null") : null;
    return {
      active,
      label: active ? labels[active] : "",
      savedLabel: saved?.slotLabel || "",
      savedBank: saved?.bankInfo?.bankVersion || "",
      selectHasLabel: [...document.querySelectorAll("select[aria-label='Save slot'] option")].some((node) => node.textContent.trim() === "QA Named Attempt")
    };
  });
  if (!namedSlot.active?.startsWith("named-") || namedSlot.label !== "QA Named Attempt" || namedSlot.savedLabel !== "QA Named Attempt" || !namedSlot.savedBank || !namedSlot.selectHasLabel) {
    throw new Error(`Named slot persistence failed: ${JSON.stringify(namedSlot)}`);
  }

  const collapseBefore = await page.evaluate(() => ({
    toggles: document.querySelectorAll("aside.right .section-toggle").length,
    skillOpen: document.querySelector("[data-analytics-section='skills'] .section-toggle")?.getAttribute("aria-expanded"),
    skillHidden: document.querySelector("#analytics-skills")?.hasAttribute("hidden")
  }));
  await page.locator("[data-analytics-section='skills'] .section-toggle").click();
  const collapseAfter = await page.evaluate(() => ({
    skillOpen: document.querySelector("[data-analytics-section='skills'] .section-toggle")?.getAttribute("aria-expanded"),
    skillHidden: document.querySelector("#analytics-skills")?.hasAttribute("hidden"),
    persisted: JSON.parse(localStorage.getItem("acc_analytics_open") || "{}").skills === false
  }));
  if (collapseBefore.toggles < 8 || collapseBefore.skillOpen !== "true" || collapseBefore.skillHidden || collapseAfter.skillOpen !== "false" || !collapseAfter.skillHidden || !collapseAfter.persisted) {
    throw new Error(`Collapsible analytics failed: ${JSON.stringify({ collapseBefore, collapseAfter })}`);
  }
  await page.locator("[data-analytics-section='skills'] .section-toggle").click();

  await page.locator("input[type='file']").setInputFiles(bankPath);
  await page.waitForTimeout(200);
  const importedBank = await page.evaluate(() => ({
    count: TESTS.length,
    status: document.body.innerText.toLowerCase().includes("imported 300 items"),
    source: localStorage.getItem("acc_imported_bank") ? "stored" : "embedded"
  }));
  if (importedBank.count !== 300 || !importedBank.status || importedBank.source !== "stored") throw new Error(`Bank import failed: ${JSON.stringify(importedBank)}`);
  const bankDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Bank" }).click();
  const bankExport = await bankDownload;
  if (!bankExport.suggestedFilename().includes("academic-assessment-item-bank")) throw new Error("Bank export did not start expected download.");
  await page.getByRole("button", { name: "Embedded" }).click();
  const restoredBank = await page.evaluate(() => ({
    count: TESTS.length,
    status: document.body.innerText.toLowerCase().includes("embedded bank restored"),
    source: localStorage.getItem("acc_imported_bank") ? "stored" : "embedded"
  }));
  if (restoredBank.count !== 300 || !restoredBank.status || restoredBank.source !== "embedded") throw new Error(`Embedded bank restore failed: ${JSON.stringify(restoredBank)}`);

  await page.locator("aside.left select").nth(0).selectOption("admin");
  await page.waitForTimeout(50);
  const adminMode = await page.evaluate(() => ({
    metadataCells: document.querySelectorAll(".metadata-grid div").length,
    adminInspect: document.body.innerText.toLowerCase().includes("admin item inspect"),
    answerKey: document.body.innerText.toLowerCase().includes("answer key"),
    uniqueness: document.body.innerText.toLowerCase().includes("uniqueness")
  }));
  if (adminMode.metadataCells < 4 || !adminMode.adminInspect || !adminMode.answerKey || !adminMode.uniqueness) throw new Error(`Admin mode failed: ${JSON.stringify(adminMode)}`);

  await page.locator("input[aria-label='Import pilot responses']").setInputFiles(pilotFixturePath);
  await page.waitForTimeout(200);
  const pilotImport = await page.evaluate(() => ({
    status: document.body.innerText.toLowerCase().includes("calibrated-from-local-pilot-data"),
    candidates: document.body.innerText.includes("Candidates") && document.body.innerText.includes("3"),
    rows: document.body.innerText.includes("Rows") && document.body.innerText.includes("9")
  }));
  if (!pilotImport.status || !pilotImport.candidates || !pilotImport.rows) throw new Error(`Pilot response import failed: ${JSON.stringify(pilotImport)}`);
  const pilotTemplateDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pilot Template" }).click();
  const pilotTemplate = await pilotTemplateDownload;
  if (!pilotTemplate.suggestedFilename().includes("pilot_response_template")) throw new Error("Pilot template export did not start expected download.");

  await page.locator("input[aria-label='Import expert adjudication']").setInputFiles(expertFixturePath);
  await page.waitForTimeout(200);
  const expertImport = await page.evaluate(() => ({
    status: document.body.innerText.toLowerCase().includes("partial-human-adjudication"),
    reviewers: document.body.innerText.includes("Reviewers") && document.body.innerText.includes("2"),
    rows: document.body.innerText.includes("Rows") && document.body.innerText.includes("3"),
    coverage: document.body.innerText.includes("Item coverage") && document.body.innerText.includes("2/300"),
    doubleReviewed: document.body.innerText.includes("Double reviewed") && document.body.innerText.includes("1/300"),
    unresolved: document.body.innerText.includes("Unresolved") && document.body.innerText.includes("1")
  }));
  if (!expertImport.status || !expertImport.reviewers || !expertImport.rows || !expertImport.coverage || !expertImport.doubleReviewed || !expertImport.unresolved) throw new Error(`Expert adjudication import failed: ${JSON.stringify(expertImport)}`);
  const expertTemplateDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Expert Template" }).click();
  const expertTemplate = await expertTemplateDownload;
  if (!expertTemplate.suggestedFilename().includes("expert_review_template")) throw new Error("Expert template export did not start expected download.");

  await page.locator("aside.left select").nth(0).selectOption("evaluator");
  await page.locator("textarea[placeholder='Manual comment for this item']").fill("manual QA note");
  const evaluatorNote = await page.evaluate(() => document.body.innerText.toLowerCase().includes("evaluator notes") && document.querySelector("textarea")?.value === "manual QA note");
  if (!evaluatorNote) throw new Error("Evaluator note did not persist in UI.");

  await page.locator("aside.left select").nth(1).selectOption("diagnostic20");
  await page.waitForTimeout(50);
  const diagnosticMode = await page.evaluate(() => ({
    counter: document.body.innerText.includes("1/20"),
    blockOptions: document.querySelectorAll("aside.left select")[2]?.querySelectorAll("option").length || 0
  }));
  if (!diagnosticMode.counter || diagnosticMode.blockOptions !== 2) throw new Error(`Diagnostic session failed: ${JSON.stringify(diagnosticMode)}`);
  await page.locator("aside.left select").nth(1).selectOption("full");
  await page.waitForTimeout(50);

  await page.getByRole("button", { name: "Flag" }).first().click();
  const flagged = await page.evaluate(() => document.body.innerText.includes("Flagged") && document.body.innerText.includes("1"));
  if (!flagged) throw new Error("Flag control did not update flagged count.");

  await page.locator("aside.left select").nth(2).selectOption("10");
  await page.waitForTimeout(50);
  const blockJump = await page.evaluate(() => document.body.innerText.includes("101/300") && document.querySelector(".chip")?.textContent === "ACC_101");
  if (!blockJump) throw new Error("Block selector did not jump to ACC_101.");
  await page.locator("aside.left select").nth(2).selectOption("0");
  await page.waitForTimeout(50);

  await page.getByRole("button", { name: "Random Q" }).click();
  await page.waitForTimeout(50);
  const randomizedQuestions = await page.evaluate(() => {
    const order = window.TESTS.map((item, idx) => ({ item, idx })).filter((entry) => document.querySelectorAll(".map-dot")[entry.idx]);
    const visible = [...document.querySelectorAll(".jump")].map((node) => Number(node.textContent.trim()));
    const active = document.querySelector(".chip")?.textContent || "";
    const snapshot = JSON.parse(localStorage.getItem("acc_slot_" + (localStorage.getItem("acc_active_slot") || "default")) || "null");
    return {
      copy: document.body.innerText.includes("shuffles items inside sections"),
      active,
      firstBlockChanged: visible.length === 10 && visible.some((value, index) => value !== index + 1),
      fullSectionA: visible.every((value) => value >= 1 && value <= 100),
      randomQuestions: localStorage.getItem("acc_random_questions") === "true",
      snapshot
    };
  });
  if (!randomizedQuestions.copy || !randomizedQuestions.randomQuestions || !randomizedQuestions.firstBlockChanged || !randomizedQuestions.fullSectionA) {
    throw new Error(`Section randomization failed: ${JSON.stringify(randomizedQuestions)}`);
  }
  await page.getByRole("button", { name: "Random Q" }).click();
  await page.waitForTimeout(50);

  await page.getByRole("button", { name: "Random Opt" }).click();
  const randomizedOptions = await page.evaluate(() => document.body.innerText.toLowerCase().includes("random opt"));
  if (!randomizedOptions) throw new Error("Random option toggle missing.");

  await page.getByRole("button", { name: "High" }).click();
  const highConfidence = await page.evaluate(() => document.body.innerText.toLowerCase().includes("high"));
  if (!highConfidence) throw new Error("Confidence selector did not update.");

  await page.locator(".option").nth(4).click();
  await page.getByRole("button", { name: "Submit Answer" }).click();
  await page.waitForSelector(".review", { timeout: 10000 });
  const afterSubmit = await page.evaluate(() => ({
    progress: document.body.innerText.includes("1/300"),
    rationale: document.body.innerText.toLowerCase().includes("review rationale"),
    correct: document.body.innerText.includes("Correct answer(s):"),
    cefr: document.querySelector(".right .big")?.textContent || "",
    confidenceAdjusted: document.body.innerText.toLowerCase().includes("confidence adjusted"),
    cefrRationale: document.body.innerText.toLowerCase().includes("cefr rationale") && document.body.innerText.includes("Weighted score"),
    answerHistory: document.body.innerText.toLowerCase().includes("answer history"),
    protocolRecords: document.body.innerText.toLowerCase().includes("protocol records"),
    historyRows: document.querySelectorAll(".history-item").length,
    storedHistory: JSON.parse(localStorage.getItem("acc_answer_history") || "{}"),
    storedTime: JSON.parse(localStorage.getItem("acc_time_spent") || "{}")
  }));
  if (!afterSubmit.progress || !afterSubmit.rationale || !afterSubmit.correct || !afterSubmit.confidenceAdjusted || !afterSubmit.cefrRationale || !afterSubmit.answerHistory || !afterSubmit.protocolRecords || afterSubmit.historyRows < 1 || !afterSubmit.storedHistory.ACC_001 || typeof afterSubmit.storedTime.ACC_001 !== "number") {
    throw new Error(`Review interaction failed: ${JSON.stringify(afterSubmit)}`);
  }
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(outputDir, "qa_desktop_after_submit.png"), fullPage: false });

  await page.getByRole("button", { name: "Review Screen" }).click();
  await page.waitForSelector(".review-list", { timeout: 10000 });
  const reviewItems = await page.locator(".review-item").count();
  if (reviewItems < 1) throw new Error("Review screen did not list submitted item.");

  await page.locator("aside.left select").nth(1).selectOption("categoryC");
  await page.waitForTimeout(50);
  const dataMode = await page.evaluate(() => ({
    counter: document.body.innerText.includes("1/100"),
    dataTables: document.querySelectorAll(".data-card table").length,
    miniGraphs: document.querySelectorAll(".data-viz").length,
    vizRows: document.querySelectorAll(".viz-row").length,
    vizAria: Boolean(document.querySelector(".data-viz[role='img'][aria-label]")),
    firstChip: document.querySelector(".chip")?.textContent
  }));
  if (!dataMode.counter || dataMode.dataTables < 1 || dataMode.miniGraphs < 1 || dataMode.vizRows < 3 || !dataMode.vizAria || dataMode.firstChip !== "ACC_201") throw new Error(`Category C data visualization failed: ${JSON.stringify(dataMode)}`);
  await page.locator("aside.left select").nth(1).selectOption("full");
  await page.waitForTimeout(50);

  const beforeTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.getByRole("button", { name: /Dark Theme|Light Theme/ }).click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (theme === beforeTheme) throw new Error(`Theme toggle failed: ${theme}`);

  await page.locator("aside.left input[placeholder='ID, source, module']").fill("ACC_201");
  await page.waitForTimeout(50);
  const searchApplied = await page.evaluate(() => document.querySelector("aside.left input[placeholder='ID, source, module']")?.value === "ACC_201");
  if (!searchApplied) throw new Error("Search input did not retain value.");

  await page.locator("aside.right select").nth(2).selectOption("sans");
  const fontChanged = await page.evaluate(() => document.documentElement.dataset.readingFont === "sans");
  if (!fontChanged) throw new Error("Reading font setting did not apply.");
  await page.locator("aside.right select").nth(3).selectOption("loose");
  const lineChanged = await page.evaluate(() => document.documentElement.dataset.readingLine === "loose");
  if (!lineChanged) throw new Error("Reading line-height setting did not apply.");

  const jsonDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  const download = await jsonDownload;
  if (!download.suggestedFilename().includes("academic-assessment-results")) throw new Error("JSON export did not start expected download.");
  const candidateDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Candidate", exact: true }).click();
  const candidateReport = await candidateDownload;
  if (!candidateReport.suggestedFilename().includes("academic-assessment-candidate-report")) throw new Error("Candidate report export did not start expected download.");
  const evaluatorDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Evaluator", exact: true }).click();
  const evaluatorReport = await evaluatorDownload;
  if (!evaluatorReport.suggestedFilename().includes("academic-assessment-evaluator-report")) throw new Error("Evaluator report export did not start expected download.");

  await page.getByRole("button", { name: "Next Open" }).click();
  const nextOpen = await page.evaluate(() => document.body.innerText.includes("2/300") && document.querySelector(".chip")?.textContent === "ACC_002");
  if (!nextOpen) throw new Error("Next Open did not advance to the next unanswered item.");

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true
  });
  await mobile.addInitScript(() => localStorage.clear());
  const mobilePage = await mobile.newPage();
  mobilePage.on("pageerror", (err) => errors.push(`mobile pageerror: ${err.message}`));
  await mobilePage.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await mobilePage.waitForSelector(".option", { timeout: 10000 });
  const mobileMetrics = await mobilePage.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    options: document.querySelectorAll(".option").length,
    topbar: document.querySelector(".topbar")?.getBoundingClientRect().height || 0,
    actionsPosition: getComputedStyle(document.querySelector(".actions")).position
  }));
  if (mobileMetrics.horizontalOverflow) throw new Error("Mobile horizontal overflow detected.");
  if (mobileMetrics.options !== 5) throw new Error(`Expected 5 mobile options, got ${mobileMetrics.options}`);
  if (mobileMetrics.actionsPosition !== "sticky") throw new Error(`Mobile answer controls are not sticky: ${JSON.stringify(mobileMetrics)}`);
  await mobilePage.screenshot({ path: path.join(outputDir, "qa_mobile_initial.png"), fullPage: false });

  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(JSON.stringify({ browser: executablePath, initial, afterSubmit, reviewItems, theme, mobileMetrics }, null, 2));
})();

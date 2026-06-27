const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("./qa_node/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const htmlPath = path.join(outputDir, "academic_test_platform.html");

const browserCandidates = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];
const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
if (!executablePath) throw new Error("No Edge/Chrome executable found for accessibility audit.");

function summarizeFailures(checks) {
  return checks.filter((check) => check.status !== "pass").map((check) => `${check.name}: ${check.detail}`);
}

(async () => {
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleIssues = [];
  page.on("pageerror", (err) => consoleIssues.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) consoleIssues.push(`${msg.type()}: ${msg.text()}`);
  });

  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".option", { timeout: 10000 });

  const staticChecks = await page.evaluate(() => {
    function controlName(el) {
      const labelledBy = el.getAttribute("aria-labelledby");
      const labelledText = labelledBy
        ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" ")
        : "";
      return [
        el.getAttribute("aria-label"),
        labelledText,
        el.getAttribute("title"),
        el.getAttribute("placeholder"),
        el.textContent?.trim(),
        el.closest("label")?.textContent?.trim()
      ].filter(Boolean).join(" ").trim();
    }
    const unlabeledControls = [...document.querySelectorAll("button, input, select, textarea")]
      .filter((el) => el.type !== "hidden")
      .filter((el) => !controlName(el))
      .map((el) => `${el.tagName.toLowerCase()}${el.type ? `[type=${el.type}]` : ""}`);

    function parseRgb(value) {
      const match = String(value).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)/);
      if (!match) return null;
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] === undefined ? 1 : Number(match[4])
      };
    }
    function luminance(rgb) {
      const values = [rgb.r, rgb.g, rgb.b].map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }
    function contrast(fg, bg) {
      const high = Math.max(luminance(fg), luminance(bg));
      const low = Math.min(luminance(fg), luminance(bg));
      return (high + 0.05) / (low + 0.05);
    }
    function backgroundFor(el) {
      let current = el;
      while (current) {
        const bg = parseRgb(getComputedStyle(current).backgroundColor);
        if (bg && bg.a > 0.65) return bg;
        current = current.parentElement;
      }
      return parseRgb(getComputedStyle(document.body).backgroundColor) || { r: 7, g: 10, b: 15, a: 1 };
    }
    const contrastSamples = [".prompt", ".option span", "button", ".muted", ".chip", ".source a"].map((selector) => {
      const el = document.querySelector(selector);
      if (!el) return { selector, ratio: 0 };
      const fg = parseRgb(getComputedStyle(el).color);
      const bg = backgroundFor(el);
      return { selector, ratio: fg && bg ? Number(contrast(fg, bg).toFixed(2)) : 0 };
    });

    return {
      lang: document.documentElement.lang,
      title: document.title,
      h1: document.querySelectorAll("h1").length,
      manifest: document.querySelector("link[rel='manifest']")?.getAttribute("href") || "",
      skipLink: Boolean(document.querySelector(".skip-link[href='#question-panel']") && document.getElementById("question-panel")),
      landmarks: {
        banner: Boolean(document.querySelector("[role='banner'], header")),
        main: Boolean(document.querySelector("main#main-content")),
        controls: Boolean(document.querySelector("aside[aria-label='Assessment controls']")),
        analytics: Boolean(document.querySelector("aside[aria-label='Analytics, review and export']"))
      },
      progressNav: Boolean(document.querySelector(".progress-map[role='navigation'][aria-label='Progress map']")),
      liveRegion: Boolean(document.querySelector("#status-live[aria-live='polite']")),
      questionRegion: Boolean(document.querySelector("#question-panel[tabindex='-1'][aria-labelledby='question-prompt']")),
      optionsGroup: Boolean(document.querySelector(".options[role='group'][aria-labelledby='question-prompt']")),
      activeProgressCurrent: document.querySelectorAll(".map-dot[aria-current='true']").length,
      pressedToggles: document.querySelectorAll("button[aria-pressed]").length,
      collapsibleAnalytics: {
        toggles: document.querySelectorAll("aside.right .section-toggle[aria-expanded][aria-controls]").length,
        controlledPanels: [...document.querySelectorAll("aside.right .section-toggle[aria-controls]")].filter((button) => document.getElementById(button.getAttribute("aria-controls"))).length
      },
      mapDotsWithLabels: [...document.querySelectorAll(".map-dot")].filter((el) => el.getAttribute("aria-label")).length,
      unlabeledControls,
      contrastSamples,
      dialogReady: Boolean(document.querySelector("[role='dialog']")) || document.body.innerText.toLowerCase().includes("shortcuts")
    };
  });

  await page.locator("aside.left select").nth(1).selectOption("categoryC");
  await page.waitForTimeout(50);
  const dataVisualizationAccessibility = await page.evaluate(() => ({
    visualizations: document.querySelectorAll(".data-viz").length,
    labelledVisualizations: document.querySelectorAll(".data-viz[role='img'][aria-label]").length,
    rows: document.querySelectorAll(".viz-row").length,
    tableFallbacks: document.querySelectorAll(".data-card table").length
  }));
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".option", { timeout: 10000 });

  await page.keyboard.press("Tab");
  const focusCheck = await page.evaluate(() => {
    const el = document.activeElement;
    const style = getComputedStyle(el);
    return {
      tag: el?.tagName || "",
      text: el?.textContent?.trim() || el?.getAttribute("aria-label") || "",
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth
    };
  });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(50);
  const skipActivation = await page.evaluate(() => ({
    activeId: document.activeElement?.id || "",
    targetTop: Math.round(document.getElementById("question-panel")?.getBoundingClientRect().top || 0)
  }));

  await page.getByRole("button", { name: "Shortcuts" }).click();
  const shortcutDialog = await page.evaluate(() => ({
    visible: Boolean(document.querySelector("[role='dialog'][aria-modal='true']")),
    label: document.querySelector("[role='dialog']")?.getAttribute("aria-label") || ""
  }));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(pathToFileURL(htmlPath).href, { waitUntil: "domcontentloaded" });
  await mobile.waitForSelector(".option", { timeout: 10000 });
  const mobileMetrics = await mobile.evaluate(() => ({
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    actionableControls: document.querySelectorAll("button, input, select, textarea").length
  }));

  await browser.close();

  const checks = [
    { name: "language", status: staticChecks.lang === "en" ? "pass" : "fail", detail: staticChecks.lang },
    { name: "title-and-h1", status: staticChecks.title && staticChecks.h1 === 1 ? "pass" : "fail", detail: `${staticChecks.title} / h1=${staticChecks.h1}` },
    { name: "manifest-link", status: staticChecks.manifest === "app.webmanifest" ? "pass" : "fail", detail: staticChecks.manifest || "missing" },
    { name: "skip-link", status: staticChecks.skipLink ? "pass" : "fail", detail: JSON.stringify({ skipLink: staticChecks.skipLink }) },
    { name: "landmarks", status: Object.values(staticChecks.landmarks).every(Boolean) ? "pass" : "fail", detail: JSON.stringify(staticChecks.landmarks) },
    { name: "question-region", status: staticChecks.questionRegion && staticChecks.optionsGroup ? "pass" : "fail", detail: JSON.stringify({ questionRegion: staticChecks.questionRegion, optionsGroup: staticChecks.optionsGroup }) },
    { name: "status-live-region", status: staticChecks.liveRegion ? "pass" : "fail", detail: JSON.stringify({ liveRegion: staticChecks.liveRegion }) },
    { name: "progress-navigation", status: staticChecks.progressNav && staticChecks.activeProgressCurrent === 1 ? "pass" : "fail", detail: JSON.stringify({ progressNav: staticChecks.progressNav, activeProgressCurrent: staticChecks.activeProgressCurrent }) },
    { name: "pressed-toggle-state", status: staticChecks.pressedToggles >= 4 ? "pass" : "fail", detail: `${staticChecks.pressedToggles}` },
    { name: "collapsible-analytics-aria", status: staticChecks.collapsibleAnalytics.toggles >= 8 && staticChecks.collapsibleAnalytics.controlledPanels >= 8 ? "pass" : "fail", detail: JSON.stringify(staticChecks.collapsibleAnalytics) },
    { name: "progress-map-labels", status: staticChecks.mapDotsWithLabels === 300 ? "pass" : "fail", detail: `${staticChecks.mapDotsWithLabels}/300` },
    { name: "control-labels", status: staticChecks.unlabeledControls.length === 0 ? "pass" : "fail", detail: staticChecks.unlabeledControls.slice(0, 10).join(", ") },
    { name: "data-visualization-accessibility", status: dataVisualizationAccessibility.visualizations >= 1 && dataVisualizationAccessibility.labelledVisualizations >= 1 && dataVisualizationAccessibility.rows >= 3 && dataVisualizationAccessibility.tableFallbacks >= 1 ? "pass" : "fail", detail: JSON.stringify(dataVisualizationAccessibility) },
    { name: "contrast-samples", status: staticChecks.contrastSamples.every((sample) => sample.ratio >= 4.5) ? "pass" : "fail", detail: JSON.stringify(staticChecks.contrastSamples) },
    { name: "focus-visible", status: focusCheck.outlineStyle !== "none" && focusCheck.outlineWidth !== "0px" ? "pass" : "fail", detail: JSON.stringify(focusCheck) },
    { name: "skip-link-activation", status: skipActivation.activeId === "question-panel" ? "pass" : "fail", detail: JSON.stringify(skipActivation) },
    { name: "shortcut-dialog-aria", status: shortcutDialog.visible && shortcutDialog.label === "Keyboard shortcuts" ? "pass" : "fail", detail: JSON.stringify(shortcutDialog) },
    { name: "mobile-overflow", status: !mobileMetrics.horizontalOverflow ? "pass" : "fail", detail: JSON.stringify(mobileMetrics) },
    { name: "console-health", status: consoleIssues.length === 0 ? "pass" : "fail", detail: consoleIssues.join("\n") }
  ];

  const summary = {
    checkedAt: new Date().toISOString(),
    browser: executablePath,
    checks,
    staticChecks,
    dataVisualizationAccessibility,
    focusCheck,
    skipActivation,
    shortcutDialog,
    mobileMetrics,
    failures: summarizeFailures(checks)
  };
  fs.writeFileSync(path.join(outputDir, "accessibility_audit.json"), JSON.stringify(summary, null, 2), "utf8");
  const wcagReport = {
    checkedAt: summary.checkedAt,
    status: summary.failures.length ? "automated-readiness-fail" : "automated-readiness-pass-human-at-pending",
    humanAssistiveTechnologyAuditRequired: true,
    evidence: {
      skipLink: staticChecks.skipLink,
      landmarks: staticChecks.landmarks,
      progressNav: staticChecks.progressNav,
      activeProgressCurrent: staticChecks.activeProgressCurrent,
      liveRegion: staticChecks.liveRegion,
      questionRegion: staticChecks.questionRegion,
      optionsGroup: staticChecks.optionsGroup,
      pressedToggles: staticChecks.pressedToggles,
      collapsibleAnalytics: staticChecks.collapsibleAnalytics,
      contrastSamples: staticChecks.contrastSamples,
      dataVisualizationAccessibility,
      focusVisible: focusCheck.outlineStyle !== "none" && focusCheck.outlineWidth !== "0px",
      skipActivation,
      shortcutDialog,
      mobileMetrics
    },
    manualProtocol: "wcag_assistive_tech_protocol.md",
    conformanceMatrix: "wcag_conformance_matrix.json",
    limitations: [
      "Automated checks cannot prove screen-reader comprehension.",
      "Formal conformance requires human assistive-technology signoff."
    ]
  };
  fs.writeFileSync(path.join(outputDir, "wcag_audit_report.json"), JSON.stringify(wcagReport, null, 2), "utf8");
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failures.length) process.exitCode = 1;
})();

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "academic_test_manifest.json"), "utf8"));
const scoreInterpretation = JSON.parse(fs.readFileSync(path.join(outputDir, "score_interpretation_report.json"), "utf8"));
const html = fs.readFileSync(path.join(outputDir, "academic_test_platform.html"), "utf8");

const bands = scoreInterpretation.provisionalBands || [];
const expectedProfiles = ["C1 Developing", "C1 Secure", "C2 Emerging", "C2 Secure"];
const checks = [
  { name: "four-provisional-bands", status: expectedProfiles.every((profile) => bands.some((band) => band.profile === profile)) ? "pass" : "fail" },
  { name: "runtime-band-function", status: /function cefrBandFor/.test(html) && /const cefrBands/.test(html) ? "pass" : "fail" },
  { name: "runtime-explanation-function", status: /function cefrProfileExplanation/.test(html) && /profileExplanation/.test(html) ? "pass" : "fail" },
  { name: "candidate-report-rationale", status: /CEFR rationale/.test(html) && /Interpretation limit/.test(html) ? "pass" : "fail" },
  { name: "dashboard-copy", status: /Weakest module/.test(html) && /Recommendation:/.test(html) ? "pass" : "fail" }
];

const failures = checks.filter((check) => check.status !== "pass");
const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: manifest.bankVersion,
  schemaVersion: manifest.schemaVersion,
  status: failures.length ? "cefr-interpretation-fail" : "cefr-interpretation-ready",
  calibrationStatus: scoreInterpretation.calibrationStatus || "missing",
  productionReady: scoreInterpretation.productionGate?.ready === true,
  bands: expectedProfiles.map((profile) => {
    const band = bands.find((entry) => entry.profile === profile) || {};
    return {
      profile,
      minWeightedPercent: band.minWeightedPercent,
      maxWeightedPercent: band.maxWeightedPercent,
      claim: band.reportableClaim,
      recommendedAction: band.recommendedAction
    };
  }),
  runtimeEvidence: ["cefrBandFor", "cefrProfileExplanation", "profile.profileExplanation", "CEFR rationale in candidate/evaluator reports"],
  limitations: scoreInterpretation.interpretationBoundaries || [],
  checks,
  failures
};

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const matrixRows = [
  ["profile", "min_weighted_percent", "max_weighted_percent", "claim", "recommended_action"],
  ...report.bands.map((band) => [band.profile, band.minWeightedPercent, band.maxWeightedPercent, band.claim, band.recommendedAction])
];

fs.writeFileSync(path.join(outputDir, "cefr_interpretation_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "cefr_interpretation_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ bankVersion: report.bankVersion, status: report.status, bands: report.bands.length }, null, 2));

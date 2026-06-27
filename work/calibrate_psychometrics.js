const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const itemBankPath = path.join(outputDir, "item_bank.json");
const bank = JSON.parse(fs.readFileSync(itemBankPath, "utf8"));
const items = bank.items || [];
const itemById = new Map(items.map((item) => [item.id, item]));

const templatePath = path.join(outputDir, "pilot_response_template.csv");
const reportPath = path.join(outputDir, "psychometric_calibration_report.json");
const summaryCsvPath = path.join(outputDir, "psychometric_item_summary.csv");

const inputPath = process.argv[2] || [
  path.join(root, "work", "pilot_responses.csv"),
  path.join(root, "work", "pilot_responses.json")
].find((candidate) => fs.existsSync(candidate));

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeTemplate() {
  const header = ["candidate_id", "item_id", "selected", "score", "confidence", "time_seconds", "submitted_at"];
  fs.writeFileSync(templatePath, header.map(csvCell).join(",") + "\n", "utf8");
}

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(header.map((key, idx) => [key, values[idx] ?? ""]));
  });
}

function loadResponses(filePath) {
  if (!filePath) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  if (/\.json$/i.test(filePath)) {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.responses || [];
  }
  return parseCsv(raw);
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pearson(xs, ys) {
  if (xs.length < 3 || xs.length !== ys.length) return null;
  const mx = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const my = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i += 1) {
    const ax = xs[i] - mx;
    const ay = ys[i] - my;
    numerator += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  if (!dx || !dy) return null;
  return numerator / Math.sqrt(dx * dy);
}

function recommendation(stats) {
  if (!stats.responseCount) return "awaiting-pilot-data";
  if (stats.responseCount < 50) return "insufficient-pilot-data";
  if (stats.facilityIndex > 0.88) return "retire-too-easy";
  if (stats.facilityIndex < 0.2) return "retire-too-hard-or-ambiguous";
  if (stats.discriminationIndex !== null && stats.discriminationIndex < 0.2) return "review-low-discrimination";
  return "retain";
}

function summarize(responses) {
  const clean = responses
    .map((row) => ({
      candidateId: String(row.candidate_id || row.candidateId || "").trim(),
      itemId: String(row.item_id || row.itemId || "").trim(),
      selected: String(row.selected || "").trim(),
      score: numberOrNull(row.score),
      confidence: String(row.confidence || "").trim().toLowerCase(),
      timeSeconds: numberOrNull(row.time_seconds ?? row.timeSeconds),
      submittedAt: row.submitted_at || row.submittedAt || ""
    }))
    .filter((row) => row.candidateId && itemById.has(row.itemId) && row.score !== null && row.score >= 0 && row.score <= 1);

  const candidateTotals = new Map();
  const candidateItemScores = new Map();
  for (const row of clean) {
    candidateTotals.set(row.candidateId, (candidateTotals.get(row.candidateId) || 0) + row.score);
    const key = `${row.candidateId}::${row.itemId}`;
    candidateItemScores.set(key, row.score);
  }

  const byItem = new Map(items.map((item) => [item.id, []]));
  for (const row of clean) byItem.get(row.itemId)?.push(row);

  const itemStats = items.map((item) => {
    const rows = byItem.get(item.id) || [];
    const scores = rows.map((row) => row.score);
    const facilityIndex = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
    const discriminationXs = [];
    const discriminationYs = [];
    for (const row of rows) {
      const candidateTotal = candidateTotals.get(row.candidateId) || 0;
      const itemScore = candidateItemScores.get(`${row.candidateId}::${item.id}`) || 0;
      discriminationXs.push(itemScore);
      discriminationYs.push(candidateTotal - itemScore);
    }
    const discriminationIndex = pearson(discriminationXs, discriminationYs);
    const timeValues = rows.map((row) => row.timeSeconds).filter((value) => value !== null);
    const meanTimeSeconds = timeValues.length ? timeValues.reduce((sum, value) => sum + value, 0) / timeValues.length : null;
    const confidenceRows = rows.filter((row) => ["low", "medium", "high"].includes(row.confidence));
    const highConfidenceRows = confidenceRows.filter((row) => row.confidence === "high");
    const highConfidenceAccuracy = highConfidenceRows.length
      ? highConfidenceRows.reduce((sum, row) => sum + row.score, 0) / highConfidenceRows.length
      : null;
    const stats = {
      itemId: item.id,
      category: item.category,
      skillModule: item.skillModule,
      difficultyTier: item.difficultyTier,
      responseCount: rows.length,
      facilityIndex: facilityIndex === null ? null : Number(facilityIndex.toFixed(3)),
      discriminationIndex: discriminationIndex === null ? null : Number(discriminationIndex.toFixed(3)),
      meanTimeSeconds: meanTimeSeconds === null ? null : Number(meanTimeSeconds.toFixed(1)),
      highConfidenceAccuracy: highConfidenceAccuracy === null ? null : Number(highConfidenceAccuracy.toFixed(3)),
      targetFacility: item.psychometrics?.targetFacility ?? null,
      targetDiscrimination: item.psychometrics?.targetDiscrimination ?? null
    };
    return { ...stats, retirementRecommendation: recommendation(stats) };
  });

  const recommendations = itemStats.reduce((acc, row) => {
    acc[row.retirementRecommendation] = (acc[row.retirementRecommendation] || 0) + 1;
    return acc;
  }, {});

  return {
    clean,
    itemStats,
    recommendations,
    candidateCount: new Set(clean.map((row) => row.candidateId)).size
  };
}

function buildReport() {
  writeTemplate();
  const responses = loadResponses(inputPath);
  const summary = summarize(responses);
  const hasPilotData = summary.clean.length > 0;
  const report = {
    generatedAt: new Date().toISOString(),
    bankVersion: bank.bankVersion,
    schemaVersion: bank.schemaVersion,
    calibrationStatus: hasPilotData ? "calibrated-from-supplied-pilot-data" : "awaiting-pilot-data",
    inputPath: inputPath || null,
    minimumRecommendedCandidates: 50,
    candidateCount: summary.candidateCount,
    validResponseRows: summary.clean.length,
    itemCount: items.length,
    recommendations: summary.recommendations,
    methodology: {
      facilityIndex: "mean item score from pilot response rows",
      discriminationIndex: "Pearson correlation between item score and candidate total excluding that item",
      retirementRules: "retire/review flags follow response count, facility and discrimination thresholds; these are decision aids, not automatic deletions"
    },
    limitations: hasPilotData
      ? ["Calibration reflects only the supplied pilot response file and should be reviewed for sample representativeness."]
      : ["No pilot response data was found; observed psychometric fields remain pending."],
    items: summary.itemStats
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");
  const csvRows = [
    ["item_id", "category", "skill_module", "difficulty_tier", "response_count", "facility_index", "discrimination_index", "mean_time_seconds", "high_confidence_accuracy", "retirement_recommendation"]
  ];
  for (const row of summary.itemStats) {
    csvRows.push([
      row.itemId,
      row.category,
      row.skillModule,
      row.difficultyTier,
      row.responseCount,
      row.facilityIndex ?? "",
      row.discriminationIndex ?? "",
      row.meanTimeSeconds ?? "",
      row.highConfidenceAccuracy ?? "",
      row.retirementRecommendation
    ]);
  }
  fs.writeFileSync(summaryCsvPath, csvRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
  console.log(JSON.stringify({
    calibrationStatus: report.calibrationStatus,
    candidateCount: report.candidateCount,
    validResponseRows: report.validResponseRows,
    itemCount: report.itemCount,
    recommendations: report.recommendations
  }, null, 2));
}

buildReport();

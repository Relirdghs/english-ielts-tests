const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const bank = JSON.parse(fs.readFileSync(path.join(outputDir, "item_bank.json"), "utf8"));
const items = bank.items || [];
const itemById = new Map(items.map((item) => [item.id, item]));
const inputPath = process.argv[2] || path.join(outputDir, "expert_adjudication_input.csv");
const validDecisions = new Set(["approve", "revise", "retire", "second-review"]);
const validRatings = new Set(["pass", "concern", "fail", ""]);

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const parseLine = (line) => {
    const cells = [];
    let current = "";
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"' && quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) {
        cells.push(current);
        current = "";
      } else current += char;
    }
    cells.push(current);
    return cells;
  };
  const header = parseLine(lines[0]).map((value) => value.trim());
  return lines.slice(1).map((line) => Object.fromEntries(header.map((key, idx) => [key, parseLine(line)[idx] ?? ""])));
}

function normalizeDecision(value) {
  return String(value || "").trim().toLowerCase().replace(/_/g, "-");
}

function normalizeRating(value) {
  return String(value || "").trim().toLowerCase();
}

function buildTemplateRows() {
  const header = [
    "reviewer_id",
    "item_id",
    "decision",
    "construct_alignment",
    "key_defensibility",
    "distractor_plausibility",
    "language_quality",
    "source_scope",
    "severity",
    "notes",
    "reviewed_at",
    "category",
    "skill_module",
    "difficulty_tier",
    "source_domain"
  ];
  const rows = [header];
  for (const item of items) {
    rows.push([
      "",
      item.id,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      item.category,
      item.skillModule,
      item.difficultyTier,
      item.sourceDomain
    ]);
  }
  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

function buildProtocol() {
  return [
    "# Expert Adjudication Protocol",
    "",
    "This protocol defines the human review evidence required before the bank can move beyond professional offline beta.",
    "",
    "## Required CSV Fields",
    "",
    "- `reviewer_id`: stable reviewer code, not personal contact data.",
    "- `item_id`: item ID from `item_bank.json`.",
    "- `decision`: one of `approve`, `revise`, `retire`, `second-review`.",
    "- `construct_alignment`: `pass`, `concern` or `fail`.",
    "- `key_defensibility`: `pass`, `concern` or `fail`.",
    "- `distractor_plausibility`: `pass`, `concern` or `fail`.",
    "- `language_quality`: `pass`, `concern` or `fail`.",
    "- `source_scope`: `pass`, `concern` or `fail`.",
    "- `severity`: optional reviewer severity label.",
    "- `notes`: concise adjudication note.",
    "- `reviewed_at`: ISO timestamp or review date.",
    "",
    "## Completion Gate",
    "",
    "- Every item needs at least two independent reviewer rows.",
    "- Any `revise`, `retire`, `second-review`, `concern` or `fail` row keeps the item unresolved until a later adjudication round closes it.",
    "- The automated report may say `completed-human-adjudication` only when all 300 items have two or more reviewer rows and zero unresolved items.",
    "",
    "## Privacy",
    "",
    "Reviewer IDs should be pseudonymous codes. Do not put personal email addresses, phone numbers, payment details or account identifiers into the CSV.",
    ""
  ].join("\n");
}

function summarize(rows, sourceName) {
  const clean = [];
  const rejected = [];
  rows.forEach((row, idx) => {
    const reviewerId = String(row.reviewer_id || row.reviewerId || "").trim();
    const itemId = String(row.item_id || row.itemId || "").trim();
    const decision = normalizeDecision(row.decision);
    const ratings = {
      constructAlignment: normalizeRating(row.construct_alignment || row.constructAlignment),
      keyDefensibility: normalizeRating(row.key_defensibility || row.keyDefensibility),
      distractorPlausibility: normalizeRating(row.distractor_plausibility || row.distractorPlausibility),
      languageQuality: normalizeRating(row.language_quality || row.languageQuality),
      sourceScope: normalizeRating(row.source_scope || row.sourceScope)
    };
    const issues = [];
    if (!reviewerId) issues.push("missing-reviewer-id");
    if (!itemById.has(itemId)) issues.push("unknown-item-id");
    if (!validDecisions.has(decision)) issues.push("invalid-decision");
    for (const [field, value] of Object.entries(ratings)) {
      if (!validRatings.has(value)) issues.push(`invalid-${field}`);
    }
    if (issues.length) {
      rejected.push({ rowNumber: idx + 2, itemId, reviewerId, issues });
      return;
    }
    clean.push({
      reviewerId,
      itemId,
      decision,
      ratings,
      severity: String(row.severity || "").trim(),
      notes: String(row.notes || "").trim(),
      reviewedAt: String(row.reviewed_at || row.reviewedAt || "").trim()
    });
  });

  const byItem = new Map(items.map((item) => [item.id, []]));
  for (const row of clean) byItem.get(row.itemId).push(row);
  const decisions = Object.fromEntries([...validDecisions].map((decision) => [decision, clean.filter((row) => row.decision === decision).length]));
  const itemSummaries = items.map((item) => {
    const itemRows = byItem.get(item.id) || [];
    const reviewers = new Set(itemRows.map((row) => row.reviewerId));
    const concernRows = itemRows.filter((row) => row.decision !== "approve" || Object.values(row.ratings).some((value) => value === "concern" || value === "fail"));
    return {
      itemId: item.id,
      category: item.category,
      skillModule: item.skillModule,
      reviewerCount: reviewers.size,
      rowCount: itemRows.length,
      decisions: Object.fromEntries([...validDecisions].map((decision) => [decision, itemRows.filter((row) => row.decision === decision).length])),
      unresolved: concernRows.length > 0,
      status: itemRows.length === 0 ? "unreviewed" : reviewers.size < 2 ? "needs-second-review" : concernRows.length ? "needs-resolution" : "approved-by-independent-reviewers"
    };
  });
  const itemCoverage = itemSummaries.filter((row) => row.rowCount > 0).length;
  const doubleReviewedItemCount = itemSummaries.filter((row) => row.reviewerCount >= 2).length;
  const unresolvedItemCount = itemSummaries.filter((row) => row.unresolved).length;
  let status = "awaiting-human-adjudication";
  if (clean.length && itemCoverage < items.length) status = "partial-human-adjudication";
  else if (clean.length && doubleReviewedItemCount < items.length) status = "independent-review-incomplete";
  else if (clean.length && unresolvedItemCount > 0) status = "human-adjudication-needs-resolution";
  else if (clean.length && itemCoverage === items.length) status = "completed-human-adjudication";

  return {
    generatedAt: new Date().toISOString(),
    bankVersion: bank.bankVersion,
    schemaVersion: bank.schemaVersion,
    sourceName,
    status,
    itemCount: items.length,
    reviewerCount: new Set(clean.map((row) => row.reviewerId)).size,
    validReviewRows: clean.length,
    rejectedRows: rejected,
    itemCoverage,
    doubleReviewedItemCount,
    unresolvedItemCount,
    decisions,
    completionGate: {
      minimumIndependentReviewsPerItem: 2,
      requiresAllItemsCovered: true,
      requiresZeroUnresolvedItems: true,
      gateReady: status === "completed-human-adjudication"
    },
    limitations: [
      "The report validates reviewer rows; it does not itself supply human expertise.",
      "A completed gate requires two independent rows for every item and no unresolved revise/retire/second-review decisions.",
      "Reviewer IDs should remain pseudonymous and must not contain personal contact data."
    ],
    items: itemSummaries
  };
}

const rows = fs.existsSync(inputPath) ? parseCsv(fs.readFileSync(inputPath, "utf8")) : [];
const report = summarize(rows, fs.existsSync(inputPath) ? path.basename(inputPath) : "no-input-file");

fs.writeFileSync(path.join(outputDir, "expert_review_template.csv"), buildTemplateRows(), "utf8");
fs.writeFileSync(path.join(outputDir, "expert_review_protocol.md"), buildProtocol(), "utf8");
fs.writeFileSync(path.join(outputDir, "expert_adjudication_report.json"), JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  reviewerCount: report.reviewerCount,
  validReviewRows: report.validReviewRows,
  itemCoverage: report.itemCoverage,
  doubleReviewedItemCount: report.doubleReviewedItemCount,
  unresolvedItemCount: report.unresolvedItemCount
}, null, 2));

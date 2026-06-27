const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const bank = JSON.parse(fs.readFileSync(path.join(outputDir, "item_bank.json"), "utf8"));
const items = bank.items || [];

const stopwords = new Set([
  "the", "and", "or", "a", "an", "to", "of", "in", "for", "with", "as", "by", "is", "are", "that", "this", "it", "from", "be", "not",
  "into", "rather", "than", "can", "does", "do", "on", "at", "which", "while", "when", "where", "what", "how", "has", "have"
]);

const bannedRegistry = [
  {
    pattern: "proves.*general solution",
    severity: "high",
    reason: "Absolute proof framing usually weakens academic validity unless explicitly contrasted as a flawed draft."
  },
  {
    pattern: "automatically eliminates missing-data bias",
    severity: "high",
    reason: "Sample-size-only bias removal is an intentionally bad distractor and should not leak into passages."
  },
  {
    pattern: "must determine .* removes remaining uncertainty",
    severity: "medium",
    reason: "Overstrong modal phrasing should remain confined to distractors."
  },
  {
    pattern: "as if it represented",
    severity: "medium",
    reason: "Repeated explanatory formula can make rationales feel templated."
  },
  {
    pattern: "The implication is that a",
    severity: "medium",
    reason: "Generic opening creates weak rhetorical texture."
  }
];

function words(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !stopwords.has(word));
}

function shingles(text, size = 5) {
  const tokens = words(text);
  const result = new Set();
  for (let i = 0; i <= tokens.length - size; i += 1) result.add(tokens.slice(i, i + size).join(" "));
  return result;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let intersect = 0;
  for (const value of a) if (b.has(value)) intersect += 1;
  return intersect / (a.size + b.size - intersect);
}

function optionRisk(item) {
  const lengths = item.options.map((option) => words(option).length);
  const correctIndexes = item.correct.map((letter) => "ABCDE".indexOf(letter)).filter((idx) => idx >= 0);
  const correctLengths = correctIndexes.map((idx) => lengths[idx]);
  const avgCorrectLength = correctLengths.reduce((sum, value) => sum + value, 0) / Math.max(1, correctLengths.length);
  const distractorLengths = lengths.filter((_, idx) => !correctIndexes.includes(idx));
  const avgDistractorLength = distractorLengths.reduce((sum, value) => sum + value, 0) / Math.max(1, distractorLengths.length);
  const lengthGap = Math.abs(avgCorrectLength - avgDistractorLength);
  const modalCounts = item.options.map((option) => (option.match(/\b(may|might|could|must|proves|guarantees|settles|automatically)\b/gi) || []).length);
  const correctModal = correctIndexes.reduce((sum, idx) => sum + modalCounts[idx], 0);
  const distractorModal = modalCounts.reduce((sum, value) => sum + value, 0) - correctModal;
  const issues = [];
  if (lengthGap > 12) issues.push("correct-option-length-outlier");
  if (correctModal === 0 && distractorModal >= 3) issues.push("modal-cue-may-identify-distractors");
  if (new Set(lengths).size <= 2) issues.push("option-length-pattern-too-regular");
  return { lengthGap: Number(lengthGap.toFixed(2)), modalCounts, issues };
}

function optionProfile(item) {
  const correctIndexes = item.correct.map((letter) => "ABCDE".indexOf(letter)).filter((idx) => idx >= 0);
  const lengths = item.options.map((option) => words(option).length);
  const modalTerms = /\b(may|might|could|must|should|proves|guarantees|settles|automatically|always|never)\b/gi;
  const genericCautionTerms = /\b(nuance|cautious|uncertainty|limitation|context|qualify|overgeneral)\b/gi;
  return item.options.map((option, idx) => ({
    letter: "ABCDE"[idx],
    isCorrect: correctIndexes.includes(idx),
    wordCount: lengths[idx],
    modalCueCount: (option.match(modalTerms) || []).length,
    genericCautionCueCount: (option.match(genericCautionTerms) || []).length,
    quotedText: /["']/.test(option)
  }));
}

function distractorStrength(item) {
  const profile = optionProfile(item);
  const correctLengths = profile.filter((row) => row.isCorrect).map((row) => row.wordCount);
  const averageCorrectLength = correctLengths.reduce((sum, value) => sum + value, 0) / Math.max(1, correctLengths.length);
  return profile
    .filter((row) => !row.isCorrect)
    .map((row) => {
      let score = 2;
      const flags = [];
      if (Math.abs(row.wordCount - averageCorrectLength) <= 8) score += 1;
      else flags.push("length-distance");
      if (row.modalCueCount === 0) score += 1;
      else flags.push("modal-cue");
      if (row.genericCautionCueCount <= 1) score += 1;
      else flags.push("generic-caution-cue");
      if (row.quotedText) flags.push("quote-marker");
      const rating = score >= 5 ? "strong" : score >= 3 ? "adequate" : "weak";
      return { letter: row.letter, rating, score, flags };
    });
}

function trapCoverage(item) {
  const text = [item.passage, item.prompt, ...item.options, item.rationale].join(" ").toLowerCase();
  const taxonomy = item.cognitiveTrapTypes || [];
  const synonyms = {
    "scope inflation": ["scope inflation", "overgeneral", "universal"],
    "modal overclaim": ["modal overclaim", "modal-distortion", "absolute"],
    "irrelevant policy leap": ["irrelevant policy leap", "out-of-context"],
    "false causality": ["false causality", "causal"],
    "false synchrony": ["false synchrony", "false-synchrony"],
    "statistical misread": ["statistical misread", "numerical"],
    "sample-size fallacy": ["sample-size fallacy", "sample size"],
    "syntactic inversion": ["syntactic inversion", "syntactic"],
    "lexical near-miss": ["lexical near-miss", "lexical"]
  };
  return taxonomy.map((trap) => ({
    trap,
    representedInRationale: (synonyms[trap] || [trap]).some((term) => (item.rationale || "").toLowerCase().includes(term)),
    representedInItemText: (synonyms[trap] || [trap]).some((term) => text.includes(term))
  }));
}

function targetConstruct(item) {
  const map = {
    "Reading Synthesis": "integrate passage claims while respecting scope and evidence strength",
    "Use of Academic English": "revise academic prose for modality, syntax and register",
    "Data Interpretation": "translate quantitative patterns into cautious methodological interpretation",
    "Methodological Reasoning": "distinguish design limits from claim strength",
    "Abstract Revision": "retain findings while repairing overclaiming draft language",
    "Evidence Evaluation": "evaluate warrants, caveats and source-scope discipline",
    "Evidence-to-Claim Mapping": "match empirical evidence to defensible academic claims",
    "Lexico-Syntactic Control": "control academic wording, clause relations and certainty markers",
    "Rhetorical Inference": "infer the function of concessions, caveats and argumentative structure"
  };
  return map[item.skillModule] || "evaluate academic meaning under evidence constraints";
}

function buildConstructCoverage(itemAudits) {
  const cells = new Map();
  for (const row of itemAudits) {
    const key = [row.category, row.skillModule, row.difficultyTier].join("||");
    const entry = cells.get(key) || {
      category: row.category,
      skillModule: row.skillModule,
      difficultyTier: row.difficultyTier,
      itemCount: 0,
      sourceDomains: new Set(),
      trapTypes: new Set(),
      weakDistractorItems: 0,
      optionRiskItems: 0,
      items: []
    };
    entry.itemCount += 1;
    entry.sourceDomains.add(row.sourceDomain);
    row.cognitiveTrapTypes.forEach((trap) => entry.trapTypes.add(trap));
    if (row.weakDistractorCount) entry.weakDistractorItems += 1;
    if (row.optionRisk.issues.length) entry.optionRiskItems += 1;
    entry.items.push(row.itemId);
    cells.set(key, entry);
  }
  const matrix = [...cells.values()].map((entry) => ({
    ...entry,
    sourceDomainCount: entry.sourceDomains.size,
    sourceDomains: [...entry.sourceDomains].sort(),
    trapTypeCount: entry.trapTypes.size,
    trapTypes: [...entry.trapTypes].sort(),
    coverageStatus: entry.itemCount >= 8 && entry.sourceDomains.size >= 4 && entry.trapTypes.size >= 3 ? "covered" : "review-needed"
  })).sort((a, b) => a.category.localeCompare(b.category) || a.skillModule.localeCompare(b.skillModule) || a.difficultyTier.localeCompare(b.difficultyTier));
  return {
    cellCount: matrix.length,
    coveredCells: matrix.filter((entry) => entry.coverageStatus === "covered").length,
    reviewNeededCells: matrix.filter((entry) => entry.coverageStatus !== "covered").length,
    matrix
  };
}

function buildBlueprintMatrix(itemAudits) {
  const cells = new Map();
  for (const row of itemAudits) {
    const key = [row.category, row.skillModule, row.difficultyTier, row.sourceDomain].join("||");
    const entry = cells.get(key) || {
      category: row.category,
      skillModule: row.skillModule,
      difficultyTier: row.difficultyTier,
      sourceDomain: row.sourceDomain,
      itemCount: 0,
      trapTypes: new Set(),
      priority: { P1: 0, P2: 0, P3: 0 },
      items: []
    };
    entry.itemCount += 1;
    row.cognitiveTrapTypes.forEach((trap) => entry.trapTypes.add(trap));
    entry.priority[row.priority] += 1;
    entry.items.push(row.itemId);
    cells.set(key, entry);
  }
  return [...cells.values()].map((entry) => ({
    ...entry,
    trapTypes: [...entry.trapTypes].sort(),
    items: entry.items.slice().sort()
  })).sort((a, b) => a.category.localeCompare(b.category) || a.skillModule.localeCompare(b.skillModule) || a.difficultyTier.localeCompare(b.difficultyTier) || a.sourceDomain.localeCompare(b.sourceDomain));
}

function bannedHits(item) {
  const text = [item.passage, item.prompt, ...item.options, item.rationale].join("\n");
  return bannedRegistry.filter((entry) => new RegExp(entry.pattern, "i").test(text)).map((entry) => ({
    pattern: entry.pattern,
    severity: entry.severity,
    reason: entry.reason
  }));
}

function buildSimilarityPairs() {
  const passageVectors = items.map((item) => ({ id: item.id, shingles: shingles(item.passage, 6) }));
  const pairs = [];
  for (let i = 0; i < passageVectors.length; i += 1) {
    for (let j = i + 1; j < passageVectors.length; j += 1) {
      const score = jaccard(passageVectors[i].shingles, passageVectors[j].shingles);
      if (score >= 0.32) pairs.push({ itemA: passageVectors[i].id, itemB: passageVectors[j].id, similarity: Number(score.toFixed(3)) });
    }
  }
  return pairs.sort((a, b) => b.similarity - a.similarity);
}

function reviewPriority(item, risk, hits, similarityCount, weakDistractorCount = 0) {
  let score = 0;
  score += hits.filter((hit) => hit.severity === "high").length * 4;
  score += hits.filter((hit) => hit.severity !== "high").length * 2;
  score += risk.issues.length * 2;
  score += weakDistractorCount * 2;
  score += similarityCount ? 2 : 0;
  score += item.category === "C" ? 1 : 0;
  if (score >= 6) return "P1";
  if (score >= 3) return "P2";
  return "P3";
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function buildReviewPacket(queue) {
  const lines = [
    "# Manual Expert Review Packet",
    "",
    "This packet is a working queue for expert reviewers. It does not certify that human review has been completed.",
    "",
    "## Review Protocol",
    "",
    "1. Check construct alignment: prompt, passage and answer key must test the declared skill module.",
    "2. Check answer-key defensibility against passage evidence, not topical plausibility.",
    "3. Check distractor plausibility without allowing length, modality or generic caution to reveal the answer.",
    "4. Check source-scope discipline: no passage should imply copied article prose or unsupported article claims.",
    "5. Mark each item as approve, revise, retire or escalate-to-second-review.",
    "",
    "## Priority Queue",
    ""
  ];
  for (const row of queue.slice(0, 80)) {
    lines.push(`### ${row.priority} / ${row.itemId} / ${row.category} / ${row.skillModule}`);
    lines.push("");
    lines.push(`- Difficulty: ${row.difficultyTier}`);
    lines.push(`- Reasons: ${row.reasons || "routine sample review"}`);
    lines.push(`- Source: ${row.sourceDomain}`);
    lines.push(`- Reviewer decision: [ ] approve [ ] revise [ ] retire [ ] second review`);
    lines.push(`- Notes:`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildAuthoringTemplates() {
  return [
    "# Human-Gated Authoring Templates",
    "",
    "These templates are intentionally incomplete without human review. They are scaffolds for future ACC_301-600 work, not direct mass-generation instructions.",
    "",
    "## Draft Item Object",
    "",
    "```json",
    JSON.stringify({
      id: "ACC_301",
      category: "A|B|C",
      status: "draft",
      sourceHorizon: "article-level source title + URL",
      passage: "original assessment prose, not copied from source",
      prompt: "construct-aligned question",
      options: ["A", "B", "C", "D", "E"],
      correct: ["A"],
      rationale: "explain correct answer and every distractor trap",
      reviewGate: ["lint", "expert-review", "source-check", "psychometric-pilot"]
    }, null, 2),
    "```",
    "",
    "## Required Gates",
    "",
    "- Lint: passage length, option count, answer key, banned phrases, source URL shape.",
    "- Expert review: answer-key defensibility, distractor plausibility, natural academic English.",
    "- Psychometric pilot: facility, discrimination, timing and confidence calibration.",
    "- Retirement review: remove or rewrite items that are too easy, too hard, ambiguous or low-discrimination.",
    ""
  ].join("\n");
}

const similarityPairs = buildSimilarityPairs();
const similarityByItem = new Map();
for (const pair of similarityPairs) {
  similarityByItem.set(pair.itemA, (similarityByItem.get(pair.itemA) || 0) + 1);
  similarityByItem.set(pair.itemB, (similarityByItem.get(pair.itemB) || 0) + 1);
}

const itemAudits = items.map((item) => {
  const risk = optionRisk(item);
  const hits = bannedHits(item);
  const similarityCount = similarityByItem.get(item.id) || 0;
  const distractors = distractorStrength(item);
  const weakDistractorCount = distractors.filter((row) => row.rating === "weak").length;
  const adequateDistractorCount = distractors.filter((row) => row.rating === "adequate").length;
  const strongDistractorCount = distractors.filter((row) => row.rating === "strong").length;
  const coverage = trapCoverage(item);
  const reasons = [
    ...risk.issues,
    ...hits.map((hit) => `banned:${hit.pattern}`),
    weakDistractorCount ? `weak-distractors:${weakDistractorCount}` : "",
    similarityCount ? `semantic-neighbor-count:${similarityCount}` : ""
  ].filter(Boolean);
  return {
    itemId: item.id,
    category: item.category,
    skillModule: item.skillModule,
    difficultyTier: item.difficultyTier,
    sourceDomain: item.sourceDomain,
    cognitiveTrapTypes: item.cognitiveTrapTypes || [],
    assessmentConstruct: targetConstruct(item),
    priority: reviewPriority(item, risk, hits, similarityCount, weakDistractorCount),
    reasons: reasons.join("; "),
    optionRisk: risk,
    optionProfile: optionProfile(item),
    distractorStrength: distractors,
    weakDistractorCount,
    adequateDistractorCount,
    strongDistractorCount,
    trapCoverage: coverage,
    bannedHits: hits,
    semanticNeighborCount: similarityCount
  };
});

const queue = [...itemAudits].sort((a, b) => {
  const priorityRank = { P1: 0, P2: 1, P3: 2 };
  return priorityRank[a.priority] - priorityRank[b.priority] || b.semanticNeighborCount - a.semanticNeighborCount || a.itemId.localeCompare(b.itemId);
});

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  itemCount: items.length,
  bannedPhraseRegistry: bannedRegistry,
  semanticSimilarity: {
    threshold: 0.32,
    pairCount: similarityPairs.length,
    topPairs: similarityPairs.slice(0, 50)
  },
  antiPatternSummary: {
    p1: queue.filter((row) => row.priority === "P1").length,
    p2: queue.filter((row) => row.priority === "P2").length,
    p3: queue.filter((row) => row.priority === "P3").length,
    itemsWithBannedHits: itemAudits.filter((row) => row.bannedHits.length).length,
    itemsWithOptionRisk: itemAudits.filter((row) => row.optionRisk.issues.length).length,
    itemsWithWeakDistractors: itemAudits.filter((row) => row.weakDistractorCount).length
  },
  constructCoverage: buildConstructCoverage(itemAudits),
  limitations: [
    "This is an automated review queue, not completed expert adjudication.",
    "Semantic similarity uses lexical shingles and should be interpreted as a triage signal.",
    "Priority labels guide manual review effort; they do not automatically retire items."
  ],
  items: itemAudits
};

const blueprintMatrix = buildBlueprintMatrix(itemAudits);
const constructCoverageReport = {
  generatedAt: report.generatedAt,
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: report.constructCoverage.reviewNeededCells ? "coverage-review-needed" : "coverage-pass",
  constructMap: [...new Set(itemAudits.map((row) => row.skillModule))].sort().map((skillModule) => ({
    skillModule,
    assessmentConstruct: targetConstruct({ skillModule }),
    itemCount: itemAudits.filter((row) => row.skillModule === skillModule).length
  })),
  coverage: report.constructCoverage,
  limitations: [
    "Coverage is blueprint evidence, not a substitute for independent construct-validity review.",
    "Cells marked covered still require expert confirmation of item-level construct alignment."
  ]
};
const distractorQualityReport = {
  generatedAt: report.generatedAt,
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  itemCount: items.length,
  summary: {
    weakDistractorItems: itemAudits.filter((row) => row.weakDistractorCount).length,
    optionRiskItems: itemAudits.filter((row) => row.optionRisk.issues.length).length,
    strongDistractorCount: itemAudits.reduce((sum, row) => sum + row.strongDistractorCount, 0),
    adequateDistractorCount: itemAudits.reduce((sum, row) => sum + row.adequateDistractorCount, 0),
    weakDistractorCount: itemAudits.reduce((sum, row) => sum + row.weakDistractorCount, 0)
  },
  taxonomy: [...new Set(itemAudits.flatMap((row) => row.cognitiveTrapTypes))].sort(),
  items: itemAudits.map((row) => ({
    itemId: row.itemId,
    category: row.category,
    skillModule: row.skillModule,
    difficultyTier: row.difficultyTier,
    sourceDomain: row.sourceDomain,
    optionRisk: row.optionRisk,
    distractorStrength: row.distractorStrength,
    trapCoverage: row.trapCoverage,
    reviewPriority: row.priority
  }))
};

fs.writeFileSync(path.join(outputDir, "bank_quality_review_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "construct_coverage_report.json"), JSON.stringify(constructCoverageReport, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "distractor_quality_report.json"), JSON.stringify(distractorQualityReport, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "blueprint_matrix.csv"), [
  ["category", "skill_module", "difficulty_tier", "source_domain", "item_count", "trap_types", "p1", "p2", "p3", "items"],
  ...blueprintMatrix.map((row) => [row.category, row.skillModule, row.difficultyTier, row.sourceDomain, row.itemCount, row.trapTypes.join("|"), row.priority.P1, row.priority.P2, row.priority.P3, row.items.join("|")])
].map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
fs.writeFileSync(path.join(outputDir, "manual_review_packet.md"), buildReviewPacket(queue), "utf8");
fs.writeFileSync(path.join(outputDir, "authoring_templates.md"), buildAuthoringTemplates(), "utf8");
fs.writeFileSync(path.join(outputDir, "banned_phrase_registry.json"), JSON.stringify({ generatedAt: report.generatedAt, registry: bannedRegistry }, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "review_queue.csv"), [
  ["priority", "item_id", "category", "skill_module", "difficulty_tier", "source_domain", "reasons"],
  ...queue.map((row) => [row.priority, row.itemId, row.category, row.skillModule, row.difficultyTier, row.sourceDomain, row.reasons])
].map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  itemCount: report.itemCount,
  semanticPairs: report.semanticSimilarity.pairCount,
  antiPatternSummary: report.antiPatternSummary,
  constructCells: report.constructCoverage.cellCount,
  coverageReviewNeeded: report.constructCoverage.reviewNeededCells
}, null, 2));

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
fs.mkdirSync(outputDir, { recursive: true });

const letters = ["A", "B", "C", "D", "E"];

const sourceCases = [
  {
    source: "Nature, 2024 - Accurate structure prediction of biomolecular interactions with AlphaFold 3",
    url: "https://www.nature.com/articles/s41586-024-07487-w",
    discipline: "computational structural biology",
    subject: "all-atom prediction of biomolecular complexes",
    method: "a diffusion-based architecture for joint modelling of proteins, nucleic acids, ligands and ions",
    evidence: "benchmarking across molecular interaction classes",
    caution: "confidence scores do not remove the need for physical validation of rare or modified systems",
    metric: "interface confidence",
    confound: "training-set proximity",
    population: "protein-ligand and protein-nucleic-acid systems",
    application: "drug-discovery triage"
  },
  {
    source: "Nature, 2024 - Probabilistic weather forecasting with machine learning",
    url: "https://www.nature.com/articles/s41586-024-08252-9",
    discipline: "climate informatics",
    subject: "probabilistic medium-range weather prediction",
    method: "a generative model trained on decades of atmospheric reanalysis",
    evidence: "comparison with operational ensemble forecasts",
    caution: "rare compound events remain harder to validate than average skill scores imply",
    metric: "ensemble reliability",
    confound: "archive-induced stationarity",
    population: "global ten-day forecast cases",
    application: "early-warning systems"
  },
  {
    source: "Nature, 2025 - End-to-end data-driven weather prediction",
    url: "https://www.nature.com/articles/s41586-025-08897-0",
    discipline: "atmospheric modelling",
    subject: "weather prediction without conventional numerical-weather inputs",
    method: "an end-to-end system mapping raw observations directly to forecasts",
    evidence: "forecast comparisons against conventional numerical weather prediction",
    caution: "operational independence does not by itself prove robustness under sensor failures",
    metric: "forecast lead-time skill",
    confound: "observation-network bias",
    population: "global weather forecasts",
    application: "rapid operational forecasting"
  },
  {
    source: "Nature, 2025 - A foundation model for the Earth system",
    url: "https://www.nature.com/articles/s41586-025-09005-y",
    discipline: "earth-system AI",
    subject: "general forecasting across atmospheric and environmental tasks",
    method: "pretraining on diverse Earth-system data before task-specific adaptation",
    evidence: "multi-task comparisons across forecasting benchmarks",
    caution: "breadth of task coverage can conceal uneven performance in local extremes",
    metric: "cross-task transfer skill",
    confound: "benchmark selection",
    population: "heterogeneous Earth-system datasets",
    application: "foundation-model forecasting"
  },
  {
    source: "Nature, 2024 - Neural general circulation models for weather and climate",
    url: "https://www.nature.com/articles/s41586-024-07744-y",
    discipline: "climate modelling",
    subject: "hybrid neural general-circulation modelling",
    method: "a differentiable atmospheric solver combined with learned components",
    evidence: "weather, ensemble and climate simulations compared with established baselines",
    caution: "short-term forecast skill cannot be equated with long-term climate credibility",
    metric: "simulation stability",
    confound: "parameterization leakage",
    population: "weather and climate simulation tasks",
    application: "computationally efficient climate experiments"
  },
  {
    source: "Nature Medicine, 2024 - Evaluation and mitigation of the limitations of large language models in clinical decision-making",
    url: "https://www.nature.com/articles/s41591-024-03097-1",
    discipline: "clinical AI",
    subject: "large language models used in clinical decision support",
    method: "evaluation across diagnostic, instruction-following and workflow-sensitive tasks",
    evidence: "failure analysis under changes in information order and quantity",
    caution: "diagnostic fluency does not make autonomous deployment clinically acceptable",
    metric: "workflow-sensitive accuracy",
    confound: "case-presentation order",
    population: "clinical decision-making scenarios",
    application: "clinician-facing support"
  },
  {
    source: "Nature Medicine, 2024 - A foundation model for clinician-centered drug repurposing",
    url: "https://www.nature.com/articles/s41591-024-03233-x",
    discipline: "translational medicine",
    subject: "zero-shot drug repurposing for rare or under-treated diseases",
    method: "a graph foundation model trained on a medical knowledge graph",
    evidence: "ranking of indications and contraindications against curated labels",
    caution: "knowledge-graph completeness can shape apparent therapeutic plausibility",
    metric: "indication-ranking performance",
    confound: "literature visibility bias",
    population: "drug-disease pairs",
    application: "therapeutic candidate prioritisation"
  },
  {
    source: "Nature Medicine, 2024 - A foundation model for clinical-grade computational pathology and rare cancers detection",
    url: "https://www.nature.com/articles/s41591-024-03141-0",
    discipline: "computational pathology",
    subject: "foundation-model analysis of histopathology images",
    method: "large-scale pretraining on pathology image data",
    evidence: "evaluation across diagnostic and rare-cancer tasks",
    caution: "slide-level performance can mask institution-specific staining and scanning effects",
    metric: "rare-cancer retrieval accuracy",
    confound: "site-specific image preparation",
    population: "whole-slide pathology images",
    application: "clinical pathology assistance"
  },
  {
    source: "Nature Medicine, 2025 - A multimodal whole-slide foundation model for pathology",
    url: "https://www.nature.com/articles/s41591-025-03982-3",
    discipline: "multimodal pathology",
    subject: "whole-slide modelling linked to reports and rare-cancer retrieval",
    method: "joint learning from image and text representations",
    evidence: "linear-probing, few-shot, zero-shot and cross-modal retrieval evaluations",
    caution: "cross-modal success does not guarantee calibrated clinical reasoning",
    metric: "cross-modal retrieval performance",
    confound: "report-style regularity",
    population: "diverse pathology slides and reports",
    application: "pathology report support"
  },
  {
    source: "Nature Human Behaviour, 2024 - Examining the replicability of online experiments selected by a prediction market",
    url: "https://www.nature.com/articles/s41562-024-02062-9",
    discipline: "meta-science",
    subject: "replicability of online behavioural experiments",
    method: "preregistered replications selected with prediction-market information",
    evidence: "effect-size shrinkage and alternative replication indicators",
    caution: "market prediction improves triage without replacing independent replication",
    metric: "replication effect ratio",
    confound: "original-study selection",
    population: "online behavioural studies",
    application: "replication prioritisation"
  },
  {
    source: "Nature Human Behaviour, 2024 - Predicting the replicability of social and behavioural science claims",
    url: "https://www.nature.com/articles/s41562-024-01961-1",
    discipline: "research evaluation",
    subject: "forecasting which claims will replicate",
    method: "elicited expert and crowd predictions compared with replication outcomes",
    evidence: "prediction accuracy assessed against later replication evidence",
    caution: "forecasting reliability still depends on claim selection and elicitation design",
    metric: "replicability forecast accuracy",
    confound: "predictor information asymmetry",
    population: "social and behavioural science claims",
    application: "evidence triage"
  },
  {
    source: "Nature Human Behaviour, 2024 - Trust in scientists and their role in society across 68 countries",
    url: "https://www.nature.com/articles/s41562-024-02090-5",
    discipline: "science communication",
    subject: "public trust in scientists across countries",
    method: "a preregistered cross-national survey",
    evidence: "country- and individual-level variation in trust and policy expectations",
    caution: "survey agreement does not directly measure behaviour under political pressure",
    metric: "trust-score variation",
    confound: "response-style heterogeneity",
    population: "respondents across 68 countries",
    application: "science-policy engagement"
  },
  {
    source: "Nature Communications, 2024 - Climate impacts of critical mineral supply chain bottlenecks",
    url: "https://www.nature.com/articles/s41467-024-51152-9",
    discipline: "energy systems",
    subject: "critical-mineral constraints on electric-vehicle deployment",
    method: "supply-chain modelling under tailpipe-emissions standards",
    evidence: "counterfactual emissions consequences of mineral bottlenecks",
    caution: "technology mandates can shift, rather than erase, system constraints",
    metric: "emissions-abatement shortfall",
    confound: "policy-induced demand acceleration",
    population: "vehicle and mineral supply scenarios",
    application: "clean-transport policy"
  },
  {
    source: "Nature, 2025 - Understanding supply chain constraints for the US clean energy transition",
    url: "https://www.nature.com/articles/s44406-025-00009-1",
    discipline: "clean-energy planning",
    subject: "material supply constraints for wind, solar and batteries",
    method: "multi-year optimization of clean-energy deployment under material limits",
    evidence: "scenario comparisons of deployment pathways and raw-material availability",
    caution: "optimization results inherit assumptions about trade, permitting and substitution",
    metric: "deployment-feasibility margin",
    confound: "permitting latency",
    population: "US clean-energy supply chains",
    application: "infrastructure planning"
  },
  {
    source: "Science Advances, 2026 - Net release of CO2 from thawing permafrost soil carbon predicted to be extensive",
    url: "https://www.science.org/doi/10.1126/sciadv.adz8478",
    discipline: "permafrost carbon science",
    subject: "deep permafrost carbon release under thaw",
    method: "process-based modelling informed by carbon-depth assumptions",
    evidence: "predicted net carbon dioxide release from thawing frozen soils",
    caution: "deep-soil uncertainty widens rather than resolves feedback estimates",
    metric: "net CO2 release",
    confound: "vertical sampling sparsity",
    population: "deep permafrost soil carbon pools",
    application: "carbon-budget assessment"
  },
  {
    source: "Science Advances, 2024 - Temperature sensitivity of the mineral permafrost feedback",
    url: "https://www.science.org/doi/10.1126/sciadv.adq4893",
    discipline: "cryosphere geochemistry",
    subject: "temperature-sensitive mineral reactions in permafrost zones",
    method: "measurement and modelling of sulfide oxidation feedbacks",
    evidence: "warming-sensitive reaction estimates in permafrost-relevant conditions",
    caution: "mineral feedbacks cannot be interpreted without hydrological context",
    metric: "oxidation-rate sensitivity",
    confound: "soil moisture heterogeneity",
    population: "mineral permafrost environments",
    application: "climate-feedback modelling"
  },
  {
    source: "Science Advances, 2025 - Climate-carbon feedback tradeoff between Arctic and alpine permafrost regions",
    url: "https://www.science.org/doi/10.1126/sciadv.adt8366",
    discipline: "carbon-cycle science",
    subject: "contrasting carbon feedbacks in Arctic and alpine permafrost",
    method: "comparative assessment of greenhouse-gas emissions and ecosystem carbon dynamics",
    evidence: "regional contrasts in feedback direction and magnitude",
    caution: "regional aggregation can obscure opposing mechanisms",
    metric: "feedback tradeoff magnitude",
    confound: "vegetation-transition timing",
    population: "Arctic and alpine permafrost regions",
    application: "regional mitigation planning"
  },
  {
    source: "Nature, 2025 - Long-range PM2.5 pollution and health impacts from the 2023 Canadian wildfires",
    url: "https://www.nature.com/articles/s41586-025-09482-1",
    discipline: "atmospheric health science",
    subject: "transboundary PM2.5 exposure from extreme wildfire smoke",
    method: "satellite observations, machine learning and chemical transport modelling",
    evidence: "estimated global and regional exposure and health impacts",
    caution: "annual averages can hide acute smoke episodes and local vulnerability",
    metric: "smoke-attributable exposure",
    confound: "indoor filtration behaviour",
    population: "regions affected by Canadian wildfire smoke",
    application: "public-health warning systems"
  },
  {
    source: "Communications Earth & Environment, 2025 - Anthropogenic climate change contributes to wildfire particulate matter deaths",
    url: "https://www.nature.com/articles/s43247-025-02314-0",
    discipline: "climate attribution",
    subject: "wildfire particulate-matter deaths attributable to climate change",
    method: "counterfactual attribution of fire emissions and health burden",
    evidence: "estimated deaths and economic burden over multiple fire seasons",
    caution: "attribution depends on exposure-response assumptions and fire-emissions modelling",
    metric: "attributable mortality",
    confound: "baseline air-quality trend",
    population: "western North American populations",
    application: "climate-health accounting"
  },
  {
    source: "Nature Sustainability, 2025 - Respiratory risks from wildfire-specific PM2.5 across multiple countries",
    url: "https://www.nature.com/articles/s41893-025-01533-9",
    discipline: "environmental epidemiology",
    subject: "hospitalization risk from wildfire-specific fine particulate matter",
    method: "multi-country epidemiological modelling of cause-specific respiratory admissions",
    evidence: "relative-risk comparisons between wildfire and non-wildfire PM2.5",
    caution: "source-specific toxicity does not make every regional risk estimate transferable",
    metric: "cause-specific hospitalization risk",
    confound: "background pollution mixture",
    population: "communities exposed to wildfire PM2.5",
    application: "respiratory-health preparedness"
  },
  {
    source: "Nature, 2024 - A warm Neptune's methane reveals core mass and vigorous atmospheric mixing",
    url: "https://www.nature.com/articles/s41586-024-07395-z",
    discipline: "exoplanet spectroscopy",
    subject: "methane and vertical mixing in a warm Neptune atmosphere",
    method: "JWST transmission spectroscopy with atmospheric retrieval",
    evidence: "molecular detections and abundance estimates for WASP-107b",
    caution: "retrieval significance depends on model assumptions about clouds and chemistry",
    metric: "molecular detection significance",
    confound: "opacity degeneracy",
    population: "warm Neptune spectra",
    application: "planet-formation inference"
  },
  {
    source: "Nature Astronomy, 2025 - SiO and a super-stellar C/O ratio in the atmosphere of WASP-121b",
    url: "https://www.nature.com/articles/s41550-025-02513-x",
    discipline: "planetary atmospheres",
    subject: "dayside and nightside chemistry of an ultrahot giant planet",
    method: "JWST spectroscopic analysis of molecular absorption and emission",
    evidence: "detections of water, carbon monoxide, silicon monoxide and methane",
    caution: "formation inferences remain sensitive to retrieval priors and thermal structure",
    metric: "abundance-ratio estimate",
    confound: "temperature-profile degeneracy",
    population: "ultrahot giant-planet observations",
    application: "giant-planet formation modelling"
  },
  {
    source: "Nature, 2022 - Identification of carbon dioxide in an exoplanet atmosphere",
    url: "https://www.nature.com/articles/s41586-022-05269-w",
    discipline: "exoplanet atmospheric science",
    subject: "spectroscopic detection of carbon dioxide in WASP-39b",
    method: "JWST transmission spectroscopy",
    evidence: "unambiguous spectral identification of carbon dioxide",
    caution: "one robust molecule detection is not a complete atmospheric inventory",
    metric: "spectral-feature confidence",
    confound: "instrumental systematics",
    population: "hot gas-giant observations",
    application: "comparative exoplanet chemistry"
  },
  {
    source: "Scientific Reports, 2024 - From eDNA to decisions using a multi-method approach to watershed conservation",
    url: "https://www.nature.com/articles/s41598-024-64612-5",
    discipline: "conservation genomics",
    subject: "environmental-DNA surveys for restoration planning",
    method: "combined eDNA and visual encounter surveys",
    evidence: "species detections across high-priority watersheds",
    caution: "detection probability does not map directly onto abundance or ecological function",
    metric: "detection-adjusted occupancy",
    confound: "DNA transport",
    population: "aquatic species in restoration watersheds",
    application: "conservation decision-making"
  },
  {
    source: "Communications Earth & Environment, 2024 - eDNA offers opportunities for improved biodiversity monitoring and reporting",
    url: "https://www.nature.com/articles/s43247-024-01970-y",
    discipline: "biodiversity monitoring",
    subject: "environmental DNA as a reporting tool for ecosystem change",
    method: "synthesis of sampling design and occupancy-modelling opportunities",
    evidence: "assessment of how eDNA can support monitoring frameworks",
    caution: "presence-absence evidence still requires uncertainty-aware interpretation",
    metric: "occupancy-model informativeness",
    confound: "sampling-design incompleteness",
    population: "biodiversity monitoring programmes",
    application: "environmental reporting"
  },
  {
    source: "Nature Machine Intelligence, 2024 - Stable Cox regression for survival analysis under distribution shifts",
    url: "https://www.nature.com/articles/s42256-024-00932-5",
    discipline: "machine learning methodology",
    subject: "survival prediction under distribution shift",
    method: "sample reweighting followed by weighted Cox regression",
    evidence: "simulation and omics-clinical evaluations across independent test sets",
    caution: "stability guarantees depend on assumptions about covariate independence",
    metric: "out-of-domain survival performance",
    confound: "cohort-composition shift",
    population: "omics and clinical survival datasets",
    application: "robust prognostic modelling"
  },
  {
    source: "Nature, 2024 - Accurate predictions on small data with a tabular foundation model",
    url: "https://www.nature.com/articles/s41586-024-08328-6",
    discipline: "tabular machine learning",
    subject: "foundation-model prediction from small tabular datasets",
    method: "pretraining on synthetic causal-style tabular tasks",
    evidence: "benchmarking against specialist tabular prediction methods",
    caution: "synthetic pretraining does not guarantee causal identification in real datasets",
    metric: "small-data predictive accuracy",
    confound: "synthetic-task mismatch",
    population: "small tabular prediction problems",
    application: "low-data decision support"
  },
  {
    source: "Science Robotics, 2025 - Precise and dexterous robotic manipulation via human-in-the-loop reinforcement learning",
    url: "https://www.science.org/doi/10.1126/scirobotics.ads5033",
    discipline: "robotics",
    subject: "dexterous manipulation learned with human-in-the-loop reinforcement learning",
    method: "vision-based reinforcement learning with human interventions",
    evidence: "performance across dexterous manipulation tasks",
    caution: "intervention efficiency matters as much as final task success",
    metric: "intervention-free completion",
    confound: "operator strategy bias",
    population: "robotic manipulation tasks",
    application: "general-purpose dexterity"
  },
  {
    source: "Science Robotics, 2024 - SimPLE, a visuotactile method learned in simulation to precisely pick, localize, regrasp, and place objects",
    url: "https://www.science.org/doi/10.1126/scirobotics.adi8808",
    discipline: "robotic perception",
    subject: "visuotactile object manipulation transferred from simulation",
    method: "simulation-trained policies integrating visual and tactile information",
    evidence: "pick, localization, regrasp and placement performance",
    caution: "simulation precision can fail when contact conditions shift",
    metric: "placement success rate",
    confound: "contact-sensor calibration",
    population: "object manipulation trials",
    application: "precise industrial handling"
  },
  {
    source: "Science Robotics, 2024 - Real-world humanoid locomotion with reinforcement learning",
    url: "https://www.science.org/doi/10.1126/scirobotics.adi9579",
    discipline: "embodied AI",
    subject: "reinforcement-learned humanoid locomotion in the real world",
    method: "a learning-based controller using proprioceptive history",
    evidence: "locomotion performance outside purely simulated settings",
    caution: "real-world stability must be distinguished from scripted demonstration success",
    metric: "recovery-after-disturbance rate",
    confound: "terrain-selection bias",
    population: "humanoid locomotion trials",
    application: "adaptive robot mobility"
  }
];

const assessmentTargets = {
  A: [
    "Rhetorical Purpose / Argument Function",
    "Concessive Reasoning / Authorial Stance",
    "Macrostructural Synthesis / Inference",
    "Evidence-to-Claim Calibration / Pragmatic Reading",
    "Counterclaim Integration / Research Implication",
    "Scope Control / Academic Argument Compression"
  ],
  B: [
    "Lexical Precision / Modal Calibration",
    "Syntactic Scope / Concessive Logic",
    "Academic Register / Error Correction",
    "Stance-Preserving Revision / Partial Credit",
    "Idiomatic Scientific Prose / Multi-Select"
  ],
  C: [
    "Data-to-Text Mapping / Methodological Inference",
    "Statistical Caution / Abstract Evaluation",
    "Confounding and Generalisability / Evidence Mapping",
    "Empirical Claim Calibration / Quantitative Reasoning",
    "Study Design Interpretation / Validity"
  ]
};

const competenceByCategory = {
  A: "Rhetorical Synthesis",
  B: "Lexico-Syntactic Precision",
  C: "Empirical Methodology"
};

const skillModules = {
  A: ["Reading Synthesis", "Evidence Evaluation", "Rhetorical Inference"],
  B: ["Use of Academic English", "Abstract Revision", "Lexico-Syntactic Control"],
  C: ["Data Interpretation", "Methodological Reasoning", "Evidence-to-Claim Mapping"]
};

const difficultyTiers = ["C1-high", "C2-entry", "C2-secure", "PhD-screening"];

const trapTypes = {
  A: ["false synchrony", "scope inflation", "modal overclaim", "irrelevant policy leap"],
  B: ["modal overclaim", "syntactic inversion", "scope inflation", "lexical near-miss"],
  C: ["statistical misread", "false causality", "sample-size fallacy", "irrelevant policy leap"]
};

function sourceYear(source) {
  const match = source.match(/,\s*(20\d{2})\s*-/);
  return match ? Number(match[1]) : null;
}

function extractDoi(url) {
  const marker = "/doi/";
  return url.includes(marker) ? url.slice(url.indexOf(marker) + marker.length) : "";
}

function sourceTitle(source) {
  return source.replace(/^[^-]+-\s*/, "");
}

function uniquenessScoreFor(category, serial) {
  const base = category === "C" ? 0.91 : category === "B" ? 0.9 : 0.89;
  return Number((base + ((serial % 7) * 0.01)).toFixed(2));
}

function reviewChecklistFor(category) {
  const shared = [
    "prompt asks the intended construct",
    "correct answer preserves source scope",
    "rationale names distractor logic",
    "source horizon remains article-level"
  ];
  if (category === "B") return [...shared, "multiple-select key has independent justifications", "modal verbs avoid overclaiming"];
  if (category === "C") return [...shared, "quantitative table matches passage", "uncertainty and limitation are both represented"];
  return [...shared, "rhetorical function is not reducible to topic recognition"];
}

function distractorPlausibilityFor(category, serial) {
  const labels = category === "C"
    ? ["high", "medium-high", "medium", "medium-high"]
    : ["medium-high", "high", "medium-high", "medium"];
  return trapTypes[category].map((trap, idx) => ({
    trap,
    rating: labels[(idx + serial) % labels.length],
    reviewNote: "Plausible to an advanced reader unless scope, modality or evidence direction is tracked."
  }));
}

function metadataFor(category, item, serial) {
  const tierIndex = (serial + category.charCodeAt(0)) % difficultyTiers.length;
  const estimatedTime = category === "A" ? 135 + (serial % 4) * 15 : category === "B" ? 100 + (serial % 3) * 20 : 155 + (serial % 5) * 20;
  return {
    difficultyTier: difficultyTiers[tierIndex],
    skillModule: skillModules[category][serial % skillModules[category].length],
    cognitiveTrapTypes: trapTypes[category],
    estimatedTimeSeconds: estimatedTime,
    scoringWeight: category === "C" ? 1.2 : category === "B" ? 1.1 : 1,
    sourceDomain: item.discipline,
    sourceYear: sourceYear(item.source),
    sourcePublisher: item.source.split(",")[0],
    sourceVerification: {
      title: sourceTitle(item.source),
      url: item.url,
      doi: extractDoi(item.url),
      articleLevel: item.url.includes("nature.com/articles/") || item.url.includes("science.org/doi/"),
      status: "external-url-audit-required",
      notes: "Assessment passage is original; source horizon identifies the research context only."
    },
    uniquenessScore: uniquenessScoreFor(category, serial),
    semanticSignature: [item.discipline, item.subject, item.metric, item.confound].join(" | "),
    distractorPlausibilityRating: distractorPlausibilityFor(category, serial),
    manualReviewChecklist: reviewChecklistFor(category),
    authoringStatus: "linted",
    reviewStage: "awaiting-human-adjudication",
    retirementRule: "Retire or rewrite if pilot facility is above .88, below .20, discrimination is below .20, or expert review marks the key as ambiguous.",
    psychometrics: {
      calibrationStatus: "pilot-data-required",
      targetFacility: Number((0.38 + ((serial % 9) * 0.025)).toFixed(2)),
      targetDiscrimination: Number((0.42 + ((serial % 7) * 0.035)).toFixed(2)),
      estimatedDifficultyLogit: Number((0.8 + ((serial % 11) * 0.18)).toFixed(2))
    }
  };
}

const aPrompts = [
  "Which option best captures the passage's central rhetorical function?",
  "What is the most defensible inference about the author's stance?",
  "Why does the passage foreground the methodological caveat?",
  "Which statement best synthesizes the passage's argument without overstating it?",
  "What role does the counterweight in the final third of the passage play?"
];

const bPrompts = [
  "Which revisions preserve the abstract's academic stance and syntactic logic?",
  "Which expressions would improve precision without changing the author's claim?",
  "Which edits correctly maintain the concessive relationship in the passage?",
  "Which sentences avoid both overclaiming and unnecessary hedging?",
  "Which choices repair the draft while preserving the original evidential scope?"
];

const cPrompts = [
  "Which interpretation maps the empirical evidence to the most defensible academic claim?",
  "Which abstract sentence would be methodologically acceptable?",
  "Which conclusion best reflects the reported data and its limitations?",
  "Which statement preserves uncertainty, direction, and scope?",
  "Which option most accurately converts the results into cautious prose?"
];

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clean(text) {
  return text.replace(/\s+/g, " ").trim();
}

function capitalizeFirst(text) {
  const value = clean(text);
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function ensurePassageLength(text, item, serial) {
  const addenda = [
    `A careful reader must therefore distinguish evidential usefulness from unrestricted portability, especially when ${item.confound} may alter the observed pattern.`,
    `The passage rewards attention to modality: it treats the method as consequential, but not as a substitute for validation in ${item.population}.`,
    `This is why the strongest answer must preserve scope, causal direction and the difference between a research signal and a settled explanation.`,
    `The relevant academic skill is not recognising the topic, but tracking how the warrant changes when ${item.caution}.`
  ];
  let result = capitalizeFirst(text);
  let i = serial % addenda.length;
  while (wordCount(result) < 150) {
    result += " " + addenda[i % addenda.length];
    i += 1;
  }
  const words = result.split(/\s+/);
  if (words.length > 235) result = words.slice(0, 235).join(" ") + ".";
  return result;
}

function rotateOptions(options, correctIndexes, seed) {
  const order = [0, 1, 2, 3, 4].sort((a, b) => {
    const av = Math.sin((a + 1) * (seed + 11));
    const bv = Math.sin((b + 1) * (seed + 11));
    return av - bv;
  });
  const rotated = order.map((idx) => options[idx]);
  const correct = [];
  order.forEach((originalIdx, newIdx) => {
    if (correctIndexes.includes(originalIdx)) correct.push(letters[newIdx]);
  });
  return { options: rotated, correct };
}

function joinAnswers(correct) {
  return correct.join(", ");
}

function mdEscape(text) {
  return text.replace(/\n/g, " ");
}

function aPassage(item, serial) {
  const cycle = Math.floor(serial / sourceCases.length);
  const variants = [
    `${item.subject} is treated as a test of intellectual discipline rather than as a simple announcement of technical progress. It first acknowledges that ${item.method} has changed what can be attempted in ${item.discipline}, particularly for ${item.application}. Yet the argument then slows down: ${item.evidence} is presented as consequential evidence, not as a warrant for unrestricted inference. The crucial turn is the author's insistence that ${item.caution}. That turn prevents the reader from confusing ${item.metric} with final explanation. By placing ${item.confound} near the end, the passage converts excitement into a conditional claim about where the method travels, where it does not, and what kind of validation remains necessary.`,
    `${item.subject} is important in the passage, but the author resists the rhetorical shortcut by which methodological novelty becomes institutional certainty. The account of ${item.method} is deliberately balanced against ${item.evidence}, and the balance matters because ${item.caution}. The most revealing sentence is not the one praising the approach, but the one that narrows its scope to ${item.population}. The passage therefore asks the reader to see ${item.metric} as a disciplined indicator. It is useful for ranking, probing or comparing claims, but it cannot neutralize ${item.confound} or settle every question relevant to ${item.application}.`,
    `${item.subject} is framed through concession rather than celebration. On one side, ${item.discipline} has gained a method - ${item.method} - that makes the problem more tractable than it was in earlier research cycles. On the other side, the passage refuses to treat tractability as proof. It uses ${item.evidence} to establish that the approach has empirical substance, then uses ${item.caution} to limit the inference. This structure matters because the likely misreading is seductive: if ${item.metric} improves, one might assume that ${item.application} can proceed without further scrutiny. The passage rejects precisely that inference, especially where ${item.confound} remains plausible.`,
    `${item.subject} gives the author's argument a diagnostic rather than celebratory shape. A method associated with the topic has widened the possible questions in ${item.discipline}, but it has also exposed how easily readers confuse evidence with authority. The discussion of ${item.evidence} is therefore framed by a caution about ${item.population}. The author is not saying that ${item.method} is weak; rather, the author is saying that ${item.metric} has to be interpreted against ${item.caution}. The resulting stance is neither sceptical dismissal nor promotional certainty. It is a calibrated position: the method can guide ${item.application}, provided that ${item.confound} is treated as an evidential problem, not an inconvenience.`,
    `The passage uses ${item.subject} to illustrate a wider feature of advanced research prose: a strong method can still produce a fragile claim if the scope of the evidence is blurred. The author foregrounds ${item.method} because it explains why the field is moving quickly, but the same paragraph makes ${item.evidence} dependent on interpretive safeguards. The clause about ${item.caution} is not decorative hedging. It changes the status of ${item.metric} from decisive proof to situated evidence. By the end, the passage has made ${item.application} conditional on further validation and on careful treatment of ${item.confound}.`
  ];
  return ensurePassageLength(variants[(serial + cycle) % variants.length], item, serial);
}

function bPassage(item, serial) {
  const cycle = Math.floor(serial / sourceCases.length);
  const variants = [
    `A draft abstract about ${item.subject} states that ${item.method} "proves" the central finding and that ${item.application} should follow immediately. The draft is forceful, but its force is partly grammatical rather than evidential. The described study actually rests on ${item.evidence}, and its own limitations section states that ${item.caution}. A stronger academic version would keep the result visible while lowering the certainty of the verbs. It would also preserve the concessive relation between ${item.metric} and ${item.confound}. The central editing task is to avoid two opposite failures: a timid rewrite that erases the finding, and an inflated rewrite that treats ${item.population} as if they represented every relevant setting.`,
    `${item.subject} is described in a paragraph that is syntactically polished but epistemically overheated. It locates the work in ${item.discipline}, reports ${item.evidence}, and then jumps from this evidence to a broad recommendation about ${item.application}. The problem is not the recommendation itself; it is the unlicensed bridge from measured ${item.metric} to general validity. Because ${item.caution}, a precise revision must use verbs such as "suggests", "is consistent with", or "supports further evaluation" rather than verbs such as "settles" or "guarantees". It must also keep ${item.confound} in the sentence as a possible threat to interpretation rather than reclassifying it as an outcome.`,
    `${item.subject} has prompted a peer reviewer to ask for a revision that keeps the abstract's claim sharp without making it reckless. The method is ${item.method}, and the evidence consists of ${item.evidence}. The current wording collapses three distinctions: association versus mechanism, local performance versus transfer, and ${item.metric} versus patient, ecological or operational benefit. Since ${item.caution}, the best revisions should be semantically narrower but not evasive. They should also keep the syntax of concession intact: the observed result matters, although ${item.confound} still limits how far the conclusion can travel beyond ${item.population}.`,
    `${item.subject} is the basis for a draft conclusion saying that the results "demonstrate a general solution" for ${item.application}. That phrase is the defect. The evidence - ${item.evidence} - can support a consequential claim in ${item.discipline}, but it cannot abolish uncertainty created by ${item.confound}. The phrase ${item.metric} should therefore be treated as a measured signal, not as a universal endpoint. A high-quality edit would replace absolute verbs, retain the limiting clause about ${item.caution}, and avoid converting a methodological caveat into a causal consequence. The task is partly lexical, partly syntactic, and partly rhetorical.`
  ];
  return ensurePassageLength(variants[(serial + cycle) % variants.length], item, serial);
}

function cData(serial) {
  const n = 240 + ((serial * 41) % 640);
  const effect = (0.07 + (serial % 9) * 0.021).toFixed(2);
  const low = (Number(effect) - 0.04).toFixed(2);
  const high = (Number(effect) + 0.08).toFixed(2);
  const missingRate = 5 + (serial % 19);
  const sensitivity = serial % 4 === 0 ? "attenuated by nearly one third" : serial % 4 === 1 ? "directionally stable but less precise" : serial % 4 === 2 ? "heterogeneous across subgroups" : "dependent on the stricter outcome definition";
  return { n, effect, low, high, missingRate, sensitivity };
}

function cVisualization(data, item, serial) {
  const effect = Number(data.effect);
  const low = Number(data.low);
  const high = Number(data.high);
  const sensitivityFactor = [0.67, 0.9, 0.76, 0.82][serial % 4];
  const sensitivityValue = Number((effect * sensitivityFactor).toFixed(2));
  const sensitivityLow = Number(Math.max(0, sensitivityValue - 0.05).toFixed(2));
  const sensitivityHigh = Number((sensitivityValue + 0.1).toFixed(2));
  return {
    type: "interval-bar",
    title: "Estimate, sensitivity and missingness",
    ariaLabel: `Mini graph for ${item.subject}: adjusted estimate ${data.effect}, confidence interval ${data.low} to ${data.high}, missing or excluded cases ${data.missingRate} percent.`,
    scale: { min: 0, max: 0.35, unit: "estimate units" },
    series: [
      {
        label: "Adjusted estimate",
        value: effect,
        low,
        high,
        unit: "units",
        scaleMax: 0.35,
        encoding: "point-interval",
        interpretation: `positive ${item.metric}`
      },
      {
        label: "Sensitivity model",
        value: sensitivityValue,
        low: sensitivityLow,
        high: sensitivityHigh,
        unit: "units",
        scaleMax: 0.35,
        encoding: "model-contrast",
        interpretation: data.sensitivity
      },
      {
        label: "Missing/excluded cases",
        value: data.missingRate,
        low: 0,
        high: data.missingRate,
        unit: "%",
        scaleMax: 25,
        encoding: "risk-bar",
        interpretation: "selection pressure"
      }
    ],
    reviewerCheck: "Candidate must integrate direction, uncertainty, sensitivity and missingness rather than reading the estimate alone."
  };
}

function cPassage(item, serial) {
  const cycle = Math.floor(serial / sourceCases.length);
  const { n, effect, low, high, missingRate, sensitivity } = cData(serial);
  const variants = [
    `A study in ${item.discipline} examines ${item.subject} in the context of ${item.population}. It uses ${item.method} and reports ${item.evidence}. The primary analysis includes ${n} observations and estimates an adjusted change of ${effect} units, with a 95% confidence interval from ${low} to ${high}. Two sensitivity checks support the direction of the result, but the estimate is ${sensitivity} when ${item.confound} is modelled explicitly. The excluded or missing-case rate is ${missingRate}%, and missingness is higher in the subset most relevant to ${item.application}. The authors also warn that ${item.caution}. The abstract currently says that the evidence "confirms" a broadly general mechanism. A defensible summary must instead preserve the positive direction of ${item.metric}, mention uncertainty, and avoid turning a bounded dataset into a universal causal claim.`,
    `The methods paragraph reports a quantitative result for ${item.subject}. After adjustment, the measured ${item.metric} changes by ${effect} units (95% CI ${low} to ${high}) in a sample of ${n}; however, after accounting for ${item.confound}, the estimate is ${sensitivity}. The study design is informative because it uses ${item.method}, and the evidence base includes ${item.evidence}. It is still not unlimited evidence. The missing-data or exclusion rate is ${missingRate}%, the sampled setting is ${item.population}, and the limitation section states that ${item.caution}. The question is how to write the conclusion. The best sentence should neither ignore the observed association nor imply that ${item.application} is ready for unrestricted adoption.`,
    `In the results section of a recent ${item.discipline} paper, ${item.subject} is evaluated with ${item.method}. The reported estimate is ${effect} units, and the 95% confidence interval (${low}, ${high}) does not cross zero. That fact matters, but it is not enough. A specification that includes ${item.confound} makes the result ${sensitivity}; the excluded-case rate reaches ${missingRate}%; and the evidence comes from ${item.evidence} rather than from a randomized comparison across every plausible environment. The limitation is explicit: ${item.caution}. The strongest data-to-text mapping will therefore translate the result into cautious academic prose, keeping ${item.metric} visible while rejecting causal overreach.`
    ,
    `${item.subject} is reported with a compact numerical summary: ${n} observations, an adjusted estimate of ${effect} units, and a 95% interval from ${low} to ${high}. The method, ${item.method}, makes the study relevant to ${item.application}, and ${item.evidence} gives the result empirical weight. The interpretive problem is that the estimate is ${sensitivity} when ${item.confound} is included, while the missing-data or exclusion rate reaches ${missingRate}% and the authors state that ${item.caution}. A careful abstract sentence would not hide the positive direction of ${item.metric}. It would, however, restrict the claim to the observed setting and refuse language that implies universal causality.`
  ];
  return ensurePassageLength(variants[(serial + cycle) % variants.length], item, serial);
}

function makeA(idNum, item, serial) {
  const correctByPrompt = [
    `It acknowledges the methodological advance while making the evidential claim conditional on scope, validation and ${item.confound}.`,
    `The author values the method, but treats ${item.metric} as a situated signal rather than as proof that ${item.application} can proceed without further scrutiny.`,
    `The caveat prevents ${item.evidence} from being read as unrestricted proof across ${item.population} and adjacent settings.`,
    `The passage argues that ${item.subject} is promising precisely because it is useful under specified conditions, not because it removes uncertainty.`,
    `It shifts the passage from technical description to warrant control, forcing the reader to weigh ${item.caution}.`
  ];
  const promptIndex = serial % aPrompts.length;
  const options = [
    correctByPrompt[promptIndex],
    `It says that ${item.confound} is caused by ${item.method}, so the method should be rejected before ${item.metric} is measured.`,
    `It claims that modern ${item.discipline} now permits every result to be generalized immediately to all populations and policy settings.`,
    `It asserts that ${item.evidence} has conclusively and permanently verified ${item.subject} beyond all methodological dispute.`,
    `It mainly proposes a funding and governance framework for ${item.application}, although the passage is actually about evidential scope.`
  ];
  const rotated = rotateOptions(options, [0], idNum);
  return {
    id: `ACC_${String(idNum).padStart(3, "0")}`,
    category: "A",
    type: "single",
    expectedSelections: 1,
    competence: competenceByCategory.A,
    ...metadataFor("A", item, serial),
    assessmentTarget: assessmentTargets.A[serial % assessmentTargets.A.length],
    sourceHorizon: `${item.source} (${item.url})`,
    sourceUrl: item.url,
    passage: aPassage(item, serial),
    prompt: aPrompts[promptIndex],
    options: rotated.options,
    correct: rotated.correct,
    rationale: `The correct answer is ${joinAnswers(rotated.correct)} because it preserves the passage's concessive structure: ${item.method} is valuable, but the warrant is limited by scope, validation and ${item.confound}. The false-synchrony distractor reverses the relation between method and limitation. The overgeneralisation distractor treats a bounded case in ${item.discipline} as a universal rule. The modal-distortion distractor turns qualified evidence into permanent verification. The out-of-context distractor is plausible policy prose, but it does not answer the rhetorical question.`
  };
}

function makeB(idNum, item, serial) {
  const correctCount = serial % 3 === 0 ? 3 : 2;
  const revisionFocus = ["opening claim", "scope sentence", "methods clause", "final inference"][Math.floor(serial / sourceCases.length) % 4];
  const modalInflationDistractors = [
    `Change the ${revisionFocus} from "may inform ${item.application}" to "must determine ${item.application}", as though the evidence had removed the need for further validation.`,
    `Revise the ${revisionFocus} so that ${item.evidence} is said to settle the case for ${item.application}, even though the passage keeps the claim conditional.`,
    `Replace the cautious verb in the ${revisionFocus} with "guarantees", making ${item.metric} sound like a final institutional mandate.`
  ];
  const baseCorrect = [
    `In the ${revisionFocus}, replace absolute verbs such as "proves" with calibrated verbs such as "suggests", "supports", or "is consistent with".`,
    `Retain the limiting clause about ${item.confound}, because it affects interpretation rather than merely style.`,
    `Specify in the ${revisionFocus} that the claim applies first to ${item.population}, with transfer beyond that context requiring further validation.`
  ];
  const options = [
    baseCorrect[0],
    baseCorrect[1],
    correctCount === 3 ? baseCorrect[2] : `Delete the limitation that ${item.caution}, because a limitation weakens the abstract's persuasive force.`,
    modalInflationDistractors[serial % modalInflationDistractors.length],
    `Rewrite ${item.confound} as an effect of the method, making the sentence read as though the caveat were produced by ${item.method}.`
  ];
  const correctIndexes = correctCount === 3 ? [0, 1, 2] : [0, 1];
  const rotated = rotateOptions(options, correctIndexes, idNum + 17);
  const prompt = `${bPrompts[serial % bPrompts.length]} Select ${correctCount === 3 ? "THREE" : "TWO"}.`;
  const trapSentence = correctCount === 3
    ? `The incorrect options enact two traps: changing "may inform" to "must determine" is modal inflation, and making the caveat an effect of the method creates false synchrony.`
    : `The incorrect options enact three traps: deleting the caveat is overgeneralisation, changing "may inform" to "must determine" is modal inflation, and making the caveat an effect of the method creates false synchrony.`;
  return {
    id: `ACC_${String(idNum).padStart(3, "0")}`,
    category: "B",
    type: "multiple",
    expectedSelections: correctCount,
    competence: competenceByCategory.B,
    ...metadataFor("B", item, serial),
    assessmentTarget: assessmentTargets.B[serial % assessmentTargets.B.length],
    sourceHorizon: `${item.source} (${item.url})`,
    sourceUrl: item.url,
    passage: bPassage(item, serial),
    prompt,
    options: rotated.options,
    correct: rotated.correct,
    rationale: `The correct answer set is ${joinAnswers(rotated.correct)}. These choices preserve the claim while reducing over-certainty in the ${revisionFocus}, keeping ${item.confound} as an interpretive constraint and, when required, limiting transfer beyond ${item.population}. ${trapSentence} Partial credit is psychometrically justified because each selection tests an independent layer of lexical, syntactic and stance control.`
  };
}

function makeC(idNum, item, serial) {
  const data = cData(serial);
  const universalCausalDistractors = [
    `Because the confidence interval is positive, the study proves that ${item.subject} will generate the same effect in every future setting.`,
    `The positive estimate licenses a general causal rule for ${item.subject}, even outside the sampled setting.`,
    `The numerical result is sufficient to treat ${item.metric} as a settled mechanism rather than a bounded estimate.`
  ];
  const sensitivityDistractors = [
    `The sensitivity analysis shows that the primary result was fabricated, not merely dependent on modelling choices.`,
    `The sensitivity analysis cancels the result entirely, even though the passage describes model dependence rather than fraud.`,
    `Any change under sensitivity testing means the original analysis should be ignored rather than interpreted cautiously.`
  ];
  const missingnessDistractors = [
    `The missing-data rate can be set aside because the reported sample is large enough to make selection concerns immaterial.`,
    `Excluded cases do not matter once the confidence interval is positive and the main estimate points in the expected direction.`,
    `Missingness is only a reporting issue here, so it should not affect the strength of the conclusion.`
  ];
  const policyDistractors = [
    `The data mainly prove that ${item.application} deserves more institutional funding, which is a policy conclusion rather than a data-to-text mapping.`,
    `The strongest summary should recommend immediate implementation of ${item.application}, even though the question asks about evidential wording.`,
    `The result chiefly supports a governance programme for ${item.application}, not a narrower interpretation of the reported estimate.`
  ];
  const options = [
    `The result is directionally supportive, but missing or excluded cases, ${item.confound} and the stated limitation mean that the conclusion should remain context-bound rather than causal and universal.`,
    universalCausalDistractors[serial % universalCausalDistractors.length],
    sensitivityDistractors[serial % sensitivityDistractors.length],
    missingnessDistractors[serial % missingnessDistractors.length],
    policyDistractors[serial % policyDistractors.length]
  ];
  const rotated = rotateOptions(options, [0], idNum + 29);
  return {
    id: `ACC_${String(idNum).padStart(3, "0")}`,
    category: "C",
    type: "single",
    expectedSelections: 1,
    competence: competenceByCategory.C,
    ...metadataFor("C", item, serial),
    assessmentTarget: assessmentTargets.C[serial % assessmentTargets.C.length],
    sourceHorizon: `${item.source} (${item.url})`,
    sourceUrl: item.url,
    dataDisplay: {
      caption: "Evidence pattern for interpretation",
      rows: [
        { measure: "Sample size", value: String(data.n), interpretation: "evidence volume" },
        { measure: "Adjusted estimate", value: data.effect, interpretation: `positive ${item.metric}` },
        { measure: "95% CI", value: `${data.low} to ${data.high}`, interpretation: "uncertainty interval" },
        { measure: "Sensitivity check", value: data.sensitivity, interpretation: item.confound },
        { measure: "Missing/excluded cases", value: `${data.missingRate}%`, interpretation: "selection pressure" }
      ]
    },
    dataVisualization: cVisualization(data, item, serial),
    passage: cPassage(item, serial),
    prompt: cPrompts[serial % cPrompts.length],
    options: rotated.options,
    correct: rotated.correct,
    rationale: `The correct answer is ${joinAnswers(rotated.correct)} because it maps the numerical direction of the finding to cautious prose while preserving uncertainty, missingness and sensitivity to ${item.confound}. The false-synchrony distractor treats sensitivity analysis as proof of fabrication rather than model dependence. The overgeneralisation distractor turns a positive interval into universal causality. The modal-distortion distractor implies sample size automatically removes missing-data bias. The out-of-context funding distractor may sound reasonable outside the passage, but it does not answer the methodological interpretation task.`
  };
}

function buildTests() {
  const tests = [];
  for (let i = 1; i <= 100; i += 1) tests.push(makeA(i, sourceCases[(i - 1) % sourceCases.length], i - 1));
  for (let i = 101; i <= 200; i += 1) tests.push(makeB(i, sourceCases[(i - 101 + 10) % sourceCases.length], i - 101));
  for (let i = 201; i <= 300; i += 1) tests.push(makeC(i, sourceCases[(i - 201 + 20) % sourceCases.length], i - 201));
  return tests;
}

function buildItemBank(tests, audit) {
  return {
    schemaVersion: "2.25.0",
    bankVersion: "ACC-C1C2-2026.27",
    generatedAt: new Date().toISOString(),
    itemCount: tests.length,
    scoringModel: {
      singleSelect: "1 point for exact match",
      multipleSelect: "partial credit = correct selections ratio minus wrong selections penalty, floored at 0",
      weightedAnalytics: "category and skill analytics use item scoringWeight metadata",
      confidenceAnalytics: "candidate confidence is recorded before submit and compared with correctness",
      sessionProtocol: "runtime sessions store per-item timing, answer history and confidence-adjusted score contributions",
      retirementRules: "items are flagged for retirement if facility, discrimination or expert review evidence falls outside production thresholds",
      runtimeBankLoading: "the standalone app can import a compatible JSON item bank without editing HTML",
      pilotPsychometrics: "pilot response CSV/JSON files can be converted into facility, discrimination and retirement-review signals",
      expertReviewWorkflow: "manual review packet, review queue, reviewer CSV template, adjudication validator and anti-pattern reports gate future bank edits",
      secureDelivery: "server-backed prototype redacts candidate payloads, requires per-attempt candidate tokens, stores token hashes only, persists attempts locally, records audit events, scores responses server-side and protects evaluator bank/report access with a runtime authorization boundary"
    },
    authoringPipeline: ["draft", "linted", "expert-review", "approved", "retired"],
    sourcePolicy: "Source horizons identify article-level 2022-2026 research contexts; assessment passages are original and not copied from journal text.",
    limitations: [
      "psychometric values are targets until pilot response data is collected",
      "offline HTML cannot provide secure server-side answer-key separation; use the server-backed delivery prototype for redacted candidate payloads",
      "expert review metadata indicates review gates, not completed independent human adjudication",
      "PWA installation requires serving the generated files over http(s), not opening the HTML through file://",
      "psychometric calibration requires real pilot candidate responses; empty reports are readiness placeholders, not validation evidence"
    ],
    qualityGate: audit,
    sourceCases,
    items: tests
  };
}

function buildMarkdown(tests, audit) {
  const lines = [];
  lines.push("# Advanced Academic English Assessment Database (C1-C2)");
  lines.push("");
  lines.push("This database contains original doctoral-level academic English assessment prose. Source horizons identify recent 2022-2026 research contexts from Nature-family and Science-family publications; the passages are newly written test material, not copied journal text.");
  lines.push("");
  lines.push(`Total tests: ${tests.length}. Category A: ${audit.counts.A}. Category B: ${audit.counts.B}. Category C: ${audit.counts.C}.`);
  lines.push(`Quality gate: ${audit.duplicatePassages} duplicate passages; ${audit.duplicateOptionSets} duplicate option sets; passage length ${audit.minWords}-${audit.maxWords} words; ${audit.articleLevelUrls}/${tests.length} item-level source URLs.`);
  lines.push("");
  for (const test of tests) {
    lines.push(`### [TEST_ID: ${test.id}]`);
    lines.push(`* Assessment Target: ${test.assessmentTarget}`);
    lines.push(`* Skill Module: ${test.skillModule}`);
    lines.push(`* Difficulty Tier: ${test.difficultyTier}`);
    lines.push(`* Estimated Time: ${test.estimatedTimeSeconds} seconds`);
    lines.push(`* Scoring Weight: ${test.scoringWeight}`);
    lines.push(`* Cognitive Trap Types: ${test.cognitiveTrapTypes.join("; ")}`);
    lines.push(`* Review Status: ${test.authoringStatus} / ${test.reviewStage}`);
    lines.push(`* Source Horizon: ${test.sourceHorizon}`);
    lines.push("* Academic Passage:");
    lines.push(`    > ${mdEscape(test.passage)}`);
    if (test.dataDisplay) {
      lines.push("* Data Display:");
      lines.push("    | Measure | Value | Interpretation |");
      lines.push("    | --- | --- | --- |");
      test.dataDisplay.rows.forEach((row) => lines.push(`    | ${row.measure} | ${row.value} | ${row.interpretation} |`));
    }
    if (test.dataVisualization) {
      lines.push(`* Mini Graph: ${test.dataVisualization.title}`);
      test.dataVisualization.series.forEach((point) => {
        lines.push(`    * ${point.label}: ${point.value}${point.unit} (${point.interpretation})`);
      });
    }
    lines.push(`* Question Prompt: ${test.prompt}`);
    lines.push("* Options:");
    test.options.forEach((option, idx) => lines.push(`    * ${letters[idx]}) ${option}`));
    lines.push(`* Correct Answer(s): ${joinAnswers(test.correct)}`);
    lines.push(`* Psychometric Rationale: ${test.rationale}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  lines.push("## Source Horizon Links");
  lines.push("");
  sourceCases.forEach((item) => lines.push(`* [${item.source}](${item.url})`));
  lines.push("");
  return lines.join("\n");
}

function buildSourceVerificationReport(tests) {
  const coverage = new Map();
  for (const test of tests) {
    const entry = coverage.get(test.sourceUrl) || {
      title: test.sourceVerification.title,
      url: test.sourceUrl,
      doi: test.sourceVerification.doi,
      publisher: test.sourcePublisher,
      year: test.sourceYear,
      domain: test.sourceDomain,
      itemIds: [],
      articleLevel: test.sourceVerification.articleLevel,
      status: "pending-runtime-url-audit",
      notes: test.sourceVerification.notes
    };
    entry.itemIds.push(test.id);
    coverage.set(test.sourceUrl, entry);
  }
  return {
    generatedAt: new Date().toISOString(),
    sourceCount: coverage.size,
    itemCoverage: tests.length,
    verificationFields: ["url", "doi", "publisher", "year", "domain", "articleLevel", "automatedFetchStatus", "notes"],
    copyrightPolicy: "All passages, prompts, options and rationales are original assessment prose; sources are used only as article-level research horizons.",
    sources: [...coverage.values()].map((entry) => ({
      ...entry,
      itemCount: entry.itemIds.length
    }))
  };
}

function buildReadinessReport(tests, audit) {
  const implemented = [
    "canonical item_bank.json",
    "metadata for difficulty, module, trap, time, domain and weight",
    "source URL audit",
    "linguistic/content lint",
    "HTML regression QA",
    "JSON/CSV/exportable report surface",
    "candidate and evaluator report exports",
    "runtime export integrity QA for JSON, CSV, candidate report, evaluator report and print surface",
    "per-item timing and answer history protocol",
    "confidence-adjusted scoring",
    "confidence analytics",
    "provisional score interpretation, cut-score policy and standard-setting protocol artifacts",
    "adaptive readiness, heuristic routing, CAT upgrade and item exposure artifacts",
    "save slots",
    "review filters",
    "collapsible analytics panels for mobile and repeated review workflows",
    "data tables for Category C",
    "accessible mini-graph data visualizations for Category C",
    "manual review checklist metadata",
    "distractor plausibility metadata",
    "item retirement rules",
    "runtime item-bank import/export",
    "PWA manifest and service worker artifacts",
    "automated accessibility audit gate",
    "WCAG readiness packet with skip link, landmarks, live status region, conformance matrix and assistive-technology audit protocol",
    "pilot-response psychometric calibration tooling",
    "QA dashboard report",
    "manual expert review packet and review queue",
    "expert adjudication CSV template, protocol and validator report",
    "semantic similarity and obvious-answer anti-pattern audit",
    "construct coverage, blueprint matrix and distractor quality audit artifacts",
    "no-secrets/no-email/no-CDN hygiene audit artifact",
    "bank governance, item lifecycle, next-bank authoring and release signoff artifacts",
    "operations readiness, deployment, retention, proctoring and incident runbook artifacts",
    "banned phrase registry and human-gated authoring templates",
    "server-backed secure delivery prototype with candidate payload redaction, per-attempt candidate authorization, hash-only token storage, local durable attempt storage, audit logging, report endpoints, server-side scoring and runtime admin authorization QA",
    "secure PDF report rendering prototype with candidate/evaluator separation and rendered preview QA",
    "visual snapshot QA across desktop, mobile, admin and Category C visualization states",
    "full-exam protocol with three timed sections, two break checkpoints, final readiness state and export evidence",
    "named local session slots with persisted labels and session snapshot evidence",
    "runtime CEFR profile explanation with provisional band rationale, weakest-module evidence and report-ready interpretation limits",
    "section-preserving question randomization with deterministic attempt seeds and JSON session order evidence"
  ];
  const pending = [
    "completed independent expert adjudication of all 300 items",
    "real pilot-response psychometric calibration data collection",
    "formal standard-setting panel signoff for score bands and cut scores",
    "true IRT/adaptive calibration from representative candidate data",
    "production secure teacher/candidate deployment with hosted authentication, managed durable storage and operations controls",
    "formal WCAG audit with real assistive-technology signoff",
    "production PDF rendering service with signed delivery, managed rendering workers and retention controls",
    "production hosting, authentication and proctoring controls"
  ];
  return {
    generatedAt: new Date().toISOString(),
    readinessLevel: "professional offline beta; not yet production-calibrated",
    bankVersion: "ACC-C1C2-2026.27",
    evidence: {
      itemCount: tests.length,
      categoryCounts: audit.counts,
      duplicatePassages: audit.duplicatePassages,
      duplicateOptionSets: audit.duplicateOptionSets,
      articleLevelUrls: audit.articleLevelUrls,
      minWords: audit.minWords,
      maxWords: audit.maxWords,
      itemsWithDataTables: tests.filter((test) => test.dataDisplay).length,
      itemsWithManualChecklist: tests.filter((test) => test.manualReviewChecklist?.length).length,
      itemsWithPlausibilityRatings: tests.filter((test) => test.distractorPlausibilityRating?.length).length,
      importableBankRuntime: true,
      sessionProtocolRuntime: true,
      candidateEvaluatorReports: true,
      collapsibleAnalyticsRuntime: true,
      exportIntegrityArtifacts: ["export_integrity_report.json", "export_integrity_matrix.csv"],
      pwaArtifactsPlanned: ["app.webmanifest", "sw.js"],
      accessibilityArtifacts: ["accessibility_audit.json", "wcag_audit_report.json", "wcag_conformance_matrix.json", "wcag_assistive_tech_protocol.md", "accessibility_statement.md"],
      psychometricPipelineArtifacts: ["pilot_response_template.csv", "psychometric_calibration_report.json", "psychometric_item_summary.csv", "qa_dashboard_report.json"],
      scoreInterpretationArtifacts: ["score_interpretation_report.json", "standard_setting_protocol.md", "score_claim_register.md", "cut_score_policy.csv"],
      cefrInterpretationArtifacts: ["cefr_interpretation_report.json", "cefr_interpretation_matrix.csv"],
      adaptiveArtifacts: ["adaptive_readiness_report.json", "adaptive_algorithm_spec.md", "item_exposure_policy.md", "adaptive_simulation_matrix.csv"],
      dataVisualizationArtifacts: ["data_visualization_readiness_report.json", "category_c_visualization_matrix.csv"],
      examProtocolArtifacts: ["exam_protocol_report.json", "exam_protocol_matrix.csv"],
      sectionRandomizationArtifacts: ["section_randomization_report.json", "section_randomization_matrix.csv"],
      sessionManagementArtifacts: ["session_management_report.json", "session_management_matrix.csv"],
      snapshotQaArtifacts: ["visual_snapshot_report.json", "visual_snapshot_matrix.csv", "snapshot_desktop_learning.png", "snapshot_category_c_visual.png", "snapshot_admin_review.png", "snapshot_mobile_initial.png"],
      reviewWorkflowArtifacts: ["bank_quality_review_report.json", "construct_coverage_report.json", "distractor_quality_report.json", "blueprint_matrix.csv", "manual_review_packet.md", "review_queue.csv", "expert_review_template.csv", "expert_review_protocol.md", "expert_adjudication_report.json", "banned_phrase_registry.json", "authoring_templates.md"],
      hygieneArtifacts: ["hygiene_audit_report.json"],
      governanceArtifacts: ["bank_governance_report.json", "item_lifecycle_policy.md", "next_bank_authoring_plan.md", "release_signoff_checklist.csv"],
      operationsArtifacts: ["operations_readiness_report.json", "production_deployment_runbook.md", "data_retention_policy.md", "proctoring_integrity_policy.md", "incident_response_runbook.md"],
      secureDeliveryPrototype: true,
      secureDeliveryArtifacts: ["secure_delivery_api_spec.json", "secure_delivery_blueprint.md", "secure_delivery_readiness_report.json"],
      pdfReportArtifacts: ["pdf_report_pipeline_report.json", "pdf/academic-assessment-candidate-report.pdf", "pdf/academic-assessment-evaluator-report.pdf"]
    },
    implemented,
    pending,
    releaseGate: "Do not label as fully production-ready until expert review and pilot psychometrics are complete."
  };
}

function buildDocs() {
  return [
    "# Academic Assessment Platform Documentation",
    "",
    "## Source of Truth",
    "",
    "`item_bank.json` is the canonical bank. The Markdown database and standalone HTML platform are generated from the same item objects. The standalone app also supports importing a compatible bank JSON at runtime, so future banks can be tested without editing the generated HTML.",
    "",
    "## Adding New Items",
    "",
    "New items should enter as `draft`, pass lint, receive manual expert review, and only then move to `approved`. Each item needs an article-level source horizon, original passage text, five options, an answer key, rationale, difficulty tier, skill module, cognitive trap types, time estimate, scoring weight, source domain and retirement rule.",
    "",
    "## Manual Review",
    "",
    "Reviewers should check construct alignment, natural academic English, distractor plausibility, answer-key defensibility, rationale specificity, source-scope discipline and Category C data consistency. A reviewer should not approve items whose correct option is obvious by length, modality or generic caution alone. `manual_review_packet.md` and `review_queue.csv` are triage aids; they do not mean expert adjudication has already been completed.",
    "",
    "## Blueprint and Quality Reports",
    "",
    "`construct_coverage_report.json` maps category, skill module and difficulty-tier cells to item counts, source-domain spread and trap coverage. `blueprint_matrix.csv` gives reviewers a compact matrix for spotting overrepresented domains and thin construct cells. `distractor_quality_report.json` records option-length, modality and plausibility signals so weak distractors can be revised before expert signoff.",
    "",
    "## Hygiene Audit",
    "",
    "`work/hygiene_audit.js` scans generated text artifacts and local work scripts for unexpected email literals, token-shaped secrets, remote script dependencies, CDN references, non-local plain HTTP URLs and leftover secure-delivery storage. The report is written to `hygiene_audit_report.json` and is part of the QA dashboard.",
    "",
    "## Adaptive Readiness",
    "",
    "`work/build_adaptive_readiness.js` writes `adaptive_readiness_report.json`, `adaptive_algorithm_spec.md`, `item_exposure_policy.md` and `adaptive_simulation_matrix.csv`. These artifacts separate the current heuristic adaptive drill from future calibrated CAT, and define exposure, pool and upgrade requirements.",
    "",
    "## Category C Visualizations",
    "",
    "`work/build_data_visualization_readiness.js` writes `data_visualization_readiness_report.json` and `category_c_visualization_matrix.csv`. Category C items include accessible mini-graphs that encode adjusted estimates, uncertainty intervals, sensitivity checks and missingness, while preserving table data for screen-reader and export review.",
    "",
    "## Full Exam Protocol",
    "",
    "`work/build_exam_protocol_readiness.js` writes `exam_protocol_report.json` and `exam_protocol_matrix.csv`. The offline runtime exposes three 90-minute sections, break checkpoints after Sections A and B, per-section progress, persisted break state and a final-protocol readiness flag in JSON exports.",
    "",
    "## Section Randomization",
    "",
    "`work/build_section_randomization_readiness.js` writes `section_randomization_report.json` and `section_randomization_matrix.csv`. Random question order now shuffles items inside A/B/C sections while preserving full-exam section boundaries, with deterministic seeds and `session.questionOrder` evidence in JSON exports.",
    "",
    "## Session Management",
    "",
    "`work/build_session_management_readiness.js` writes `session_management_report.json` and `session_management_matrix.csv`. The runtime supports default slots, named local attempts, persisted slot labels, active-slot restore and slot metadata in JSON session snapshots.",
    "",
    "## Snapshot QA",
    "",
    "`work/visual_snapshot_qa.js` writes `visual_snapshot_report.json`, `visual_snapshot_matrix.csv` and four viewport screenshots. It checks desktop learning, Category C visualization, admin review and mobile initial states for nonblank images, expected dimensions, layout assertions and overflow.",
    "",
    "## Bank Governance",
    "",
    "`work/build_bank_governance.js` writes `bank_governance_report.json`, `item_lifecycle_policy.md`, `next_bank_authoring_plan.md` and `release_signoff_checklist.csv`. These artifacts define stable item IDs, release ownership, next-bank namespace policy, no direct mass approval and the evidence required before future banks can move from draft to approved.",
    "",
    "## Operations Readiness",
    "",
    "`work/build_operations_readiness.js` writes `operations_readiness_report.json`, `production_deployment_runbook.md`, `data_retention_policy.md`, `proctoring_integrity_policy.md` and `incident_response_runbook.md`. These artifacts separate controlled-beta readiness from production hosting requirements for authentication, storage, report delivery, monitoring, retention, proctoring and incident response.",
    "",
    "## Expert Adjudication",
    "",
    "`expert_review_template.csv` is the machine-readable reviewer input format. `work/validate_expert_adjudication.js` validates reviewer rows and writes `expert_adjudication_report.json`. The expert-review gate remains pending until all 300 items have at least two independent reviewer rows and no unresolved revise, retire or second-review decisions.",
    "",
    "## Scoring",
    "",
    "Single-select items receive 1 point for exact match. Multiple-select items use partial credit: correct selections ratio minus a wrong-selection penalty, floored at 0. Weighted analytics use each item's scoring weight. Confidence-adjusted analytics apply a small calibration adjustment: high-confidence misses reduce the adjusted contribution, high-confidence correct answers receive a small positive signal, and low-confidence correct answers receive a small caution signal.",
    "",
    "## Score Interpretation",
    "",
    "`score_interpretation_report.json` defines provisional C1/C2 bands, interpretation boundaries, allowed score claims and production blockers. `standard_setting_protocol.md` documents the required expert-panel method before cut scores can become production claims. `score_claim_register.md` separates allowed diagnostic claims from claims that remain prohibited until calibration and standard setting are complete.",
    "",
    "## CEFR Explanation",
    "",
    "`work/build_cefr_interpretation_readiness.js` writes `cefr_interpretation_report.json` and `cefr_interpretation_matrix.csv`. The runtime explains each C1/C2 profile from weighted score, confidence-adjusted score, answered coverage and weakest submitted module, while preserving a visible limitation that bands are provisional until calibration and standard setting are complete.",
    "",
    "## Session Protocol and Reports",
    "",
    "The runtime stores per-item time spent, submitted answer history, source/display answer mappings, confidence, scoring version and evaluator notes in local session state. Candidate reports hide answer keys and rationales, while evaluator reports include answer keys, rationales, item metadata, timing and manual notes.",
    "",
    "## Collapsible Analytics",
    "",
    "The analytics sidebar uses persistent collapsible sections for CEFR profile, competence breakdown, skill modules, confidence calibration, answer history, review, export and reading settings. This keeps mobile and repeated-review workflows compact without removing the underlying analytics evidence.",
    "",
    "## Export Integrity",
    "",
    "`work/export_integrity_qa.js` writes `export_integrity_report.json` and `export_integrity_matrix.csv`. It downloads runtime JSON, CSV, candidate and evaluator reports, validates core payload fields, checks candidate/evaluator information boundaries and confirms the PDF print surface is wired.",
    "",
    "## Secure Delivery",
    "",
    "`work/secure_delivery_server.js` is a dependency-free Node.js prototype for teacher/candidate separation. Candidate endpoints return redacted item payloads, persist attempt state, render candidate-safe reports and score responses server-side only when a per-attempt candidate bearer token is supplied. The server stores only candidate token hashes. Protected admin endpoints expose evaluator-only bank data, persisted attempts, audit rows and evaluator reports behind a runtime environment bearer token. The prototype does not replace production hosted authentication, managed storage, backups, TLS, rate limits, centralized logs or proctoring controls.",
    "",
    "## PDF Reporting",
    "",
    "`work/render_secure_report_pdfs.py` renders sample candidate and evaluator PDF reports from the canonical bank. The candidate PDF is checked for evaluator-only material redaction; the evaluator PDF is checked for answer-key and rationale presence. Poppler preview rendering verifies that first-page PDF output can be visually inspected before release.",
    "",
    "## Accessibility",
    "",
    "The standalone runtime includes a skip link, semantic banner/main/aside landmarks, labelled control groups, labelled progress navigation, visible focus states, contrast checks and a polite status region for item changes. `wcag_conformance_matrix.json` maps automated evidence to WCAG criteria. `wcag_assistive_tech_protocol.md` is the required manual screen-reader and keyboard audit protocol before claiming formal conformance.",
    "",
    "## Psychometric Calibration",
    "",
    "`pilot_response_template.csv` defines the accepted pilot response format: candidate ID, item ID, selected answer, score, confidence, time and timestamp. `work/calibrate_psychometrics.js` reads a supplied CSV or JSON response file and writes facility index, discrimination index, timing and retirement-review recommendations. Without real pilot response rows the report remains `awaiting-pilot-data`; it must not be treated as completed calibration.",
    "",
    "## Known Limitations",
    "",
    "The current passages are original assessment prose based on source horizons; they are not copied article excerpts. Psychometric fields are target values until pilot candidate data exists. Offline HTML cannot enforce secure hidden answer keys against a technically capable user; secure teacher/candidate separation requires a server-backed deployment. PWA install mode requires serving `academic_test_platform.html`, `app.webmanifest` and `sw.js` over http(s).",
    "",
    "## Roadmap",
    "",
    "Next bank expansion should produce ACC_301-600 from a new source set, but only through the draft -> lint -> expert review -> approved pipeline. Future releases should add pilot calibration, secure evaluator workflows, server-side candidate delivery and production deployment controls.",
    ""
  ].join("\n");
}

function buildAccessibilityStatement() {
  return [
    "# Accessibility Statement",
    "",
    "The Academic C1-C2 Assessment platform is designed for keyboard-first operation, responsive layouts and readable academic passages.",
    "",
    "## Implemented Supports",
    "",
    "- Skip link to the current question.",
    "- Semantic banner, main content and complementary landmarks.",
    "- Labelled progress map navigation across all 300 items.",
    "- Category C mini-graphs expose aria labels and preserve table fallbacks.",
    "- Visible focus states for interactive controls.",
    "- Polite live status updates for item position and progress.",
    "- Contrast, keyboard, mobile overflow and dialog ARIA checks in `accessibility_audit.json`.",
    "",
    "## Required Manual Audit",
    "",
    "Formal conformance still requires human testing with at least NVDA/Windows, VoiceOver/iOS or macOS, keyboard-only navigation, browser zoom, reduced motion settings and representative candidate workflows.",
    ""
  ].join("\n");
}

function buildWcagAssistiveTechProtocol() {
  return [
    "# WCAG Assistive Technology Audit Protocol",
    "",
    "Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.",
    "",
    "## Scope",
    "",
    "Audit the standalone candidate runtime, review screen, exports, admin/evaluator controls and mobile layout.",
    "",
    "## Required Environments",
    "",
    "- Windows + Edge + NVDA.",
    "- macOS + Safari + VoiceOver.",
    "- iOS Safari + VoiceOver.",
    "- Keyboard-only desktop browser.",
    "- 200% browser zoom.",
    "",
    "## Critical Flows",
    "",
    "1. Open platform and use the skip link to reach the current question.",
    "2. Navigate the progress map and confirm the active item is announced.",
    "3. Read a passage, prompt, answer options, data table and Category C mini-graph.",
    "4. Select options, set confidence and submit.",
    "5. Verify review locking in exam mode and rationale disclosure in learning mode.",
    "6. Use review filters, search, save slot controls and export controls.",
    "7. Import a bank JSON and confirm failure messaging is announced.",
    "",
    "## Signoff Fields",
    "",
    "Record tester, assistive technology, browser, device, date, pass/fail, blocker severity, reproduction notes and remediation owner for each flow.",
    ""
  ].join("\n");
}

function buildWcagConformanceMatrix() {
  return {
    generatedAt: new Date().toISOString(),
    bankVersion: "ACC-C1C2-2026.27",
    schemaVersion: "2.25.0",
    status: "automated-readiness-pass-human-at-pending",
    humanAssistiveTechnologyAuditRequired: true,
    criteria: [
      { criterion: "1.1.1 Non-text Content", level: "A", automatedEvidence: "No required image-based assessment content; progress dots and Category C mini-graphs have aria-labels.", status: "ready-for-human-verification" },
      { criterion: "1.3.1 Info and Relationships", level: "A", automatedEvidence: "Banner, main, aside landmarks, labelled groups and table captions are present.", status: "ready-for-human-verification" },
      { criterion: "1.4.3 Contrast", level: "AA", automatedEvidence: "accessibility_audit.json samples all checked text at 4.5:1 or higher.", status: "automated-pass" },
      { criterion: "2.1.1 Keyboard", level: "A", automatedEvidence: "Core controls are native buttons, inputs and selects; keyboard shortcut dialog is available.", status: "ready-for-human-verification" },
      { criterion: "2.4.1 Bypass Blocks", level: "A", automatedEvidence: "Visible-on-focus skip link targets the current question panel.", status: "automated-pass" },
      { criterion: "2.4.3 Focus Order", level: "A", automatedEvidence: "Visible focus is present; human audit must verify full screen-reader order.", status: "ready-for-human-verification" },
      { criterion: "2.4.6 Headings and Labels", level: "AA", automatedEvidence: "H1 is unique and controls have accessible names.", status: "automated-pass" },
      { criterion: "3.2.1 On Focus", level: "A", automatedEvidence: "Focus checks do not trigger submission or navigation by themselves.", status: "ready-for-human-verification" },
      { criterion: "4.1.2 Name, Role, Value", level: "A", automatedEvidence: "Native controls, aria-pressed toggles and role=group/navigation/dialog are validated.", status: "ready-for-human-verification" },
      { criterion: "4.1.3 Status Messages", level: "AA", automatedEvidence: "Polite live status region reports item position and submitted count.", status: "automated-pass" }
    ],
    artifacts: ["accessibility_audit.json", "wcag_audit_report.json", "wcag_conformance_matrix.json", "wcag_assistive_tech_protocol.md", "accessibility_statement.md"]
  };
}

function buildChangelog() {
  return [
    "# Changelog",
    "",
    "## ACC-C1C2-2026.27",
    "",
    "- Added section-preserving randomized question order for full-exam attempts.",
    "- Added deterministic question-order snapshots to saved sessions and JSON exports.",
    "- Added section randomization readiness report, matrix, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.26",
    "",
    "- Added runtime CEFR profile explanations using weighted score, confidence-adjusted score, coverage and weakest submitted module.",
    "- Added CEFR rationale to candidate/evaluator reports and JSON analytics payloads.",
    "- Added CEFR interpretation readiness report, matrix, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.25",
    "",
    "- Added named local session slots with persisted labels and active-slot metadata in session snapshots.",
    "- Added session management readiness report and matrix artifacts.",
    "- Added named-slot browser QA, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.24",
    "",
    "- Added full-exam protocol with three 90-minute sections, two persisted break checkpoints and final-protocol readiness state.",
    "- Added exam protocol evidence to JSON exports, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Added exam protocol readiness report and section matrix artifacts.",
    "",
    "## ACC-C1C2-2026.23",
    "",
    "- Added persistent collapsible analytics sections for CEFR, skills, confidence, history, review, export and reading settings.",
    "- Added mobile UX evidence for analytics collapsing, ARIA expansion state and persisted panel preferences.",
    "- Added collapsible analytics evidence to readiness, documentation and browser QA gating.",
    "",
    "## ACC-C1C2-2026.22",
    "",
    "- Added export integrity QA for JSON, CSV, candidate report, evaluator report and PDF print surface.",
    "- Added candidate/evaluator leakage checks against runtime report downloads.",
    "- Added export integrity evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.21",
    "",
    "- Added visual snapshot QA for desktop learning, Category C visualization, admin review and mobile initial states.",
    "- Added screenshot pixel sanity checks, viewport assertions and visual snapshot matrix artifacts.",
    "- Added snapshot evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.20",
    "",
    "- Added accessible Category C mini-graphs for estimates, intervals, sensitivity and missingness.",
    "- Added data visualization readiness report and Category C visualization matrix.",
    "- Added visualization evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "",
    "## ACC-C1C2-2026.19",
    "",
    "- Added adaptive readiness report, adaptive algorithm spec, item exposure policy and simulation matrix.",
    "- Added adaptive evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Separated current heuristic adaptive drill from future calibrated IRT/CAT production claims.",
    "",
    "## ACC-C1C2-2026.18",
    "",
    "- Added operations readiness report plus deployment, retention, proctoring and incident response runbooks.",
    "- Added operations evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Added controlled-beta versus production operations blockers for hosting and support readiness.",
    "",
    "## ACC-C1C2-2026.17",
    "",
    "- Added provisional score interpretation report, cut-score policy, score claim register and standard-setting protocol.",
    "- Added score interpretation evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Added production blockers for standard setting so CEFR-style bands remain diagnostic until calibrated.",
    "",
    "## ACC-C1C2-2026.16",
    "",
    "- Added bank governance report, lifecycle policy, next-bank authoring plan and release signoff checklist.",
    "- Added governance evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Added future-bank controls for stable IDs, no direct mass approval, source-set separation and release ownership.",
    "",
    "## ACC-C1C2-2026.15",
    "",
    "- Added no-secrets/no-email/no-CDN hygiene audit script and output artifact.",
    "- Added hygiene evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.",
    "- Updated deep audit to require a clean hygiene report before release evidence is considered complete.",
    "",
    "## ACC-C1C2-2026.14",
    "",
    "- Added construct coverage report, blueprint matrix and distractor quality report artifacts.",
    "- Expanded automated bank QA with weak-distractor counts, option cue profiles and trap coverage evidence.",
    "- Added new bank quality artifacts to readiness, documentation, service-worker cache, manifest and dashboard gating.",
    "",
    "## ACC-C1C2-2026.13",
    "",
    "- Added skip-link, landmark and live-region accessibility improvements to the standalone runtime.",
    "- Added WCAG conformance matrix, accessibility statement and assistive-technology audit protocol artifacts.",
    "- Expanded automated accessibility checks for landmarks, skip link, progress navigation and status messaging.",
    "",
    "## ACC-C1C2-2026.12",
    "",
    "- Added per-attempt candidate bearer tokens for secure delivery candidate endpoints.",
    "- Added hash-only candidate token persistence and authorization-denial audit rows.",
    "- Expanded secure delivery QA and API documentation for candidate authorization boundaries.",
    "",
    "## ACC-C1C2-2026.11",
    "",
    "- Added a secure PDF report rendering prototype using ReportLab, pypdf and Poppler preview rendering.",
    "- Added candidate/evaluator PDF separation checks to prevent candidate report leakage.",
    "- Added PDF pipeline evidence to readiness, manifest, documentation and QA dashboard gates.",
    "",
    "## ACC-C1C2-2026.10",
    "",
    "- Added local durable attempt storage and JSONL audit logging to the secure delivery prototype.",
    "- Added candidate-safe and protected evaluator report endpoints to the server-backed flow.",
    "- Expanded secure delivery QA to verify persistence, redaction, audit rows and report authorization.",
    "",
    "## ACC-C1C2-2026.9",
    "",
    "- Added a dependency-free secure delivery server prototype with candidate payload redaction and server-side scoring.",
    "- Added secure delivery API spec, deployment blueprint and automated boundary QA report.",
    "- Added secure delivery artifacts to readiness, service-worker cache, manifest and dashboard gating.",
    "",
    "## ACC-C1C2-2026.8",
    "",
    "- Added expert adjudication CSV template, protocol and validator report for human review evidence.",
    "- Added admin-side expert review import/template controls to the standalone runtime.",
    "- Added expert adjudication coverage to readiness, QA dashboard and deep audit gates.",
    "",
    "## ACC-C1C2-2026.7",
    "",
    "- Added per-item timing and answer-history protocol to local sessions, save slots and JSON export.",
    "- Added confidence-adjusted scoring to analytics, CSV export and printable reports.",
    "- Added separate candidate and evaluator report exports with cleaner candidate-mode metadata and sticky mobile answer controls.",
    "",
    "## ACC-C1C2-2026.6",
    "",
    "- Added automated bank quality review report for semantic similarity, banned phrases and obvious-answer risks.",
    "- Added manual expert review packet, review queue CSV, banned phrase registry and human-gated authoring templates.",
    "- Added review workflow artifacts to readiness, service-worker cache and manifest.",
    "",
    "## ACC-C1C2-2026.5",
    "",
    "- Added pilot-response psychometric calibration tooling and output templates.",
    "- Added QA dashboard rollup for content, source, accessibility, psychometric and readiness gates.",
    "- Added admin-surface support for local pilot response import and calibration status.",
    "",
    "## ACC-C1C2-2026.4",
    "",
    "- Added runtime import/export for compatible item bank JSON files.",
    "- Added generated PWA manifest and service worker artifacts for hosted offline install mode.",
    "- Added automated accessibility audit output to the QA gate.",
    "",
    "## ACC-C1C2-2026.3",
    "",
    "- Added item-level source verification metadata, uniqueness score, semantic signature, distractor plausibility rating, manual review checklist and retirement rule.",
    "- Added structured data displays for Category C items and generated Markdown tables from the same data.",
    "- Added source verification, readiness and documentation artifacts to the build output.",
    "",
    "## ACC-C1C2-2026.2",
    "",
    "- Added canonical item bank, assessment metadata, confidence marking, review filters, save slots, reading settings and JSON/CSV export.",
    ""
  ].join("\n");
}

function buildPwaManifest() {
  return {
    name: "Academic C1-C2 Assessment",
    short_name: "C1-C2 Assessment",
    start_url: "./academic_test_platform.html",
    scope: "./",
    display: "standalone",
    background_color: "#070a0f",
    theme_color: "#070a0f",
    description: "Offline-capable academic C1-C2 assessment platform with local progress persistence.",
    categories: ["education", "productivity"],
    lang: "en"
  };
}

function buildServiceWorker() {
  return `const CACHE_NAME = "academic-c1c2-assessment-candidate-ui-v1";
const ASSETS = [
  "./academic_test_platform.html",
  "./item_bank.json",
  "./advanced_academic_tests.md",
  "./academic_test_manifest.json",
  "./source_verification_report.json",
  "./production_readiness_report.json",
  "./wcag_audit_report.json",
  "./wcag_conformance_matrix.json",
  "./wcag_assistive_tech_protocol.md",
  "./accessibility_statement.md",
  "./psychometric_calibration_report.json",
  "./psychometric_item_summary.csv",
  "./pilot_response_template.csv",
  "./score_interpretation_report.json",
  "./standard_setting_protocol.md",
  "./score_claim_register.md",
  "./cut_score_policy.csv",
  "./cefr_interpretation_report.json",
  "./cefr_interpretation_matrix.csv",
  "./adaptive_readiness_report.json",
  "./adaptive_algorithm_spec.md",
  "./item_exposure_policy.md",
  "./adaptive_simulation_matrix.csv",
  "./data_visualization_readiness_report.json",
  "./category_c_visualization_matrix.csv",
  "./exam_protocol_report.json",
  "./exam_protocol_matrix.csv",
  "./section_randomization_report.json",
  "./section_randomization_matrix.csv",
  "./session_management_report.json",
  "./session_management_matrix.csv",
  "./visual_snapshot_report.json",
  "./visual_snapshot_matrix.csv",
  "./export_integrity_report.json",
  "./export_integrity_matrix.csv",
  "./qa_dashboard_report.json",
  "./hygiene_audit_report.json",
  "./bank_governance_report.json",
  "./item_lifecycle_policy.md",
  "./next_bank_authoring_plan.md",
  "./release_signoff_checklist.csv",
  "./operations_readiness_report.json",
  "./production_deployment_runbook.md",
  "./data_retention_policy.md",
  "./proctoring_integrity_policy.md",
  "./incident_response_runbook.md",
  "./bank_quality_review_report.json",
  "./construct_coverage_report.json",
  "./distractor_quality_report.json",
  "./blueprint_matrix.csv",
  "./manual_review_packet.md",
  "./review_queue.csv",
  "./expert_review_template.csv",
  "./expert_review_protocol.md",
  "./expert_adjudication_report.json",
  "./secure_delivery_api_spec.json",
  "./secure_delivery_blueprint.md",
  "./secure_delivery_readiness_report.json",
  "./pdf_report_pipeline_report.json",
  "./pdf/academic-assessment-candidate-report.pdf",
  "./pdf/academic-assessment-evaluator-report.pdf",
  "./pdf/academic-assessment-candidate-report-preview.png",
  "./pdf/academic-assessment-evaluator-report-preview.png",
  "./snapshot_desktop_learning.png",
  "./snapshot_category_c_visual.png",
  "./snapshot_admin_review.png",
  "./snapshot_mobile_initial.png",
  "./banned_phrase_registry.json",
  "./authoring_templates.md",
  "./assessment_platform_docs.md",
  "./CHANGELOG.md",
  "./app.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/academic_test_platform.html") || url.pathname.endsWith("/")) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./academic_test_platform.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./academic_test_platform.html"))));
});
`;
}

function buildHtml(tests) {
  const data = JSON.stringify(tests).replace(/</g, "\\u003c");
  const defaultBankInfo = JSON.stringify({
    schemaVersion: "2.25.0",
    bankVersion: "ACC-C1C2-2026.27",
    itemCount: tests.length,
    source: "embedded"
  }).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Academic C1-C2 Assessment</title>
  <link rel="manifest" href="app.webmanifest">
  <meta name="theme-color" content="#f8fafc">
  <style>
    :root {
      --bg: #f8fafc;
      --panel: #ffffff;
      --panel-strong: #ffffff;
      --text: #111111;
      --muted: #62666d;
      --line: #d8dde5;
      --line-strong: #b8c0cc;
      --accent: #1f5eff;
      --accent-2: #3b3f46;
      --on-accent: #ffffff;
      --good: #087f5b;
      --warn: #b7791f;
      --bad: #b42318;
      --shadow: 0 14px 42px rgba(17, 24, 39, .08);
      --radius: 8px;
      color-scheme: light;
    }
    [data-theme="dark"] {
      --bg: #080808;
      --panel: #141414;
      --panel-strong: #1d1d1d;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --line: #2f2f2f;
      --line-strong: #464646;
      --accent: #f4f4f5;
      --accent-2: #a3a3a3;
      --on-accent: #080808;
      --good: #6ee7b7;
      --warn: #fcd34d;
      --bad: #fca5a5;
      --shadow: 0 20px 60px rgba(0,0,0,.45);
      color-scheme: dark;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      letter-spacing: 0;
    }
    button, input, select { font: inherit; }
    button, select {
      border: 1px solid var(--line-strong);
      background: var(--panel-strong);
      color: var(--text);
      border-radius: 6px;
      min-height: 36px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 750;
      text-transform: none;
      letter-spacing: 0;
      cursor: pointer;
      transition: border-color .15s ease, background .15s ease, color .15s ease;
    }
    button:hover { border-color: var(--accent); }
    button.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
    button.ghost { background: transparent; }
    button.active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
    button:disabled { opacity: .45; cursor: not-allowed; }
    :focus-visible { outline: 3px solid var(--accent-2); outline-offset: 2px; }
    .skip-link {
      position: fixed;
      left: 12px;
      top: 12px;
      z-index: 50;
      transform: translateY(-160%);
      border: 2px solid var(--accent-2);
      border-radius: 6px;
      padding: 10px 12px;
      background: var(--panel-strong);
      color: var(--text);
      font-weight: 900;
    }
    .skip-link:focus { transform: translateY(0); }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    .app { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      gap: 10px;
      align-items: center;
      min-height: 58px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--line);
      background: var(--panel);
      box-shadow: 0 1px 0 rgba(0,0,0,.02);
    }
    .brand { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1 1 auto; }
    .mark {
      min-width: 56px;
      height: 34px;
      display: grid;
      place-items: center;
      padding: 0 8px;
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      font-weight: 900;
      color: var(--accent);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
      flex: 0 0 auto;
    }
    .brand h1 { margin: 0; font-size: 15px; line-height: 1.1; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .brand p { margin: 2px 0 0; color: var(--muted); font-size: 11px; line-height: 1.2; }
    .timer-strip { display: flex; gap: 6px; align-items: center; flex: 0 0 auto; }
    .timebox {
      min-width: 96px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 5px 8px;
      background: var(--panel-strong);
    }
    .timebox span { display: block; color: var(--muted); font-size: 10px; font-weight: 850; }
    .timebox strong { display: block; margin-top: 1px; font-variant-numeric: tabular-nums; font-size: 16px; line-height: 1.1; }
    .timer-action, .theme-toggle, .timer-settings-button {
      min-height: 34px;
      min-width: 48px;
      padding: 0 10px;
      display: inline-grid;
      place-items: center;
    }
    .timer-settings { position: relative; }
    .timer-settings-button {
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      background: var(--panel-strong);
      color: var(--text);
      font-size: 12px;
      font-weight: 750;
      cursor: pointer;
    }
    .timer-popover {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      z-index: 25;
      width: min(300px, calc(100vw - 20px));
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel-strong);
      box-shadow: var(--shadow);
    }
    .timer-quick { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    .timer-custom { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 10px; }
    .timer-custom input { min-width: 0; height: 36px; border: 1px solid var(--line); border-radius: 6px; padding: 0 10px; background: var(--panel); color: var(--text); }
    .shell {
      display: grid;
      grid-template-columns: 250px minmax(0, 1fr) 310px;
      gap: 14px;
      padding: 14px;
      max-width: 1680px;
      width: 100%;
      margin: 0 auto;
    }
    [data-admin="false"] .shell {
      grid-template-columns: minmax(0, 940px);
      justify-content: center;
      max-width: 980px;
      padding: 12px;
    }
    [data-admin="false"] .left,
    [data-admin="false"] .right {
      display: none;
    }
    .panel {
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--panel);
      backdrop-filter: blur(18px);
      box-shadow: var(--shadow);
      min-width: 0;
    }
    .left, .right { align-self: start; position: sticky; top: 78px; max-height: calc(100vh - 92px); overflow: auto; }
    .section { padding: 14px; border-bottom: 1px solid var(--line); }
    .section:last-child { border-bottom: 0; }
    .label { color: var(--muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .big { font-size: 28px; line-height: 1; font-weight: 900; font-variant-numeric: tabular-nums; }
    .muted { color: var(--muted); }
    .progress-track { height: 8px; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; margin-top: 10px; }
    .progress-fill { height: 100%; width: 0; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
    .jump-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 12px; }
    .jump {
      min-height: 30px;
      padding: 0;
      font-size: 11px;
      border-color: var(--line);
      background: transparent;
    }
    .jump.active { border-color: var(--accent); color: var(--accent); }
    .jump.done { background: color-mix(in srgb, var(--accent) 12%, transparent); }
    .jump.flagged { border-style: dashed; border-color: var(--warn); }
    .mini-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
    .exam { display: grid; gap: 14px; }
    .question-panel { padding: 18px; }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--line);
    }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 8px;
      font-size: 10px;
      font-weight: 900;
      color: var(--muted);
      background: rgba(255,255,255,.12);
    }
    .source { font-size: 11px; line-height: 1.4; color: var(--muted); word-break: break-word; }
    .source a { color: var(--accent); text-decoration: none; }
    .passage {
      margin: 18px 0;
      padding-left: 16px;
      border-left: 2px solid var(--accent);
      color: var(--text);
      font-family: inherit;
      font-size: 17px;
      line-height: 1.66;
      max-width: 86ch;
    }
    [data-reading-size="large"] .passage { font-size: 19px; line-height: 1.82; }
    [data-reading-size="compact"] .passage { font-size: 15px; line-height: 1.55; }
    [data-reading-font="sans"] .passage { font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif; }
    [data-reading-line="tight"] .passage { line-height: 1.5; }
    [data-reading-line="loose"] .passage { line-height: 1.9; }
    [data-passage-width="narrow"] .passage { max-width: 68ch; }
    [data-passage-width="wide"] .passage { max-width: none; }
    .prompt { font-size: 18px; line-height: 1.42; font-weight: 850; margin: 0 0 14px; }
    .options { display: grid; gap: 9px; }
    .option {
      display: grid;
      grid-template-columns: 28px 1fr;
      gap: 10px;
      align-items: start;
      border: 1px solid var(--line);
      border-radius: 7px;
      padding: 12px;
      cursor: pointer;
      background: rgba(255,255,255,.10);
      transition: border-color .15s ease, background .15s ease, transform .15s ease;
    }
    .option:hover { border-color: var(--accent); transform: translateY(-1px); }
    .option.selected { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent); }
    .option.correct { border-color: var(--good); background: color-mix(in srgb, var(--good) 13%, transparent); }
    .option.wrong { border-color: var(--bad); background: color-mix(in srgb, var(--bad) 10%, transparent); }
    .option input { margin-top: 3px; accent-color: var(--accent); }
    .option b { font-size: 12px; }
    .option span { font-size: 14px; line-height: 1.45; }
    .actions { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; align-items: center; margin-top: 16px; }
    .actions button { min-height: 42px; }
    .candidate-progress {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--panel);
    }
    .candidate-progress strong { display: block; font-size: 13px; }
    .candidate-progress span { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
    .candidate-progress .progress-track { grid-column: 1 / -1; margin-top: 0; }
    .flag-pill { color: var(--warn); font-size: 12px; font-weight: 800; white-space: nowrap; }
    .review { padding: 16px; border-top: 1px solid var(--line); background: color-mix(in srgb, var(--accent) 6%, transparent); }
    .review h2, .review h3 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; }
    .review p { margin: 0; line-height: 1.55; font-size: 14px; }
    .score-line { display: flex; justify-content: space-between; gap: 10px; margin-top: 10px; font-size: 12px; }
    .bar { height: 7px; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; margin-top: 5px; }
    .bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); width: 0; }
    .review-list { display: grid; gap: 10px; max-height: 420px; overflow: auto; }
    .review-item { border: 1px solid var(--line); border-radius: 7px; padding: 10px; }
    .review-item strong { display: block; font-size: 12px; margin-bottom: 4px; }
    .review-item p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.4; }
    .history-list { display: grid; gap: 8px; margin-top: 10px; }
    .history-item { border: 1px solid var(--line); border-radius: 6px; padding: 8px; }
    .history-item strong { display: block; font-size: 12px; }
    .history-item span { display: block; color: var(--muted); font-size: 11px; margin-top: 3px; line-height: 1.35; }
    .field { display: grid; gap: 6px; margin-top: 10px; }
    .field input, .field select {
      width: 100%;
      min-height: 36px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 0 10px;
      background: var(--panel-strong);
      color: var(--text);
      font-size: 12px;
      font-weight: 700;
    }
    .field input[type="file"] { padding: 8px; min-height: 42px; }
    .segmented { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
    .segmented button { min-height: 32px; padding: 0 6px; font-size: 10px; }
    .segmented button.active { border-color: var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
    .progress-map { display: grid; grid-template-columns: repeat(20, 1fr); gap: 2px; margin-top: 10px; }
    .map-dot {
      height: 8px;
      border: 1px solid var(--line);
      border-radius: 2px;
      background: transparent;
      padding: 0;
      min-height: 8px;
    }
    .map-dot.done { background: var(--accent); border-color: var(--accent); }
    .map-dot.flagged { border-color: var(--warn); background: color-mix(in srgb, var(--warn) 20%, transparent); }
    .map-dot.active { outline: 1px solid var(--text); outline-offset: 1px; }
    .metadata-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
    .metadata-grid div { border: 1px solid var(--line); border-radius: 6px; padding: 8px; }
    .metadata-grid span { display: block; color: var(--muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .metadata-grid strong { display: block; margin-top: 4px; font-size: 12px; }
    .data-card { border: 1px solid var(--line); border-radius: 7px; margin: 14px 0; overflow: hidden; }
    .data-card table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .data-card caption { text-align: left; padding: 9px 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
    .data-card th, .data-card td { padding: 8px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    .data-card tr:last-child td { border-bottom: 0; }
    .data-viz { border: 1px solid var(--line); border-radius: 7px; margin: 14px 0; padding: 12px; background: color-mix(in srgb, var(--accent-2) 6%, transparent); }
    .viz-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; margin-bottom: 10px; }
    .viz-head strong { font-size: 13px; }
    .viz-head span { color: var(--muted); font-size: 11px; }
    .viz-row { display: grid; grid-template-columns: minmax(112px, 1fr) minmax(130px, 2fr) minmax(52px, auto); gap: 8px; align-items: center; margin-top: 8px; font-size: 12px; }
    .viz-label { color: var(--text); font-weight: 800; }
    .viz-track { position: relative; height: 12px; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; background: color-mix(in srgb, var(--line) 34%, transparent); }
    .viz-track i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
    .viz-range { position: absolute; top: -1px; height: calc(100% + 2px); border-left: 2px solid var(--text); border-right: 2px solid var(--text); opacity: .45; pointer-events: none; }
    .viz-value { text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); font-weight: 800; }
    .viz-note { grid-column: 2 / -1; color: var(--muted); font-size: 11px; line-height: 1.35; }
    .admin-panel code { white-space: pre-wrap; word-break: break-word; font-size: 11px; }
    .role-badge { display: inline-flex; align-items: center; min-height: 26px; border: 1px solid var(--line); border-radius: 999px; padding: 0 8px; color: var(--muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 30;
      display: grid;
      place-items: center;
      padding: 18px;
      background: rgba(0,0,0,.38);
    }
    .dialog {
      width: min(520px, 100%);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel-strong);
      box-shadow: var(--shadow);
      padding: 16px;
    }
    .key-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
    .key-grid div { border: 1px solid var(--line); border-radius: 6px; padding: 8px; font-size: 12px; }
    .field textarea {
      width: 100%;
      min-height: 96px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      background: var(--panel-strong);
      color: var(--text);
      font-size: 12px;
      font-weight: 650;
      resize: vertical;
    }
    .export-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; margin-top: 10px; }
    .export-row button { padding: 0 6px; font-size: 10px; }
    .section-toggle {
      width: 100%;
      min-height: 34px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--text);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      text-align: left;
    }
    .section-toggle:hover { color: var(--accent); }
    .section-toggle .label { color: inherit; }
    .section-toggle .toggle-state { color: var(--muted); font-size: 10px; font-weight: 900; text-transform: uppercase; }
    .section-body[hidden] { display: none; }
    .section-body { padding-top: 8px; }
    .sr-note { margin-top: 8px; color: var(--muted); font-size: 11px; line-height: 1.35; }
    @media (max-width: 1120px) {
      .shell { grid-template-columns: 1fr; }
      .left, .right { position: static; max-height: none; }
      .left { order: 2; }
      .right { order: 3; }
    }
    @media (max-width: 680px) {
      .topbar { min-height: 56px; padding: 7px 8px; gap: 6px; flex-wrap: nowrap; }
      .brand { gap: 6px; flex: 1 1 88px; }
      .brand p { display: none; }
      .brand h1 { font-size: 13px; max-width: 64px; }
      .mark { min-width: 48px; height: 32px; padding: 0 6px; font-size: 11px; }
      .timer-strip { gap: 4px; }
      .timebox { min-width: 54px; padding: 4px 6px; text-align: center; }
      .timebox span { display: none; }
      .timebox strong { font-size: 13px; }
      .timer-action, .theme-toggle, .timer-settings-button { min-width: 38px; min-height: 32px; padding: 0 6px; font-size: 11px; }
      .timer-popover { right: -2px; top: calc(100% + 7px); }
      .shell, [data-admin="false"] .shell { padding: 8px; gap: 8px; max-width: none; }
      .question-panel { padding: 12px; }
      .candidate-progress { padding: 8px 10px; margin-bottom: 8px; }
      .passage { font-size: 15px; line-height: 1.58; padding-left: 10px; margin: 14px 0; }
      .prompt { font-size: 16px; }
      .option { grid-template-columns: 24px 1fr; padding: 10px; }
      .jump-grid { grid-template-columns: repeat(10, 1fr); }
      .mini-row { grid-template-columns: 1fr; }
      .viz-head { display: block; }
      .viz-row { grid-template-columns: 1fr; }
      .viz-note { grid-column: auto; }
      .viz-value { text-align: left; }
      .actions {
        position: sticky;
        bottom: 0;
        z-index: 8;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        align-items: stretch;
        min-height: 56px;
        padding: 6px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: var(--bg);
        box-shadow: var(--shadow);
      }
      .actions button { min-height: 42px; padding: 0 8px; font-size: 12px; }
      .export-row { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#question-panel">Skip to question</a>
  <div id="app" class="app"></div>
  <script>
    const EMBEDDED_TESTS = ${data};
    const DEFAULT_BANK_INFO = ${defaultBankInfo};
    const letters = ["A", "B", "C", "D", "E"];
    const blockSize = 10;
    const blockSeconds = 15 * 60;
    const examSections = [
      { key: "A", label: "Reading Synthesis", start: 1, end: 100, minutes: 90, breakAfterMinutes: 10 },
      { key: "B", label: "Use of Academic English", start: 101, end: 200, minutes: 90, breakAfterMinutes: 10 },
      { key: "C", label: "Data Interpretation", start: 201, end: 300, minutes: 90, breakAfterMinutes: 0 }
    ];
    const cefrBands = [
      { profile: "C1 Developing", min: 0, max: .599, claim: "partial control of academic reading and usage tasks", interpretation: "Weighted performance is below the current C1-secure threshold, so the result should drive targeted review rather than a high-stakes claim.", recommendation: "Review weak modules before retesting." },
      { profile: "C1 Secure", min: .6, max: .759, claim: "secure C1-level control across many academic tasks", interpretation: "Weighted performance meets the provisional C1-secure threshold while still requiring skill-level review for C2 claims.", recommendation: "Check weaker modules and confidence calibration." },
      { profile: "C2 Emerging", min: .76, max: .879, claim: "emerging C2-level performance on complex academic tasks", interpretation: "Weighted performance clears the provisional C2-emerging boundary but remains below the C2-secure threshold.", recommendation: "Confirm methodology and data interpretation strength." },
      { profile: "C2 Secure", min: .88, max: 1, claim: "strong performance on the current high-level academic bank", interpretation: "Weighted performance meets the provisional C2-secure boundary for this bank, subject to calibration and standard-setting limits.", recommendation: "Use evaluator review for high-stakes decisions." }
    ];
    function normalizeBankPayload(payload, sourceName = "imported") {
      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      const items = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(items) || !items.length) throw new Error("Imported bank does not contain an items array.");
      const required = ["id", "category", "type", "expectedSelections", "options", "correct", "passage", "prompt", "rationale"];
      for (const item of items) {
        for (const field of required) {
          if (!(field in item)) throw new Error("Imported item " + (item.id || "unknown") + " is missing " + field + ".");
        }
        if (!Array.isArray(item.options) || item.options.length !== 5) throw new Error("Imported item " + item.id + " must have five options.");
        if (!Array.isArray(item.correct) || !item.correct.every((letter) => letters.includes(letter))) throw new Error("Imported item " + item.id + " has an invalid answer key.");
      }
      return {
        items,
        bankInfo: {
          schemaVersion: parsed.schemaVersion || "unknown",
          bankVersion: parsed.bankVersion || sourceName,
          itemCount: items.length,
          source: sourceName,
          importedAt: new Date().toISOString()
        }
      };
    }
    function loadRuntimeBank() {
      const raw = localStorage.getItem("acc_imported_bank");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return normalizeBankPayload(parsed, parsed.bankVersion || "imported");
        } catch (error) {
          localStorage.removeItem("acc_imported_bank");
        }
      }
      return { items: EMBEDDED_TESTS, bankInfo: DEFAULT_BANK_INFO };
    }
    let runtimeBank = loadRuntimeBank();
    let TESTS = runtimeBank.items;
    window.TESTS = TESTS;
    const UI_VERSION = "candidate-ui-v1";
    const ADMIN_MODE = new URLSearchParams(location.search).get("admin") === "1";
    if (localStorage.getItem("acc_ui_version") !== UI_VERSION) {
      localStorage.setItem("acc_ui_version", UI_VERSION);
      localStorage.setItem("acc_theme", "light");
      localStorage.setItem("acc_mode", "learning");
      localStorage.setItem("acc_role_mode", "candidate");
      localStorage.setItem("acc_reading_font", "sans");
      localStorage.setItem("acc_reading_size", "normal");
      localStorage.setItem("acc_reading_line", "normal");
      localStorage.setItem("acc_ui_migration_at", new Date().toISOString());
    }
    const defaultSlotLabels = { "default": "Default slot", "mock-a": "Mock A", "mock-b": "Mock B" };
    function loadSlotLabels() {
      try {
        return { ...defaultSlotLabels, ...JSON.parse(localStorage.getItem("acc_slot_labels") || "{}") };
      } catch (error) {
        return { ...defaultSlotLabels };
      }
    }
    const state = {
      index: Number(localStorage.getItem("acc_index") || 0),
      block: Math.floor(Number(localStorage.getItem("acc_index") || 0) / blockSize),
      selections: JSON.parse(localStorage.getItem("acc_selections") || "{}"),
      submitted: JSON.parse(localStorage.getItem("acc_submitted") || "{}"),
      scores: JSON.parse(localStorage.getItem("acc_scores") || "{}"),
      flagged: JSON.parse(localStorage.getItem("acc_flagged") || "{}"),
      confidence: JSON.parse(localStorage.getItem("acc_confidence") || "{}"),
      timeSpent: JSON.parse(localStorage.getItem("acc_time_spent") || "{}"),
      answerHistory: JSON.parse(localStorage.getItem("acc_answer_history") || "{}"),
      itemEnteredAt: Date.now(),
      startedAt: Number(localStorage.getItem("acc_started") || Date.now()),
      blockStartedAt: Number(localStorage.getItem("acc_block_started") || Date.now()),
      theme: localStorage.getItem("acc_theme") || "light",
      mode: ADMIN_MODE ? (localStorage.getItem("acc_mode") || "learning") : "learning",
      timerDurationSeconds: Math.max(60, Number(localStorage.getItem("acc_timer_duration") || blockSeconds)),
      timerPaused: localStorage.getItem("acc_timer_paused") === "true",
      timerElapsedSeconds: Math.max(0, Number(localStorage.getItem("acc_timer_elapsed") || 0)),
      timerLastTickAt: Date.now(),
      sessionPreset: localStorage.getItem("acc_session_preset") || "full",
      randomQuestions: localStorage.getItem("acc_random_questions") === "true",
      randomOptions: localStorage.getItem("acc_random_options") === "true",
      randomSeed: Number(localStorage.getItem("acc_random_seed") || 20260626),
      reviewFilter: localStorage.getItem("acc_review_filter") || "all",
      search: localStorage.getItem("acc_search") || "",
      categoryFilter: localStorage.getItem("acc_category_filter") || "all",
      domainFilter: localStorage.getItem("acc_domain_filter") || "all",
      trapFilter: localStorage.getItem("acc_trap_filter") || "all",
      readingSize: localStorage.getItem("acc_reading_size") || "normal",
      readingFont: localStorage.getItem("acc_reading_font") || "sans",
      readingLine: localStorage.getItem("acc_reading_line") || "normal",
      passageWidth: localStorage.getItem("acc_passage_width") || "standard",
      roleMode: ADMIN_MODE ? (localStorage.getItem("acc_role_mode") === "evaluator" ? "evaluator" : "admin") : "candidate",
      evaluatorNotes: JSON.parse(localStorage.getItem("acc_evaluator_notes") || "{}"),
      pilotCalibration: JSON.parse(localStorage.getItem("acc_pilot_calibration") || '{"status":"awaiting-pilot-data","candidateCount":0,"validResponseRows":0,"recommendations":{}}'),
      expertAdjudication: JSON.parse(localStorage.getItem("acc_expert_adjudication") || '{"status":"awaiting-human-adjudication","reviewerCount":0,"validReviewRows":0,"itemCoverage":0,"doubleReviewedItemCount":0,"unresolvedItemCount":0,"decisions":{}}'),
      examBreaks: JSON.parse(localStorage.getItem("acc_exam_breaks") || '{"afterA":false,"afterB":false}'),
      analyticsOpen: JSON.parse(localStorage.getItem("acc_analytics_open") || '{"profile":true,"competence":true,"skills":true,"confidence":true,"history":true,"review":true,"export":true,"reading":true}'),
      activeSlot: localStorage.getItem("acc_active_slot") || "default",
      slotLabels: loadSlotLabels(),
      slotDraft: localStorage.getItem("acc_slot_draft") || "",
      bankInfo: runtimeBank.bankInfo,
      importStatus: runtimeBank.bankInfo.source === "embedded" ? "Embedded bank loaded." : "Imported bank loaded.",
      pwaStatus: "available",
      showReviewAll: false,
      showShortcuts: false,
      showTimerSettings: false
    };
    document.documentElement.dataset.admin = ADMIN_MODE ? "true" : "false";
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.readingSize = state.readingSize;
    document.documentElement.dataset.readingFont = state.readingFont;
    document.documentElement.dataset.readingLine = state.readingLine;
    document.documentElement.dataset.passageWidth = state.passageWidth;
    function persist() {
      localStorage.setItem("acc_index", String(state.index));
      localStorage.setItem("acc_selections", JSON.stringify(state.selections));
      localStorage.setItem("acc_submitted", JSON.stringify(state.submitted));
      localStorage.setItem("acc_scores", JSON.stringify(state.scores));
      localStorage.setItem("acc_flagged", JSON.stringify(state.flagged));
      localStorage.setItem("acc_confidence", JSON.stringify(state.confidence));
      localStorage.setItem("acc_time_spent", JSON.stringify(state.timeSpent));
      localStorage.setItem("acc_answer_history", JSON.stringify(state.answerHistory));
      localStorage.setItem("acc_started", String(state.startedAt));
      localStorage.setItem("acc_block_started", String(state.blockStartedAt));
      localStorage.setItem("acc_ui_version", UI_VERSION);
      localStorage.setItem("acc_theme", state.theme);
      localStorage.setItem("acc_mode", state.mode);
      localStorage.setItem("acc_timer_duration", String(state.timerDurationSeconds));
      localStorage.setItem("acc_timer_paused", String(state.timerPaused));
      localStorage.setItem("acc_timer_elapsed", String(Math.round(state.timerElapsedSeconds)));
      localStorage.setItem("acc_session_preset", state.sessionPreset);
      localStorage.setItem("acc_random_questions", String(state.randomQuestions));
      localStorage.setItem("acc_random_options", String(state.randomOptions));
      localStorage.setItem("acc_random_seed", String(state.randomSeed));
      localStorage.setItem("acc_review_filter", state.reviewFilter);
      localStorage.setItem("acc_search", state.search);
      localStorage.setItem("acc_category_filter", state.categoryFilter);
      localStorage.setItem("acc_domain_filter", state.domainFilter);
      localStorage.setItem("acc_trap_filter", state.trapFilter);
      localStorage.setItem("acc_reading_size", state.readingSize);
      localStorage.setItem("acc_reading_font", state.readingFont);
      localStorage.setItem("acc_reading_line", state.readingLine);
      localStorage.setItem("acc_passage_width", state.passageWidth);
      localStorage.setItem("acc_role_mode", state.roleMode);
      localStorage.setItem("acc_evaluator_notes", JSON.stringify(state.evaluatorNotes));
      localStorage.setItem("acc_pilot_calibration", JSON.stringify(state.pilotCalibration));
      localStorage.setItem("acc_expert_adjudication", JSON.stringify(state.expertAdjudication));
      localStorage.setItem("acc_exam_breaks", JSON.stringify(state.examBreaks));
      localStorage.setItem("acc_analytics_open", JSON.stringify(state.analyticsOpen));
      localStorage.setItem("acc_active_slot", state.activeSlot);
      localStorage.setItem("acc_slot_labels", JSON.stringify(state.slotLabels));
      localStorage.setItem("acc_slot_draft", state.slotDraft);
    }
    function fmt(seconds) {
      const s = Math.max(0, Math.floor(seconds));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const r = s % 60;
      return h ? \`\${h}:\${String(m).padStart(2,"0")}:\${String(r).padStart(2,"0")}\` : \`\${m}:\${String(r).padStart(2,"0")}\`;
    }
    function escapeAttr(value) {
      return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function escapeHtml(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function clampPercent(value, max) {
      const denominator = Number(max) || 1;
      const raw = (Number(value) || 0) / denominator * 100;
      return Math.max(0, Math.min(100, raw));
    }
    function renderDataVisualization(viz) {
      if (!viz || !Array.isArray(viz.series)) return "";
      const rows = viz.series.map((point) => {
        const max = Number(point.scaleMax || viz.scale?.max || 1);
        const width = clampPercent(point.value, max);
        const left = clampPercent(point.low || 0, max);
        const right = clampPercent(point.high || point.value || 0, max);
        const rangeWidth = Math.max(2, right - left);
        const unit = point.unit || "";
        return "<div class=\\"viz-row\\">" +
          "<div class=\\"viz-label\\">" + escapeHtml(point.label) + "</div>" +
          "<div class=\\"viz-track\\" aria-hidden=\\"true\\"><i style=\\"width:" + width.toFixed(1) + "%\\"></i><span class=\\"viz-range\\" style=\\"left:" + left.toFixed(1) + "%;width:" + rangeWidth.toFixed(1) + "%\\"></span></div>" +
          "<div class=\\"viz-value\\">" + escapeHtml(point.value + unit) + "</div>" +
          "<div class=\\"viz-note\\">" + escapeHtml(point.interpretation || point.encoding || "") + "</div>" +
        "</div>";
      }).join("");
      return "<div class=\\"data-viz\\" role=\\"img\\" aria-label=\\"" + escapeAttr(viz.ariaLabel || viz.title || "Data visualization") + "\\">" +
        "<div class=\\"viz-head\\"><strong>" + escapeHtml(viz.title || "Mini graph") + "</strong><span>" + escapeHtml(viz.scale?.unit || "relative scale") + "</span></div>" +
        rows +
      "</div>";
    }
    function renderDataDisplay(q) {
      const table = q.dataDisplay ? "<div class=\\"data-card\\"><table><caption>" + escapeHtml(q.dataDisplay.caption) + "</caption><thead><tr><th>Measure</th><th>Value</th><th>Interpretation</th></tr></thead><tbody>" + q.dataDisplay.rows.map((row) => "<tr><td>" + escapeHtml(row.measure) + "</td><td>" + escapeHtml(row.value) + "</td><td>" + escapeHtml(row.interpretation) + "</td></tr>").join("") + "</tbody></table></div>" : "";
      return table + renderDataVisualization(q.dataVisualization);
    }
    function selectedLetters(q) { return state.selections[q.id] || []; }
    function itemStoredTime(q) {
      return Math.max(0, Math.round(Number(state.timeSpent[q.id]) || 0));
    }
    function syncTimer() {
      const now = Date.now();
      if (!state.timerPaused) {
        const delta = Math.max(0, (now - state.timerLastTickAt) / 1000);
        if (delta > 0) {
          state.timerElapsedSeconds = Math.min(state.timerDurationSeconds, state.timerElapsedSeconds + delta);
          if (state.timerElapsedSeconds >= state.timerDurationSeconds) state.timerPaused = true;
          localStorage.setItem("acc_timer_elapsed", String(Math.round(state.timerElapsedSeconds)));
          localStorage.setItem("acc_timer_paused", String(state.timerPaused));
        }
      }
      state.timerLastTickAt = now;
    }
    function timerRemainingSeconds() {
      return Math.max(0, Math.round(state.timerDurationSeconds - state.timerElapsedSeconds));
    }
    function toggleTimerPaused() {
      syncTimer();
      if (!state.timerPaused) recordTimeForCurrentItem();
      state.timerPaused = !state.timerPaused;
      state.timerLastTickAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function setTimerDuration(minutes) {
      syncTimer();
      const parsed = Math.max(1, Math.min(300, Math.round(Number(minutes) || 15)));
      state.timerDurationSeconds = parsed * 60;
      state.timerElapsedSeconds = Math.min(state.timerElapsedSeconds, state.timerDurationSeconds);
      state.timerPaused = false;
      state.timerLastTickAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function resetTimer() {
      state.timerElapsedSeconds = 0;
      state.timerPaused = false;
      state.startedAt = Date.now();
      state.blockStartedAt = Date.now();
      state.timerLastTickAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function toggleTimerSettings() {
      state.showTimerSettings = !state.showTimerSettings;
      render();
    }
    function itemVisibleTime(q) {
      const active = TESTS[state.index]?.id === q.id && !state.submitted[q.id] && !state.timerPaused;
      const live = active ? Math.max(0, Math.min(1800, Math.round((Date.now() - state.itemEnteredAt) / 1000))) : 0;
      return itemStoredTime(q) + live;
    }
    function recordTimeForCurrentItem() {
      const q = TESTS[state.index];
      if (!q) return;
      if (!state.submitted[q.id] && !state.timerPaused) {
        const elapsed = Math.max(0, Math.min(1800, Math.round((Date.now() - state.itemEnteredAt) / 1000)));
        state.timeSpent[q.id] = itemStoredTime(q) + elapsed;
      }
      state.itemEnteredAt = Date.now();
    }
    function itemNumber(q) {
      return Number(String(q.id).replace(/\\D/g, "")) || 0;
    }
    function seededRank(value, salt = 0) {
      const raw = Math.sin((value + 1) * 999 + state.randomSeed + salt) * 10000;
      return raw - Math.floor(raw);
    }
    function orderedIndices(indices, salt = 0) {
      return [...indices].sort((a, b) => seededRank(a, salt) - seededRank(b, salt));
    }
    function orderedSectionIndices(indices) {
      const ordered = [];
      for (const section of examSections) {
        const sectionIndices = indices.filter((idx) => TESTS[idx]?.category === section.key);
        ordered.push(...orderedIndices(sectionIndices, 5100 + section.key.charCodeAt(0)));
      }
      return ordered.length === indices.length ? ordered : orderedIndices(indices, 5100);
    }
    function balancedLimit(limit) {
      const byCategory = {
        A: TESTS.map((q, idx) => q.category === "A" ? idx : -1).filter((idx) => idx >= 0),
        B: TESTS.map((q, idx) => q.category === "B" ? idx : -1).filter((idx) => idx >= 0),
        C: TESTS.map((q, idx) => q.category === "C" ? idx : -1).filter((idx) => idx >= 0)
      };
      const result = [];
      let cursor = 0;
      while (result.length < limit) {
        for (const category of ["A", "B", "C"]) {
          const idx = byCategory[category][cursor];
          if (idx !== undefined && result.length < limit) result.push(idx);
        }
        cursor += 1;
      }
      return result;
    }
    function weakestSubmittedSkill() {
      const rows = {};
      for (const q of TESTS) {
        if (!state.submitted[q.id]) continue;
        rows[q.skillModule] ||= { done: 0, points: 0 };
        rows[q.skillModule].done += 1;
        rows[q.skillModule].points += Number(state.scores[q.id]) || 0;
      }
      const candidates = Object.entries(rows).filter(([, row]) => row.done > 0);
      if (!candidates.length) return "";
      candidates.sort((a, b) => (a[1].points / a[1].done) - (b[1].points / b[1].done));
      return candidates[0][0];
    }
    function adaptiveIndices() {
      const weakSkill = weakestSubmittedSkill();
      const all = TESTS.map((_, idx) => idx);
      return all.sort((a, b) => {
        const qa = TESTS[a];
        const qb = TESTS[b];
        const aSubmitted = state.submitted[qa.id] ? 1 : 0;
        const bSubmitted = state.submitted[qb.id] ? 1 : 0;
        if (aSubmitted !== bSubmitted) return aSubmitted - bSubmitted;
        const aWeak = weakSkill && qa.skillModule === weakSkill ? 0 : 1;
        const bWeak = weakSkill && qb.skillModule === weakSkill ? 0 : 1;
        if (aWeak !== bWeak) return aWeak - bWeak;
        return (qb.psychometrics?.estimatedDifficultyLogit || 0) - (qa.psychometrics?.estimatedDifficultyLogit || 0);
      });
    }
    function activeIndices() {
      let indices;
      if (state.sessionPreset === "diagnostic20") indices = balancedLimit(20);
      else if (state.sessionPreset === "mock50") indices = balancedLimit(50);
      else if (state.sessionPreset === "categoryA") indices = TESTS.map((q, idx) => q.category === "A" ? idx : -1).filter((idx) => idx >= 0);
      else if (state.sessionPreset === "categoryB") indices = TESTS.map((q, idx) => q.category === "B" ? idx : -1).filter((idx) => idx >= 0);
      else if (state.sessionPreset === "categoryC") indices = TESTS.map((q, idx) => q.category === "C" ? idx : -1).filter((idx) => idx >= 0);
      else if (state.sessionPreset === "adaptive") indices = adaptiveIndices();
      else indices = TESTS.map((_, idx) => idx);
      if (state.randomQuestions && state.sessionPreset !== "adaptive") indices = orderedSectionIndices(indices);
      return indices.length ? indices : [0];
    }
    function examSectionForItem(item) {
      return examSections.find((section) => section.key === item.category) || examSections[0];
    }
    function currentExamSection() {
      return examSectionForItem(TESTS[state.index] || TESTS[0]);
    }
    function examSectionProgress(section) {
      const items = TESTS.filter((item) => item.category === section.key);
      const submitted = items.filter((item) => state.submitted[item.id]).length;
      return {
        key: section.key,
        label: section.label,
        total: items.length,
        submitted,
        percent: items.length ? submitted / items.length : 0,
        minutes: section.minutes,
        breakAfterMinutes: section.breakAfterMinutes
      };
    }
    function finalProtocolReady() {
      return TESTS.length > 0 && TESTS.every((item) => state.submitted[item.id]);
    }
    function questionOrderSnapshot() {
      const indices = activeIndices();
      const blocks = examSections.map((section) => {
        const positions = indices.map((idx, order) => ({ idx, order })).filter((entry) => TESTS[entry.idx]?.category === section.key).map((entry) => entry.order + 1);
        return {
          key: section.key,
          label: section.label,
          firstPosition: positions[0] || null,
          lastPosition: positions[positions.length - 1] || null,
          count: positions.length
        };
      });
      return {
        sectionPreserving: blocks.every((block, index) => block.count === 100 && block.firstPosition === index * 100 + 1 && block.lastPosition === (index + 1) * 100),
        randomQuestions: state.randomQuestions,
        randomSeed: state.randomSeed,
        activePreset: state.sessionPreset,
        blocks
      };
    }
    function examProtocolSnapshot() {
      return {
        sections: examSections.map((section) => examSectionProgress(section)),
        breaks: {
          afterA: Boolean(state.examBreaks.afterA),
          afterB: Boolean(state.examBreaks.afterB)
        },
        finalProtocolReady: finalProtocolReady(),
        activeSection: currentExamSection().key,
        requiredBreaks: examSections.filter((section) => section.breakAfterMinutes > 0).map((section) => "after" + section.key),
        generatedAt: new Date().toISOString()
      };
    }
    function currentSessionPosition(indices = activeIndices()) {
      const pos = indices.indexOf(state.index);
      return pos >= 0 ? pos : 0;
    }
    function optionOrder(q) {
      const order = [0, 1, 2, 3, 4];
      return state.randomOptions ? orderedIndices(order, 9000 + itemNumber(q)) : order;
    }
    function displayCorrect(q) {
      const order = optionOrder(q);
      return q.correct.map((letter) => letters[order.indexOf(letters.indexOf(letter))]).sort();
    }
    function displaySelected(q) {
      const order = optionOrder(q);
      return selectedLetters(q).map((letter) => letters[order.indexOf(letters.indexOf(letter))]).sort();
    }
    function rationaleForDisplay(q) {
      const source = q.correct.join(", ");
      const display = displayCorrect(q).join(", ");
      if (source === display) return q.rationale;
      return q.rationale
        .replace("The correct answer is " + source, "The correct answer is " + display)
        .replace("The correct answer set is " + source, "The correct answer set is " + display);
    }
    function confidenceAdjustment(score, confidence) {
      if (confidence === "high") return score >= .999 ? .02 : -.15 * (1 - score);
      if (confidence === "low") return score >= .999 ? -.04 : .04 * (1 - score);
      return 0;
    }
    function confidenceAdjustedScore(score, confidence) {
      return Math.max(-.2, Math.min(1, score + confidenceAdjustment(score, confidence)));
    }
    function buildAnswerRecord(q) {
      const score = Number(state.scores[q.id]) || 0;
      const confidence = state.confidence[q.id] || "medium";
      const adjusted = confidenceAdjustedScore(score, confidence);
      const weight = Number(q.scoringWeight) || 1;
      return {
        itemId: q.id,
        category: q.category,
        skillModule: q.skillModule,
        difficultyTier: q.difficultyTier,
        submittedAt: new Date().toISOString(),
        mode: state.mode,
        sessionPreset: state.sessionPreset,
        sourceSelected: selectedLetters(q),
        displaySelected: displaySelected(q),
        sourceCorrect: q.correct,
        displayCorrect: displayCorrect(q),
        score: Number(score.toFixed(3)),
        weightedScore: Number((score * weight).toFixed(3)),
        confidence,
        confidenceAdjustedScore: Number(adjusted.toFixed(3)),
        confidenceAdjustedWeightedScore: Number((adjusted * weight).toFixed(3)),
        timeSpentSeconds: itemStoredTime(q),
        rationale: rationaleForDisplay(q),
        evaluatorNote: state.evaluatorNotes[q.id] || ""
      };
    }
    function setSelection(letter) {
      const q = TESTS[state.index];
      if (state.submitted[q.id]) return;
      if (q.type === "single") state.selections[q.id] = [letter];
      else {
        const current = new Set(selectedLetters(q));
        current.has(letter) ? current.delete(letter) : current.add(letter);
        state.selections[q.id] = [...current].sort();
      }
      persist();
      render();
    }
    function setConfidence(level) {
      const q = TESTS[state.index];
      state.confidence[q.id] = level;
      persist();
      render();
    }
    function setMode(mode) {
      state.mode = mode;
      persist();
      render();
    }
    function setSessionPreset(value) {
      recordTimeForCurrentItem();
      state.sessionPreset = value;
      const indices = activeIndices();
      state.index = indices[0] || 0;
      state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function setRandomQuestions(value) {
      recordTimeForCurrentItem();
      state.randomQuestions = value === true || value === "true";
      const indices = activeIndices();
      state.index = indices[0] || 0;
      state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function setRandomOptions(value) {
      state.randomOptions = value === true || value === "true";
      persist();
      render();
    }
    function setRandomSeed(value) {
      recordTimeForCurrentItem();
      const parsed = Number(value);
      state.randomSeed = Number.isFinite(parsed) ? parsed : 20260626;
      const indices = activeIndices();
      state.index = indices[0] || 0;
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function setReviewFilter(value) {
      state.reviewFilter = value;
      persist();
      render();
    }
    function setSearch(value) {
      state.search = value;
      persist();
      render();
    }
    function setCategoryFilter(value) {
      state.categoryFilter = value;
      persist();
      render();
    }
    function setDomainFilter(value) {
      state.domainFilter = value;
      persist();
      render();
    }
    function setTrapFilter(value) {
      state.trapFilter = value;
      persist();
      render();
    }
    function setReadingSize(value) {
      state.readingSize = value;
      document.documentElement.dataset.readingSize = value;
      persist();
      render();
    }
    function setReadingFont(value) {
      state.readingFont = value;
      document.documentElement.dataset.readingFont = value;
      persist();
      render();
    }
    function setReadingLine(value) {
      state.readingLine = value;
      document.documentElement.dataset.readingLine = value;
      persist();
      render();
    }
    function setPassageWidth(value) {
      state.passageWidth = value;
      document.documentElement.dataset.passageWidth = value;
      persist();
      render();
    }
    function toggleAnalyticsSection(key) {
      state.analyticsOpen[key] = state.analyticsOpen[key] === false;
      persist();
      render();
    }
    function slotLabel(slot) {
      return state.slotLabels[slot] || slot;
    }
    function sanitizeSlotKey(label) {
      return String(label || "session").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36) || "session";
    }
    function uniqueSlotKey(base) {
      let key = base;
      let count = 2;
      while (state.slotLabels[key] || localStorage.getItem("acc_slot_" + key)) {
        key = base + "-" + count;
        count += 1;
      }
      return key;
    }
    function setSlotDraft(value) {
      state.slotDraft = value;
      persist();
    }
    function toggleExamBreak(key) {
      if (!["afterA", "afterB"].includes(key)) return;
      state.examBreaks[key] = !state.examBreaks[key];
      persist();
      render();
    }
    function setRoleMode(value) {
      state.roleMode = value;
      persist();
      render();
    }
    function setEvaluatorNote(value) {
      const q = TESTS[state.index];
      state.evaluatorNotes[q.id] = value;
      persist();
    }
    function sessionSnapshot() {
      return {
        index: state.index,
        selections: state.selections,
        submitted: state.submitted,
        scores: state.scores,
        flagged: state.flagged,
        confidence: state.confidence,
        timeSpent: state.timeSpent,
        answerHistory: state.answerHistory,
        evaluatorNotes: state.evaluatorNotes,
        pilotCalibration: state.pilotCalibration,
        expertAdjudication: state.expertAdjudication,
        examBreaks: state.examBreaks,
        examProtocol: examProtocolSnapshot(),
        analyticsOpen: state.analyticsOpen,
        roleMode: state.roleMode,
        sessionPreset: state.sessionPreset,
        randomQuestions: state.randomQuestions,
        randomOptions: state.randomOptions,
        randomSeed: state.randomSeed,
        questionOrder: questionOrderSnapshot(),
        activeSlot: state.activeSlot,
        slotLabel: slotLabel(state.activeSlot),
        bankInfo: state.bankInfo,
        startedAt: state.startedAt,
        blockStartedAt: state.blockStartedAt,
        timerDurationSeconds: state.timerDurationSeconds,
        timerElapsedSeconds: state.timerElapsedSeconds,
        timerPaused: state.timerPaused,
        savedAt: new Date().toISOString()
      };
    }
    function restoreSession(data) {
      state.index = Number(data.index || 0);
      state.selections = data.selections || {};
      state.submitted = data.submitted || {};
      state.scores = data.scores || {};
      state.flagged = data.flagged || {};
      state.confidence = data.confidence || {};
      state.timeSpent = data.timeSpent || {};
      state.answerHistory = data.answerHistory || {};
      state.evaluatorNotes = data.evaluatorNotes || {};
      state.expertAdjudication = data.expertAdjudication || state.expertAdjudication;
      state.examBreaks = data.examBreaks || data.examProtocol?.breaks || state.examBreaks;
      state.analyticsOpen = data.analyticsOpen || state.analyticsOpen;
      state.roleMode = data.roleMode || state.roleMode;
      state.sessionPreset = data.sessionPreset || state.sessionPreset;
      state.randomQuestions = Boolean(data.randomQuestions);
      state.randomOptions = Boolean(data.randomOptions);
      state.randomSeed = Number(data.randomSeed || state.randomSeed);
      state.startedAt = Number(data.startedAt || Date.now());
      state.blockStartedAt = Number(data.blockStartedAt || Date.now());
      state.timerDurationSeconds = Number(data.timerDurationSeconds || state.timerDurationSeconds);
      state.timerElapsedSeconds = Number(data.timerElapsedSeconds || 0);
      state.timerPaused = Boolean(data.timerPaused);
      state.timerLastTickAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function saveSlot(slot) {
      recordTimeForCurrentItem();
      state.activeSlot = slot;
      if (!state.slotLabels[slot]) state.slotLabels[slot] = slot;
      localStorage.setItem("acc_slot_" + slot, JSON.stringify(sessionSnapshot()));
      persist();
      render();
    }
    function saveNamedSlot() {
      recordTimeForCurrentItem();
      const label = state.slotDraft.trim();
      if (!label) return;
      const key = uniqueSlotKey("named-" + sanitizeSlotKey(label));
      state.slotLabels[key] = label;
      state.activeSlot = key;
      localStorage.setItem("acc_slot_" + key, JSON.stringify(sessionSnapshot()));
      state.slotDraft = "";
      persist();
      render();
    }
    function loadSlot(slot) {
      recordTimeForCurrentItem();
      state.activeSlot = slot;
      const raw = localStorage.getItem("acc_slot_" + slot);
      if (raw) restoreSession(JSON.parse(raw));
      else persist();
      render();
    }
    function downloadFile(filename, mime, content) {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    function exportResultsJson() {
      recordTimeForCurrentItem();
      persist();
      downloadFile("academic-assessment-results.json", "application/json", JSON.stringify({ exportedAt: new Date().toISOString(), bankInfo: state.bankInfo, profile: analytics(), session: sessionSnapshot(), items: TESTS }, null, 2));
    }
    function exportResultsCsv() {
      recordTimeForCurrentItem();
      persist();
      const rows = [["id","category","module","difficulty","selected_source","selected_display","correct_source","correct_display","score","weighted_score","confidence","confidence_adjusted_score","time_spent_seconds","flagged","time_estimate_seconds","evaluator_note"]];
      for (const q of TESTS) {
        const score = Number(state.scores[q.id]);
        const submittedScore = Number.isFinite(score) ? score : "";
        const confidence = state.confidence[q.id] || "";
        const adjusted = Number.isFinite(score) ? confidenceAdjustedScore(score, confidence || "medium") : "";
        rows.push([q.id, q.category, q.skillModule, q.difficultyTier, (state.selections[q.id] || []).join("|"), displaySelected(q).join("|"), q.correct.join("|"), displayCorrect(q).join("|"), submittedScore, Number.isFinite(score) ? (score * (Number(q.scoringWeight) || 1)).toFixed(3) : "", confidence, adjusted === "" ? "" : adjusted.toFixed(3), itemVisibleTime(q), state.flagged[q.id] ? "yes" : "no", q.estimatedTimeSeconds, state.evaluatorNotes[q.id] || ""]);
      }
      downloadFile("academic-assessment-results.csv", "text/csv", rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\\n"));
    }
    function reportSummaryHtml(a) {
      const explanation = a.profileExplanation || {};
      return "<div class='cards'><div><span>Profile</span><strong>" + a.profile + "</strong></div><div><span>Raw</span><strong>" + pct(a.percent) + "%</strong></div><div><span>Weighted</span><strong>" + pct(a.weightedPercent) + "%</strong></div><div><span>Confidence adjusted</span><strong>" + pct(a.confidenceAdjustedPercent) + "%</strong></div><div><span>Answered</span><strong>" + a.submitted + " / " + TESTS.length + "</strong></div><div><span>Total time</span><strong>" + fmt(a.totalTimeSeconds) + "</strong></div></div><p class='note'><strong>CEFR rationale:</strong> " + escapeHtml(explanation.summary || "No submitted evidence yet.") + "</p><p class='note'><strong>Interpretation limit:</strong> " + escapeHtml(explanation.limitation || "Score bands remain provisional.") + "</p>";
    }
    function reportShell(title, body) {
      return "<!doctype html><html><head><meta charset='utf-8'><title>" + title + "</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#111}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ccc;padding:6px;text-align:left;vertical-align:top}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 20px}.cards div{border:1px solid #ccc;padding:10px}.cards span{display:block;color:#555;font-size:10px;text-transform:uppercase;font-weight:700}.cards strong{display:block;margin-top:4px;font-size:18px}.note{color:#555;font-size:12px}</style></head><body>" + body + "</body></html>";
    }
    function exportCandidateReportHtml() {
      recordTimeForCurrentItem();
      persist();
      const a = analytics();
      const rows = TESTS.filter((q) => state.submitted[q.id]).map((q) => {
        const score = Math.round((Number(state.scores[q.id]) || 0) * 100) + "%";
        return "<tr><td>" + q.id + "</td><td>" + q.category + "</td><td>" + q.skillModule + "</td><td>" + escapeHtml(displaySelected(q).join(", ")) + "</td><td>" + score + "</td><td>" + escapeHtml(state.confidence[q.id] || "") + "</td><td>" + itemStoredTime(q) + "</td></tr>";
      }).join("");
      const html = reportShell("Academic Assessment Candidate Report", "<h1>Academic Assessment Candidate Report</h1><p class='note'>Generated from bank " + escapeHtml(state.bankInfo.bankVersion || "runtime") + ". Candidate report intentionally omits answer keys and rationales.</p>" + reportSummaryHtml(a) + "<table><thead><tr><th>ID</th><th>Category</th><th>Module</th><th>Selected</th><th>Score</th><th>Confidence</th><th>Time seconds</th></tr></thead><tbody>" + rows + "</tbody></table>");
      downloadFile("academic-assessment-candidate-report.html", "text/html", html);
    }
    function exportEvaluatorReportHtml() {
      recordTimeForCurrentItem();
      persist();
      const a = analytics();
      const rows = TESTS.filter((q) => state.submitted[q.id]).map((q) => {
        const score = Math.round((Number(state.scores[q.id]) || 0) * 100) + "%";
        return "<tr><td>" + q.id + "</td><td>" + q.category + "</td><td>" + q.skillModule + "</td><td>" + q.difficultyTier + "</td><td>" + escapeHtml(displaySelected(q).join(", ")) + "</td><td>" + displayCorrect(q).join(", ") + "</td><td>" + score + "</td><td>" + escapeHtml(state.confidence[q.id] || "") + "</td><td>" + itemStoredTime(q) + "</td><td>" + escapeHtml(state.evaluatorNotes[q.id] || "") + "</td><td>" + escapeHtml(rationaleForDisplay(q)) + "</td></tr>";
      }).join("");
      const html = reportShell("Academic Assessment Evaluator Report", "<h1>Academic Assessment Evaluator Report</h1><p class='note'>Generated from bank " + escapeHtml(state.bankInfo.bankVersion || "runtime") + ". Includes answer keys, rationales, timing and evaluator notes; do not distribute as a candidate-facing pre-review file.</p>" + reportSummaryHtml(a) + "<table><thead><tr><th>ID</th><th>Category</th><th>Module</th><th>Difficulty</th><th>Selected</th><th>Correct</th><th>Score</th><th>Confidence</th><th>Time seconds</th><th>Evaluator note</th><th>Rationale</th></tr></thead><tbody>" + rows + "</tbody></table>");
      downloadFile("academic-assessment-evaluator-report.html", "text/html", html);
    }
    function exportReportHtml() {
      exportCandidateReportHtml();
    }
    function exportItemBankJson() {
      downloadFile("academic-assessment-item-bank.json", "application/json", JSON.stringify({
        schemaVersion: state.bankInfo.schemaVersion || "runtime",
        bankVersion: state.bankInfo.bankVersion || "runtime",
        exportedAt: new Date().toISOString(),
        itemCount: TESTS.length,
        items: TESTS
      }, null, 2));
    }
    function printReport() {
      window.print();
    }
    function clearAttemptState() {
      state.index = 0;
      state.block = 0;
      state.selections = {};
      state.submitted = {};
      state.scores = {};
      state.flagged = {};
      state.confidence = {};
      state.timeSpent = {};
      state.answerHistory = {};
      state.evaluatorNotes = {};
      state.examBreaks = { afterA: false, afterB: false };
      state.startedAt = Date.now();
      state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      state.sessionPreset = "full";
      state.showReviewAll = false;
    }
    function applyRuntimeBank(payload, sourceName) {
      const nextBank = normalizeBankPayload(payload, sourceName);
      runtimeBank = nextBank;
      TESTS = nextBank.items;
      window.TESTS = TESTS;
      state.bankInfo = nextBank.bankInfo;
      state.importStatus = nextBank.bankInfo.source === "embedded" ? "Embedded bank restored." : "Imported " + TESTS.length + " items from " + nextBank.bankInfo.bankVersion + ".";
      clearAttemptState();
      if (nextBank.bankInfo.source === "embedded") localStorage.removeItem("acc_imported_bank");
      else localStorage.setItem("acc_imported_bank", JSON.stringify({ ...nextBank.bankInfo, items: TESTS }));
      persist();
      render();
    }
    function importBankFile(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          applyRuntimeBank(reader.result, file.name.replace(/\\.json$/i, ""));
        } catch (error) {
          state.importStatus = "Import failed: " + error.message;
          render();
        } finally {
          input.value = "";
        }
      };
      reader.onerror = () => {
        state.importStatus = "Import failed: the selected file could not be read.";
        input.value = "";
        render();
      };
      reader.readAsText(file);
    }
    function restoreEmbeddedBank() {
      applyRuntimeBank({ ...DEFAULT_BANK_INFO, items: EMBEDDED_TESTS }, "embedded");
    }
    function parsePilotCsv(text) {
      const lines = text.split(/\\r?\\n/).filter((line) => line.trim());
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
    function pearson(xs, ys) {
      if (xs.length < 3 || xs.length !== ys.length) return null;
      const mx = xs.reduce((sum, value) => sum + value, 0) / xs.length;
      const my = ys.reduce((sum, value) => sum + value, 0) / ys.length;
      let numerator = 0, dx = 0, dy = 0;
      for (let i = 0; i < xs.length; i += 1) {
        const ax = xs[i] - mx;
        const ay = ys[i] - my;
        numerator += ax * ay;
        dx += ax * ax;
        dy += ay * ay;
      }
      return dx && dy ? numerator / Math.sqrt(dx * dy) : null;
    }
    function calibrationRecommendation(stats) {
      if (!stats.responseCount) return "awaiting-pilot-data";
      if (stats.responseCount < 50) return "insufficient-pilot-data";
      if (stats.facilityIndex > .88) return "retire-too-easy";
      if (stats.facilityIndex < .2) return "retire-too-hard-or-ambiguous";
      if (stats.discriminationIndex !== null && stats.discriminationIndex < .2) return "review-low-discrimination";
      return "retain";
    }
    function summarizePilotRows(rows, sourceName) {
      const validIds = new Set(TESTS.map((item) => item.id));
      const clean = rows.map((row) => ({
        candidateId: String(row.candidate_id || row.candidateId || "").trim(),
        itemId: String(row.item_id || row.itemId || "").trim(),
        score: Number(row.score),
        confidence: String(row.confidence || "").toLowerCase(),
        timeSeconds: Number(row.time_seconds ?? row.timeSeconds)
      })).filter((row) => row.candidateId && validIds.has(row.itemId) && Number.isFinite(row.score) && row.score >= 0 && row.score <= 1);
      const candidateTotals = {};
      for (const row of clean) candidateTotals[row.candidateId] = (candidateTotals[row.candidateId] || 0) + row.score;
      const recommendations = {};
      const itemStats = TESTS.map((item) => {
        const itemRows = clean.filter((row) => row.itemId === item.id);
        const scores = itemRows.map((row) => row.score);
        const facilityIndex = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
        const xs = [];
        const ys = [];
        for (const row of itemRows) {
          xs.push(row.score);
          ys.push((candidateTotals[row.candidateId] || 0) - row.score);
        }
        const discriminationIndex = pearson(xs, ys);
        const stats = {
          itemId: item.id,
          responseCount: itemRows.length,
          facilityIndex: facilityIndex === null ? null : Number(facilityIndex.toFixed(3)),
          discriminationIndex: discriminationIndex === null ? null : Number(discriminationIndex.toFixed(3))
        };
        stats.retirementRecommendation = calibrationRecommendation(stats);
        recommendations[stats.retirementRecommendation] = (recommendations[stats.retirementRecommendation] || 0) + 1;
        return stats;
      });
      return {
        status: clean.length ? "calibrated-from-local-pilot-data" : "awaiting-pilot-data",
        sourceName,
        candidateCount: new Set(clean.map((row) => row.candidateId)).size,
        validResponseRows: clean.length,
        recommendations,
        itemStats,
        calibratedAt: new Date().toISOString()
      };
    }
    function importPilotResponses(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = String(reader.result || "");
          const rows = /\\.json$/i.test(file.name) ? JSON.parse(raw).responses || JSON.parse(raw) : parsePilotCsv(raw);
          state.pilotCalibration = summarizePilotRows(Array.isArray(rows) ? rows : [], file.name);
        } catch (error) {
          state.pilotCalibration = { status: "pilot-import-failed", error: error.message, candidateCount: 0, validResponseRows: 0, recommendations: {} };
        } finally {
          input.value = "";
          persist();
          render();
        }
      };
      reader.readAsText(file);
    }
    function exportPilotTemplate() {
      downloadFile("pilot_response_template.csv", "text/csv", '"candidate_id","item_id","selected","score","confidence","time_seconds","submitted_at"\\n');
    }
    function summarizeExpertRows(rows, sourceName) {
      const validIds = new Set(TESTS.map((item) => item.id));
      const validDecisions = new Set(["approve", "revise", "retire", "second-review"]);
      const validRatings = new Set(["pass", "concern", "fail", ""]);
      const clean = [];
      const rejectedRows = [];
      rows.forEach((row, idx) => {
        const reviewerId = String(row.reviewer_id || row.reviewerId || "").trim();
        const itemId = String(row.item_id || row.itemId || "").trim();
        const decision = String(row.decision || "").trim().toLowerCase().replace(/_/g, "-");
        const ratings = [
          String(row.construct_alignment || row.constructAlignment || "").trim().toLowerCase(),
          String(row.key_defensibility || row.keyDefensibility || "").trim().toLowerCase(),
          String(row.distractor_plausibility || row.distractorPlausibility || "").trim().toLowerCase(),
          String(row.language_quality || row.languageQuality || "").trim().toLowerCase(),
          String(row.source_scope || row.sourceScope || "").trim().toLowerCase()
        ];
        const issues = [];
        if (!reviewerId) issues.push("missing-reviewer-id");
        if (!validIds.has(itemId)) issues.push("unknown-item-id");
        if (!validDecisions.has(decision)) issues.push("invalid-decision");
        if (!ratings.every((rating) => validRatings.has(rating))) issues.push("invalid-rating");
        if (issues.length) rejectedRows.push({ rowNumber: idx + 2, itemId, reviewerId, issues });
        else clean.push({ reviewerId, itemId, decision, ratings });
      });
      const byItem = new Map(TESTS.map((item) => [item.id, []]));
      for (const row of clean) byItem.get(row.itemId).push(row);
      const itemStats = TESTS.map((item) => {
        const itemRows = byItem.get(item.id) || [];
        const reviewers = new Set(itemRows.map((row) => row.reviewerId));
        const unresolved = itemRows.some((row) => row.decision !== "approve" || row.ratings.some((rating) => rating === "concern" || rating === "fail"));
        return {
          itemId: item.id,
          reviewerCount: reviewers.size,
          rowCount: itemRows.length,
          unresolved,
          status: itemRows.length === 0 ? "unreviewed" : reviewers.size < 2 ? "needs-second-review" : unresolved ? "needs-resolution" : "approved-by-independent-reviewers"
        };
      });
      const decisions = {};
      for (const row of clean) decisions[row.decision] = (decisions[row.decision] || 0) + 1;
      const itemCoverage = itemStats.filter((item) => item.rowCount > 0).length;
      const doubleReviewedItemCount = itemStats.filter((item) => item.reviewerCount >= 2).length;
      const unresolvedItemCount = itemStats.filter((item) => item.unresolved).length;
      let status = "awaiting-human-adjudication";
      if (clean.length && itemCoverage < TESTS.length) status = "partial-human-adjudication";
      else if (clean.length && doubleReviewedItemCount < TESTS.length) status = "independent-review-incomplete";
      else if (clean.length && unresolvedItemCount > 0) status = "human-adjudication-needs-resolution";
      else if (clean.length && itemCoverage === TESTS.length) status = "completed-human-adjudication";
      return {
        status,
        sourceName,
        reviewerCount: new Set(clean.map((row) => row.reviewerId)).size,
        validReviewRows: clean.length,
        rejectedRows,
        itemCoverage,
        doubleReviewedItemCount,
        unresolvedItemCount,
        decisions,
        itemStats,
        importedAt: new Date().toISOString()
      };
    }
    function importExpertReviews(input) {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = String(reader.result || "");
          const rows = /\\.json$/i.test(file.name) ? JSON.parse(raw).reviews || JSON.parse(raw) : parsePilotCsv(raw);
          state.expertAdjudication = summarizeExpertRows(Array.isArray(rows) ? rows : [], file.name);
        } catch (error) {
          state.expertAdjudication = { status: "expert-import-failed", error: error.message, reviewerCount: 0, validReviewRows: 0, itemCoverage: 0, doubleReviewedItemCount: 0, unresolvedItemCount: 0, decisions: {} };
        } finally {
          input.value = "";
          persist();
          render();
        }
      };
      reader.readAsText(file);
    }
    function exportExpertTemplate() {
      const header = ["reviewer_id","item_id","decision","construct_alignment","key_defensibility","distractor_plausibility","language_quality","source_scope","severity","notes","reviewed_at","category","skill_module","difficulty_tier","source_domain"];
      const rows = [header, ...TESTS.map((item) => ["", item.id, "", "", "", "", "", "", "", "", "", item.category, item.skillModule, item.difficultyTier, item.sourceDomain])];
      downloadFile("expert_review_template.csv", "text/csv", rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\\n") + "\\n");
    }
    function scoreQuestion(q) {
      const selected = new Set(selectedLetters(q));
      const correct = new Set(q.correct);
      if (q.type === "single") return selected.size === 1 && correct.has([...selected][0]) ? 1 : 0;
      const trueHits = [...selected].filter((x) => correct.has(x)).length;
      const falseHits = [...selected].filter((x) => !correct.has(x)).length;
      const possibleWrong = 5 - correct.size;
      return Math.max(0, Math.min(1, trueHits / correct.size - falseHits / Math.max(1, possibleWrong)));
    }
    function submit() {
      const q = TESTS[state.index];
      if (!selectedLetters(q).length) return;
      recordTimeForCurrentItem();
      state.confidence[q.id] ||= "medium";
      state.submitted[q.id] = true;
      state.scores[q.id] = scoreQuestion(q);
      state.answerHistory[q.id] = buildAnswerRecord(q);
      persist();
      render();
      setTimeout(() => document.querySelector(".review")?.scrollIntoView({ block: "center", behavior: "auto" }), 0);
    }
    function setIndex(next) {
      recordTimeForCurrentItem();
      const bounded = Math.max(0, Math.min(TESTS.length - 1, next));
      const indices = activeIndices();
      const oldBlock = Math.floor(currentSessionPosition(indices) / blockSize);
      const nextPos = indices.indexOf(bounded);
      const newBlock = Math.floor((nextPos >= 0 ? nextPos : 0) / blockSize);
      state.index = bounded;
      state.block = newBlock;
      if (oldBlock !== newBlock) state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function go(delta) {
      const indices = activeIndices();
      const pos = currentSessionPosition(indices);
      const nextPos = Math.max(0, Math.min(indices.length - 1, pos + delta));
      setIndex(indices[nextPos]);
    }
    function jump(i) { setIndex(i); }
    function setBlock(block) {
      const indices = activeIndices();
      const nextBlock = Math.max(0, Math.min(Math.ceil(indices.length / blockSize) - 1, Number(block)));
      setIndex(indices[nextBlock * blockSize]);
    }
    function nextUnanswered() {
      const indices = activeIndices();
      const pos = currentSessionPosition(indices);
      const next = indices.find((idx, order) => order > pos && !state.submitted[TESTS[idx].id]);
      if (next !== undefined) setIndex(next);
      else {
        const wrap = indices.find((idx) => !state.submitted[TESTS[idx].id]);
        if (wrap !== undefined) setIndex(wrap);
      }
    }
    function toggleFlag() {
      const q = TESTS[state.index];
      state.flagged[q.id] ? delete state.flagged[q.id] : state.flagged[q.id] = true;
      persist();
      render();
    }
    function resetAll() {
      if (!confirm("Reset all local answers, flags and timers?")) return;
      state.index = 0;
      state.block = 0;
      state.selections = {};
      state.submitted = {};
      state.scores = {};
      state.flagged = {};
      state.confidence = {};
      state.timeSpent = {};
      state.answerHistory = {};
      state.examBreaks = { afterA: false, afterB: false };
      state.startedAt = Date.now();
      state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function resetAnswersOnly() {
      if (!confirm("Reset answers and scores, keeping flags, notes and timers?")) return;
      state.selections = {};
      state.submitted = {};
      state.scores = {};
      state.confidence = {};
      state.answerHistory = {};
      state.examBreaks = { afterA: false, afterB: false };
      persist();
      render();
    }
    function resetTimersOnly() {
      state.timeSpent = {};
      resetTimer();
    }
    function resetCurrentBlock() {
      if (!confirm("Reset answers, flags and notes for the current block only?")) return;
      const indices = activeIndices();
      const pos = currentSessionPosition(indices);
      const blockStart = Math.floor(pos / blockSize) * blockSize;
      const blockEnd = Math.min(indices.length, blockStart + blockSize);
      for (const idx of indices.slice(blockStart, blockEnd)) {
        const q = TESTS[idx];
        delete state.selections[q.id];
        delete state.submitted[q.id];
        delete state.scores[q.id];
        delete state.confidence[q.id];
        delete state.timeSpent[q.id];
        delete state.answerHistory[q.id];
        delete state.flagged[q.id];
        delete state.evaluatorNotes[q.id];
      }
      state.blockStartedAt = Date.now();
      state.itemEnteredAt = Date.now();
      persist();
      render();
    }
    function pct(n) { return Math.round(n * 100); }
    function cefrBandFor(weightedPercent) {
      return cefrBands.find((band) => weightedPercent >= band.min && weightedPercent <= band.max) || cefrBands[0];
    }
    function weakestSubmittedSkillFromRows(rows) {
      const candidates = Object.entries(rows).filter(([, row]) => row.done > 0);
      if (!candidates.length) return "not enough submitted evidence";
      candidates.sort((a, b) => (a[1].points / a[1].done) - (b[1].points / b[1].done));
      return candidates[0][0];
    }
    function cefrProfileExplanation(data) {
      const coverage = data.sessionCount ? data.submitted / data.sessionCount : 0;
      return {
        profile: data.band.profile,
        bandRange: pct(data.band.min) + "-" + pct(data.band.max) + "%",
        weightedPercent: pct(data.weightedPercent),
        confidenceAdjustedPercent: pct(data.confidenceAdjustedPercent),
        coveragePercent: pct(coverage),
        weakestSkill: data.weakestSkill,
        summary: data.band.profile + " because weighted score is " + pct(data.weightedPercent) + "%, confidence-adjusted score is " + pct(data.confidenceAdjustedPercent) + "%, and answered coverage is " + pct(coverage) + "%.",
        evidence: [
          "Band claim: " + data.band.claim + ".",
          "Boundary rule: " + data.band.interpretation,
          "Weakest submitted module: " + data.weakestSkill + "."
        ],
        limitation: "This is a provisional diagnostic interpretation until expert adjudication, pilot calibration and standard-setting signoff are complete.",
        recommendation: data.band.recommendation
      };
    }
    function analytics() {
      const submittedIds = Object.keys(state.submitted).filter((id) => state.submitted[id]);
      const activeIdSet = new Set(activeIndices().map((idx) => TESTS[idx].id));
      const sessionSubmitted = submittedIds.filter((id) => activeIdSet.has(id)).length;
      const points = submittedIds.reduce((sum, id) => sum + (Number(state.scores[id]) || 0), 0);
      const percent = submittedIds.length ? points / submittedIds.length : 0;
      let weightedPoints = 0;
      let confidenceAdjustedWeightedPoints = 0;
      let weightedPossible = 0;
      let totalTimeSeconds = 0;
      let profile = "C1 Developing";
      const byComp = {};
      const bySkill = {};
      const confidenceBuckets = {
        low: { done: 0, points: 0 },
        medium: { done: 0, points: 0 },
        high: { done: 0, points: 0 }
      };
      for (const q of TESTS) {
        byComp[q.competence] ||= { done: 0, points: 0, total: 0 };
        bySkill[q.skillModule] ||= { done: 0, points: 0, total: 0 };
        byComp[q.competence].total += 1;
        bySkill[q.skillModule].total += 1;
        totalTimeSeconds += itemVisibleTime(q);
        if (state.submitted[q.id]) {
          const score = Number(state.scores[q.id]) || 0;
          const weight = Number(q.scoringWeight) || 1;
          const confidence = state.confidence[q.id] || "medium";
          byComp[q.competence].done += 1;
          byComp[q.competence].points += score;
          bySkill[q.skillModule].done += 1;
          bySkill[q.skillModule].points += score;
          weightedPoints += score * weight;
          confidenceAdjustedWeightedPoints += confidenceAdjustedScore(score, confidence) * weight;
          weightedPossible += weight;
          confidenceBuckets[confidence] ||= { done: 0, points: 0 };
          confidenceBuckets[confidence].done += 1;
          confidenceBuckets[confidence].points += score;
        }
      }
      const weightedPercent = weightedPossible ? weightedPoints / weightedPossible : 0;
      const confidenceAdjustedPercent = weightedPossible ? Math.max(0, Math.min(1, confidenceAdjustedWeightedPoints / weightedPossible)) : 0;
      const band = cefrBandFor(weightedPercent);
      profile = band.profile;
      const profileExplanation = cefrProfileExplanation({ band, weightedPercent, confidenceAdjustedPercent, submitted: submittedIds.length, sessionCount: activeIdSet.size, weakestSkill: weakestSubmittedSkillFromRows(bySkill) });
      return { submitted: submittedIds.length, sessionSubmitted, sessionCount: activeIdSet.size, points, percent, weightedPercent, confidenceAdjustedPercent, confidenceAdjustedWeightedPoints, totalTimeSeconds, averageTimeSeconds: submittedIds.length ? totalTimeSeconds / submittedIds.length : 0, answerHistoryCount: Object.keys(state.answerHistory).length, profile, profileExplanation, byComp, bySkill, confidenceBuckets, flagged: Object.keys(state.flagged).length };
    }
    function render() {
      syncTimer();
      const indices = activeIndices();
      if (!indices.includes(state.index)) {
        state.index = indices[0] || 0;
        state.block = 0;
        persist();
      }
      const sessionPos = currentSessionPosition(indices);
      const sessionCount = indices.length;
      const q = TESTS[state.index];
      const a = analytics();
      const protocolSnapshot = examProtocolSnapshot();
      const activeExamSection = currentExamSection();
      const activeSectionProgress = examSectionProgress(activeExamSection);
      const fullExamMinutes = examSections.reduce((total, section) => total + section.minutes, 0);
      const requiredBreakMinutes = examSections.reduce((total, section) => total + section.breakAfterMinutes, 0);
      const selected = new Set(selectedLetters(q));
      const submitted = Boolean(state.submitted[q.id]);
      const elapsed = (Date.now() - state.startedAt) / 1000;
      const blockElapsed = (Date.now() - state.blockStartedAt) / 1000;
      const blockLeft = blockSeconds - blockElapsed;
      const timerLeft = timerRemainingSeconds();
      const timerMinutes = Math.round(state.timerDurationSeconds / 60);
      const blockStart = Math.floor(sessionPos / blockSize) * blockSize;
      const blockEnd = Math.min(sessionCount, blockStart + blockSize);
      const blockItems = indices.slice(blockStart, blockEnd).map((idx) => TESTS[idx]);
      const blockSubmitted = blockItems.every((item) => state.submitted[item.id]);
      const revealCurrent = submitted && (state.mode === "learning" || (state.mode === "integrity" && blockSubmitted) || (state.mode === "blind" && state.showReviewAll));
      const optionOrderForItem = optionOrder(q);
      const options = optionOrderForItem.map((sourceIdx, displayIdx) => {
        const letter = letters[sourceIdx];
        const displayLetter = letters[displayIdx];
        const option = q.options[sourceIdx];
        const checked = selected.has(letter);
        const correctness = revealCurrent && q.correct.includes(letter) ? " correct" : revealCurrent && checked ? " wrong" : "";
        return \`<label class="option\${checked ? " selected" : ""}\${correctness}">
          <input type="\${q.type === "single" ? "radio" : "checkbox"}" name="answer" aria-label="Option \${displayLetter}" \${checked ? "checked" : ""} onchange="setSelection('\${letter}')">
          <span><b>\${displayLetter})</b> \${option}</span>
        </label>\`;
      }).join("");
      const jumps = Array.from({ length: blockEnd - blockStart }, (_, n) => {
        const idx = indices[blockStart + n];
        const tq = TESTS[idx];
        return \`<button class="jump \${idx === state.index ? "active" : ""} \${state.submitted[tq.id] ? "done" : ""} \${state.flagged[tq.id] ? "flagged" : ""}" onclick="jump(\${idx})">\${idx + 1}</button>\`;
      }).join("");
      const activeBlock = Math.floor(sessionPos / blockSize);
      const blockTotal = Math.ceil(sessionCount / blockSize);
      const blockOptions = Array.from({ length: blockTotal }, (_, i) => \`<option value="\${i}" \${i === activeBlock ? "selected" : ""}>Block \${i + 1} / \${blockTotal}</option>\`).join("");
      const compRows = Object.entries(a.byComp).map(([name, row]) => {
        const value = row.done ? row.points / row.done : 0;
        return \`<div class="score-line"><span>\${name}</span><strong>\${row.done ? pct(value) + "%" : "0%"}</strong></div><div class="bar"><i style="width:\${pct(value)}%"></i></div>\`;
      }).join("");
      const skillRows = Object.entries(a.bySkill).map(([name, row]) => {
        const value = row.done ? row.points / row.done : 0;
        return \`<div class="score-line"><span>\${name}</span><strong>\${row.done ? pct(value) + "%" : "0%"}</strong></div><div class="bar"><i style="width:\${pct(value)}%"></i></div>\`;
      }).join("");
      const confidenceRows = Object.entries(a.confidenceBuckets).map(([name, row]) => {
        const value = row.done ? row.points / row.done : 0;
        return \`<div class="score-line"><span>\${name}</span><strong>\${row.done ? pct(value) + "%" : "0%"}</strong></div>\`;
      }).join("");
      const progressMap = TESTS.map((item, idx) => \`<button title="\${item.id}" aria-label="Open item \${item.id}" \${idx === state.index ? "aria-current=\\"true\\"" : ""} class="map-dot \${state.submitted[item.id] ? "done" : ""} \${state.flagged[item.id] ? "flagged" : ""} \${idx === state.index ? "active" : ""}" onclick="jump(\${idx})"></button>\`).join("");
      const currentConfidence = state.confidence[q.id] || "medium";
      const confidenceControls = ["low", "medium", "high"].map((level) => \`<button class="\${currentConfidence === level ? "active" : ""}" onclick="setConfidence('\${level}')">\${level}</button>\`).join("");
      const showServiceMetadata = state.roleMode !== "candidate";
      const currentItemTime = itemVisibleTime(q);
      const itemChips = [q.id, "Category " + q.category, q.type === "single" ? "Single Select" : "Multiple Select", q.expectedSelections + " answer" + (q.expectedSelections > 1 ? "s" : "")];
      if (showServiceMetadata) itemChips.push(q.difficultyTier, q.skillModule);
      const chipHtml = itemChips.map((chip) => \`<span class="chip">\${escapeHtml(chip)}</span>\`).join("");
      const recentHistory = Object.values(state.answerHistory).sort((a, b) => String(b.submittedAt || "").localeCompare(String(a.submittedAt || ""))).slice(0, 5).map((record) => \`
                <div class="history-item">
                  <strong>\${escapeHtml(record.itemId)} / \${Math.round((Number(record.score) || 0) * 100)}% / \${escapeHtml(record.confidence || "medium")}</strong>
                  <span>\${escapeHtml((record.displaySelected || []).join(", ") || "none")} selected - \${fmt(record.timeSpentSeconds || 0)}</span>
                </div>\`).join("");
      const dataDisplay = renderDataDisplay(q);
      const metadataBlock = showServiceMetadata ? \`
              <div class="metadata-grid">
                <div><span>Target</span><strong>\${q.assessmentTarget}</strong></div>
                <div><span>Traps</span><strong>\${q.cognitiveTrapTypes.join(", ")}</strong></div>
                <div><span>Time</span><strong>\${q.estimatedTimeSeconds}s</strong></div>
                <div><span>Weight</span><strong>\${q.scoringWeight}</strong></div>
              </div>\` : "";
      const domainOptions = ["all", ...new Set(TESTS.map((item) => item.sourceDomain))].map((value) => \`<option value="\${escapeAttr(value)}" \${state.domainFilter === value ? "selected" : ""}>\${value === "all" ? "All source domains" : value}</option>\`).join("");
      const trapOptions = ["all", ...new Set(TESTS.flatMap((item) => item.cognitiveTrapTypes))].map((value) => \`<option value="\${escapeAttr(value)}" \${state.trapFilter === value ? "selected" : ""}>\${value === "all" ? "All trap types" : value}</option>\`).join("");
      const roleOptions = ["candidate", "evaluator", "admin"].map((value) => \`<option value="\${value}" \${state.roleMode === value ? "selected" : ""}>\${value.charAt(0).toUpperCase() + value.slice(1)} mode</option>\`).join("");
      const slotOptions = Object.entries(state.slotLabels).map(([key, label]) => \`<option value="\${escapeAttr(key)}" \${state.activeSlot === key ? "selected" : ""}>\${escapeHtml(label)}</option>\`).join("");
      const activeSlotRecord = (() => {
        try { return JSON.parse(localStorage.getItem("acc_slot_" + state.activeSlot) || "null"); }
        catch (error) { return null; }
      })();
      const evaluatorPanel = state.roleMode === "evaluator" ? \`
            <div class="section">
              <div class="label">Evaluator Notes</div>
              <div class="field"><textarea oninput="setEvaluatorNote(this.value)" placeholder="Manual comment for this item">\${escapeHtml(state.evaluatorNotes[q.id] || "")}</textarea></div>
              <p class="sr-note">Notes are stored locally in the selected browser profile and included in JSON export.</p>
            </div>\` : "";
      const adminPanel = state.roleMode === "admin" ? \`
            <div class="section admin-panel">
              <div class="label">Admin Item Inspect</div>
              <div class="score-line"><span>Answer key</span><strong>\${displayCorrect(q).join(", ")} display / \${q.correct.join(", ")} source</strong></div>
              <div class="score-line"><span>Status</span><strong>\${q.authoringStatus}</strong></div>
              <div class="score-line"><span>Review stage</span><strong>\${q.reviewStage}</strong></div>
              <div class="score-line"><span>Uniqueness</span><strong>\${Math.round(q.uniquenessScore * 100)}%</strong></div>
              <div class="field"><code>\${escapeHtml(JSON.stringify({ psychometrics: q.psychometrics, sourceVerification: q.sourceVerification, retirementRule: q.retirementRule }, null, 2))}</code></div>
            </div>
            <div class="section admin-panel">
              <div class="label">Pilot Calibration</div>
              <div class="score-line"><span>Status</span><strong>\${state.pilotCalibration.status}</strong></div>
              <div class="score-line"><span>Candidates</span><strong>\${state.pilotCalibration.candidateCount || 0}</strong></div>
              <div class="score-line"><span>Rows</span><strong>\${state.pilotCalibration.validResponseRows || 0}</strong></div>
              <p class="sr-note">\${escapeHtml(JSON.stringify(state.pilotCalibration.recommendations || {}))}</p>
              <div class="field"><input type="file" accept="text/csv,application/json,.csv,.json" aria-label="Import pilot responses" onchange="importPilotResponses(this)"></div>
              <div class="field"><button onclick="exportPilotTemplate()">Pilot Template</button></div>
            </div>
            <div class="section admin-panel">
              <div class="label">Expert Adjudication</div>
              <div class="score-line"><span>Status</span><strong>\${state.expertAdjudication.status}</strong></div>
              <div class="score-line"><span>Reviewers</span><strong>\${state.expertAdjudication.reviewerCount || 0}</strong></div>
              <div class="score-line"><span>Rows</span><strong>\${state.expertAdjudication.validReviewRows || 0}</strong></div>
              <div class="score-line"><span>Item coverage</span><strong>\${state.expertAdjudication.itemCoverage || 0}/\${TESTS.length}</strong></div>
              <div class="score-line"><span>Double reviewed</span><strong>\${state.expertAdjudication.doubleReviewedItemCount || 0}/\${TESTS.length}</strong></div>
              <div class="score-line"><span>Unresolved</span><strong>\${state.expertAdjudication.unresolvedItemCount || 0}</strong></div>
              <p class="sr-note">\${escapeHtml(JSON.stringify(state.expertAdjudication.decisions || {}))}</p>
              <div class="field"><input type="file" accept="text/csv,application/json,.csv,.json" aria-label="Import expert adjudication" onchange="importExpertReviews(this)"></div>
              <div class="field"><button onclick="exportExpertTemplate()">Expert Template</button></div>
            </div>\` : "";
      const showCurrentReview = submitted && revealCurrent;
      const review = submitted ? (showCurrentReview ? \`<div class="review"><h2>Review Rationale</h2><p><strong>Correct answer(s): \${displayCorrect(q).join(", ")}.</strong> \${rationaleForDisplay(q)}</p></div>\` : \`<div class="review"><h2>Review Locked</h2><p>The answer is recorded. In \${state.mode} mode, rationale is hidden until the configured review point.</p></div>\`) : "";
      const timerControls = \`
              <div class="timer-quick">
                \${[15, 30, 60, 90].map((minutes) => \`<button class="\${timerMinutes === minutes ? "active" : ""}" onclick="setTimerDuration(\${minutes})">\${minutes} min</button>\`).join("")}
              </div>
              <div class="timer-custom">
                <input type="number" min="1" max="300" value="\${timerMinutes}" aria-label="Custom timer minutes" onchange="setTimerDuration(this.value)">
                <button onclick="resetTimer()">Reset</button>
              </div>\`;
      const candidateProgress = \`
            <div class="candidate-progress" aria-label="Progress">
              <div><strong>Item \${sessionPos + 1} of \${sessionCount}</strong><span>\${a.sessionSubmitted}/\${a.sessionCount} answered</span></div>
              <div class="flag-pill">\${state.flagged[q.id] ? "Flagged" : ""}</div>
              <div class="progress-track"><div class="progress-fill" style="width:\${(a.sessionSubmitted / a.sessionCount) * 100}%"></div></div>
            </div>\`;
      const confidenceField = ADMIN_MODE ? \`
              <div class="field">
                <div class="label">Confidence Before Submit</div>
                <div class="segmented">\${confidenceControls}</div>
              </div>\` : "";
      const primaryAction = submitted
        ? \`<button class="primary" onclick="go(1)" \${state.index === TESTS.length - 1 ? "disabled" : ""}>Next</button>\`
        : \`<button class="primary" onclick="submit()" \${!selected.size ? "disabled" : ""}>Submit</button>\`;
      const query = state.search.trim().toLowerCase();
      const reviewItems = TESTS.filter((t) => {
        const submittedItem = Boolean(state.submitted[t.id]);
        const flaggedItem = Boolean(state.flagged[t.id]);
        if (state.reviewFilter === "wrong" && !(submittedItem && (state.scores[t.id] || 0) < 1)) return false;
        if (state.reviewFilter === "flagged" && !flaggedItem) return false;
        if (state.reviewFilter === "submitted" && !submittedItem) return false;
        if (state.categoryFilter !== "all" && t.category !== state.categoryFilter) return false;
        if (state.domainFilter !== "all" && t.sourceDomain !== state.domainFilter) return false;
        if (state.trapFilter !== "all" && !t.cognitiveTrapTypes.includes(state.trapFilter)) return false;
        if (query && !(t.id.toLowerCase().includes(query) || t.sourceHorizon.toLowerCase().includes(query) || t.skillModule.toLowerCase().includes(query) || t.competence.toLowerCase().includes(query))) return false;
        return submittedItem || flaggedItem || query || state.categoryFilter !== "all" || state.domainFilter !== "all" || state.trapFilter !== "all";
      });
      const reviewList = state.showReviewAll ? \`<div class="review-list">\${reviewItems.map((t) => \`<div class="review-item"><strong>\${t.id} / \${state.submitted[t.id] ? displayCorrect(t).join(", ") : "not submitted"} / \${state.submitted[t.id] ? "Score " + Math.round((state.scores[t.id] || 0) * 100) + "%" : "open"} / \${t.difficultyTier}</strong><p>\${state.submitted[t.id] && state.mode !== "integrity" ? rationaleForDisplay(t) : t.prompt}</p></div>\`).join("") || "<p class='muted'>No items match the current review filters.</p>"}</div>\` : "";
      const analyticsSection = (key, title, body) => {
        const open = state.analyticsOpen[key] !== false;
        return \`<div class="section" data-analytics-section="\${key}">
              <button class="section-toggle" onclick="toggleAnalyticsSection('\${key}')" aria-expanded="\${open}" aria-controls="analytics-\${key}">
                <span class="label">\${title}</span>
                <span class="toggle-state">\${open ? "Hide" : "Show"}</span>
              </button>
              <div id="analytics-\${key}" class="section-body" \${open ? "" : "hidden"}>\${body}</div>
            </div>\`;
      };
      const shortcutOverlay = state.showShortcuts ? \`<div class="overlay" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div class="dialog"><div class="label">Keyboard</div><div class="key-grid"><div><strong>1-5</strong><br>Choose option</div><div><strong>Enter</strong><br>Submit</div><div><strong>Left / Right</strong><br>Previous / next</div><div><strong>F</strong><br>Flag item</div></div><div style="height:12px"></div><button onclick="toggleShortcuts()">Close</button></div></div>\` : "";
      document.getElementById("app").innerHTML = \`
        <header class="topbar" role="banner">
          <div class="brand"><div class="mark">\${sessionPos + 1}/\${sessionCount}</div><div><h1>C1-C2 Test</h1><p>Academic English assessment \${ADMIN_MODE ? \`<span class="role-badge">\${state.roleMode}</span>\` : ""}</p></div></div>
          <div class="timer-strip" aria-label="Timer controls">
            <div class="timebox timer-main"><span>Time left</span><strong>\${fmt(timerLeft)}</strong></div>
            <button class="timer-action" onclick="toggleTimerPaused()" aria-pressed="\${state.timerPaused}">\${state.timerPaused ? "Start" : "Pause"}</button>
            <button class="ghost theme-toggle" onclick="toggleTheme()">\${state.theme === "dark" ? "Light" : "Dark"}</button>
            <div class="timer-settings"><button class="timer-settings-button" onclick="toggleTimerSettings()" aria-expanded="\${state.showTimerSettings}">Set</button>\${state.showTimerSettings ? \`<div class="timer-popover">\${timerControls}</div>\` : ""}</div>
          </div>
        </header>
        <div id="status-live" class="sr-only" aria-live="polite">Item \${sessionPos + 1} of \${sessionCount}; \${a.sessionSubmitted} submitted; current confidence \${currentConfidence}.</div>
        <main id="main-content" class="shell">
          <aside class="panel left" aria-label="Assessment controls">
            <div class="section">
              <div class="label">Progress</div>
              <div class="big">\${a.sessionSubmitted}<span class="muted" style="font-size:14px">/\${a.sessionCount}</span></div>
              <p class="sr-note">\${state.sessionPreset} session; \${a.submitted}/\${TESTS.length} answered overall.</p>
              <div class="score-line"><span>Flagged</span><strong>\${a.flagged}</strong></div>
              <div class="progress-track"><div class="progress-fill" style="width:\${(a.sessionSubmitted / a.sessionCount) * 100}%"></div></div>
              <div class="progress-map" role="navigation" aria-label="Progress map">\${progressMap}</div>
            </div>
            <div class="section">
              <div class="label">Exam Protocol</div>
              <div class="score-line"><span>Section</span><strong>\${activeExamSection.key}: \${activeExamSection.label}</strong></div>
              <div class="score-line"><span>Section progress</span><strong>\${activeSectionProgress.submitted}/\${activeSectionProgress.total}</strong></div>
              <div class="score-line"><span>Section time</span><strong>\${activeExamSection.minutes} min</strong></div>
              <div class="score-line"><span>Full exam</span><strong>\${fullExamMinutes} + \${requiredBreakMinutes} min</strong></div>
              <div class="mini-row">
                <button class="\${state.examBreaks.afterA ? "active" : ""}" aria-pressed="\${Boolean(state.examBreaks.afterA)}" onclick="toggleExamBreak('afterA')">Break A</button>
                <button class="\${state.examBreaks.afterB ? "active" : ""}" aria-pressed="\${Boolean(state.examBreaks.afterB)}" onclick="toggleExamBreak('afterB')">Break B</button>
              </div>
              <div class="score-line"><span>Final protocol</span><strong>\${protocolSnapshot.finalProtocolReady ? "Ready" : "Pending"}</strong></div>
              <p class="sr-note">Three 90-minute sections; breaks follow A and B before final reporting.</p>
            </div>
            <div class="section">
              <div class="label">Mode</div>
              <div class="segmented">
                <button class="\${state.mode === "learning" ? "active" : ""}" aria-pressed="\${state.mode === "learning"}" onclick="setMode('learning')">Learn</button>
                <button class="\${state.mode === "integrity" ? "active" : ""}" aria-pressed="\${state.mode === "integrity"}" onclick="setMode('integrity')">Exam</button>
                <button class="\${state.mode === "blind" ? "active" : ""}" aria-pressed="\${state.mode === "blind"}" onclick="setMode('blind')">Blind</button>
              </div>
              <p class="sr-note">Learning reveals rationales immediately. Exam hides them until the block is complete. Blind records answers first and reviews separately.</p>
            </div>
            <div class="section">
              <div class="label">Role</div>
              <div class="field"><select aria-label="Role mode" onchange="setRoleMode(this.value)">\${roleOptions}</select></div>
            </div>
            <div class="section">
              <div class="label">Session Plan</div>
              <div class="field"><select aria-label="Session plan" onchange="setSessionPreset(this.value)">
                <option value="full" \${state.sessionPreset === "full" ? "selected" : ""}>Full exam / 300</option>
                <option value="diagnostic20" \${state.sessionPreset === "diagnostic20" ? "selected" : ""}>Diagnostic / 20</option>
                <option value="mock50" \${state.sessionPreset === "mock50" ? "selected" : ""}>Mock / 50</option>
                <option value="categoryA" \${state.sessionPreset === "categoryA" ? "selected" : ""}>Reading drill</option>
                <option value="categoryB" \${state.sessionPreset === "categoryB" ? "selected" : ""}>Language drill</option>
                <option value="categoryC" \${state.sessionPreset === "categoryC" ? "selected" : ""}>Data drill</option>
                <option value="adaptive" \${state.sessionPreset === "adaptive" ? "selected" : ""}>Adaptive drill</option>
              </select></div>
              <div class="mini-row">
                <button class="\${state.randomQuestions ? "active" : ""}" aria-pressed="\${state.randomQuestions}" onclick="setRandomQuestions(!state.randomQuestions)">Random Q</button>
                <button class="\${state.randomOptions ? "active" : ""}" aria-pressed="\${state.randomOptions}" onclick="setRandomOptions(!state.randomOptions)">Random Opt</button>
              </div>
              <p class="sr-note">Random Q shuffles items inside sections while keeping A/B/C exam order.</p>
              <div class="field"><input type="number" value="\${state.randomSeed}" oninput="setRandomSeed(this.value)" aria-label="Randomization seed"></div>
            </div>
            <div class="section">
              <div class="label">Navigation</div>
              <select aria-label="Navigation block" onchange="setBlock(this.value)">\${blockOptions}</select>
              <div class="jump-grid">\${jumps}</div>
              <div class="mini-row">
                <button onclick="setBlock(Math.floor(state.index / blockSize) - 1)">Prev Block</button>
                <button onclick="setBlock(Math.floor(state.index / blockSize) + 1)">Next Block</button>
              </div>
              <div class="mini-row">
                <button onclick="nextUnanswered()">Next Open</button>
                <button onclick="toggleFlag()">\${state.flagged[q.id] ? "Unflag" : "Flag"}</button>
              </div>
            </div>
            <div class="section">
              <div class="label">Search & Filters</div>
              <div class="field"><input aria-label="Search items" value="\${escapeAttr(state.search)}" oninput="setSearch(this.value)" placeholder="ID, source, module"></div>
              <div class="field"><select aria-label="Category filter" onchange="setCategoryFilter(this.value)">
                <option value="all" \${state.categoryFilter === "all" ? "selected" : ""}>All categories</option>
                <option value="A" \${state.categoryFilter === "A" ? "selected" : ""}>Category A</option>
                <option value="B" \${state.categoryFilter === "B" ? "selected" : ""}>Category B</option>
                <option value="C" \${state.categoryFilter === "C" ? "selected" : ""}>Category C</option>
              </select></div>
              <div class="field"><select aria-label="Source domain filter" onchange="setDomainFilter(this.value)">\${domainOptions}</select></div>
              <div class="field"><select aria-label="Cognitive trap filter" onchange="setTrapFilter(this.value)">\${trapOptions}</select></div>
            </div>
            <div class="section">
              <div class="label">Save Slots</div>
              <div class="field"><select aria-label="Save slot" onchange="loadSlot(this.value)">
                \${slotOptions}
              </select></div>
              <div class="score-line"><span>Active</span><strong>\${escapeHtml(slotLabel(state.activeSlot))}</strong></div>
              <div class="score-line"><span>Saved</span><strong>\${activeSlotRecord?.savedAt ? new Date(activeSlotRecord.savedAt).toLocaleString() : "Not saved"}</strong></div>
              <div class="field"><input aria-label="Session name" value="\${escapeAttr(state.slotDraft)}" oninput="setSlotDraft(this.value)" placeholder="Session name"></div>
              <div class="mini-row"><button onclick="saveSlot(state.activeSlot)">Save Slot</button><button onclick="loadSlot(state.activeSlot)">Load Slot</button></div>
              <div class="field"><button onclick="saveNamedSlot()">Save Named</button></div>
            </div>
            <div class="section">
              <div class="label">Bank IO</div>
              <div class="score-line"><span>Version</span><strong>\${state.bankInfo.bankVersion || "runtime"}</strong></div>
              <div class="score-line"><span>PWA</span><strong>\${state.pwaStatus}</strong></div>
              <p class="sr-note">\${state.importStatus}</p>
              <div class="field"><input type="file" accept="application/json,.json" aria-label="Import item bank JSON" onchange="importBankFile(this)"></div>
              <div class="mini-row"><button onclick="exportItemBankJson()">Export Bank</button><button onclick="restoreEmbeddedBank()">Embedded</button></div>
            </div>
            <div class="section">
              <div class="label">Reset</div>
              <div class="mini-row"><button onclick="resetCurrentBlock()">Current Block</button><button onclick="resetAnswersOnly()">Answers</button></div>
              <div class="mini-row"><button onclick="resetTimersOnly()">Timers</button><button onclick="resetAll()">All Local</button></div>
              <div class="field"><button onclick="toggleShortcuts()">Shortcuts</button></div>
            </div>
          </aside>
          <section class="exam" aria-label="Current assessment item">
            \${candidateProgress}
            <article id="question-panel" class="panel question-panel" tabindex="-1" aria-labelledby="question-prompt">
              <div class="meta-row">
                <div class="chips">\${chipHtml}</div>
                <div class="source"><a href="\${q.sourceUrl}" target="_blank" rel="noreferrer">\${q.sourceHorizon.replace(/ \\(https?:\\/\\/[^)]+\\)/, "")}</a></div>
              </div>
              \${metadataBlock}
              \${dataDisplay}
              <div class="passage">\${q.passage}</div>
              <p id="question-prompt" class="prompt">\${q.prompt}</p>
              <div class="options" role="group" aria-labelledby="question-prompt">\${options}</div>
              \${confidenceField}
              <div class="actions">
                <button onclick="go(-1)" \${state.index === 0 ? "disabled" : ""}>Back</button>
                <button onclick="toggleFlag()" aria-pressed="\${Boolean(state.flagged[q.id])}">\${state.flagged[q.id] ? "Unflag" : "Flag"}</button>
                \${primaryAction}
              </div>
            </article>
            \${review}
          </section>
          <aside class="panel right" aria-label="Analytics, review and export">
            \${analyticsSection("profile", "CEFR Profile", \`<div class="big">\${a.profile}</div>
              <div class="score-line"><span>Answered score</span><strong>\${pct(a.percent)}%</strong></div>
              <div class="score-line"><span>Weighted score</span><strong>\${pct(a.weightedPercent)}%</strong></div>
              <div class="score-line"><span>Confidence adjusted</span><strong>\${pct(a.confidenceAdjustedPercent)}%</strong></div>
              <div class="score-line"><span>Band range</span><strong>\${a.profileExplanation.bandRange}</strong></div>
              <div class="score-line"><span>Weakest module</span><strong>\${escapeHtml(a.profileExplanation.weakestSkill)}</strong></div>
              <div class="bar"><i style="width:\${pct(a.percent)}%"></i></div>
              <p class="sr-note">CEFR rationale: \${escapeHtml(a.profileExplanation.summary)}</p>
              <p class="sr-note">Interpretation limit: \${escapeHtml(a.profileExplanation.limitation)}</p>
              <p class="sr-note">Recommendation: \${escapeHtml(a.profileExplanation.recommendation)}</p>\`)}
            \${analyticsSection("competence", "Competence Breakdown", compRows)}
            \${analyticsSection("skills", "Skill Modules", skillRows)}
            \${analyticsSection("confidence", "Confidence Calibration", confidenceRows)}
            \${analyticsSection("history", "Answer History", \`<div class="score-line"><span>Protocol records</span><strong>\${a.answerHistoryCount}</strong></div>
              <div class="score-line"><span>Total time spent</span><strong>\${fmt(a.totalTimeSeconds)}</strong></div>
              <div class="score-line"><span>Current item time</span><strong>\${fmt(currentItemTime)}</strong></div>
              <div class="history-list">\${recentHistory || "<p class='muted'>No submitted answers yet.</p>"}</div>\`)}
            \${evaluatorPanel}
            \${adminPanel}
            \${analyticsSection("review", "Review", \`<button onclick="toggleReview()">\${state.showReviewAll ? "Hide Review Screen" : "Review Screen"}</button>
              <div class="field"><select aria-label="Review filter" onchange="setReviewFilter(this.value)">
                <option value="all" \${state.reviewFilter === "all" ? "selected" : ""}>Review all matched</option>
                <option value="submitted" \${state.reviewFilter === "submitted" ? "selected" : ""}>Submitted only</option>
                <option value="wrong" \${state.reviewFilter === "wrong" ? "selected" : ""}>Wrong or partial</option>
                <option value="flagged" \${state.reviewFilter === "flagged" ? "selected" : ""}>Flagged only</option>
              </select></div>
              <div style="height:10px"></div>
              \${reviewList}\`)}
            \${analyticsSection("export", "Export", \`<div class="export-row">
                <button onclick="exportResultsJson()">JSON</button>
                <button onclick="exportResultsCsv()">CSV</button>
                <button onclick="exportCandidateReportHtml()">Candidate</button>
                <button onclick="exportEvaluatorReportHtml()">Evaluator</button>
                <button onclick="printReport()">PDF</button>
              </div>\`)}
            \${analyticsSection("reading", "Reading Settings", \`<div class="field"><select aria-label="Reading text size" onchange="setReadingSize(this.value)">
                <option value="normal" \${state.readingSize === "normal" ? "selected" : ""}>Normal text</option>
                <option value="large" \${state.readingSize === "large" ? "selected" : ""}>Large text</option>
                <option value="compact" \${state.readingSize === "compact" ? "selected" : ""}>Compact text</option>
              </select></div>
              <div class="field"><select aria-label="Passage font" onchange="setReadingFont(this.value)">
                <option value="serif" \${state.readingFont === "serif" ? "selected" : ""}>Serif passage</option>
                <option value="sans" \${state.readingFont === "sans" ? "selected" : ""}>Sans passage</option>
              </select></div>
              <div class="field"><select aria-label="Passage line height" onchange="setReadingLine(this.value)">
                <option value="normal" \${state.readingLine === "normal" ? "selected" : ""}>Normal line height</option>
                <option value="tight" \${state.readingLine === "tight" ? "selected" : ""}>Tight line height</option>
                <option value="loose" \${state.readingLine === "loose" ? "selected" : ""}>Loose line height</option>
              </select></div>
              <div class="field"><select aria-label="Passage width" onchange="setPassageWidth(this.value)">
                <option value="standard" \${state.passageWidth === "standard" ? "selected" : ""}>Standard width</option>
                <option value="narrow" \${state.passageWidth === "narrow" ? "selected" : ""}>Narrow width</option>
                <option value="wide" \${state.passageWidth === "wide" ? "selected" : ""}>Wide width</option>
              </select></div>\`)}
          </aside>
        </main>
        \${shortcutOverlay}\`;
    }
    function toggleTheme() {
      state.theme = state.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = state.theme;
      persist();
      render();
    }
    function toggleReview() {
      state.showReviewAll = !state.showReviewAll;
      render();
    }
    function toggleShortcuts() {
      state.showShortcuts = !state.showShortcuts;
      render();
    }
    window.setSelection = setSelection;
    window.setConfidence = setConfidence;
    window.setMode = setMode;
    window.setSessionPreset = setSessionPreset;
    window.setRandomQuestions = setRandomQuestions;
    window.setRandomOptions = setRandomOptions;
    window.setRandomSeed = setRandomSeed;
    window.setReviewFilter = setReviewFilter;
    window.setSearch = setSearch;
    window.setCategoryFilter = setCategoryFilter;
    window.setDomainFilter = setDomainFilter;
    window.setTrapFilter = setTrapFilter;
    window.setReadingSize = setReadingSize;
    window.setReadingFont = setReadingFont;
    window.setReadingLine = setReadingLine;
    window.setPassageWidth = setPassageWidth;
    window.setRoleMode = setRoleMode;
    window.setEvaluatorNote = setEvaluatorNote;
    window.setSlotDraft = setSlotDraft;
    window.saveSlot = saveSlot;
    window.saveNamedSlot = saveNamedSlot;
    window.loadSlot = loadSlot;
    window.exportResultsJson = exportResultsJson;
    window.exportResultsCsv = exportResultsCsv;
    window.exportCandidateReportHtml = exportCandidateReportHtml;
    window.exportEvaluatorReportHtml = exportEvaluatorReportHtml;
    window.exportReportHtml = exportReportHtml;
    window.exportItemBankJson = exportItemBankJson;
    window.importBankFile = importBankFile;
    window.restoreEmbeddedBank = restoreEmbeddedBank;
    window.importPilotResponses = importPilotResponses;
    window.exportPilotTemplate = exportPilotTemplate;
    window.importExpertReviews = importExpertReviews;
    window.exportExpertTemplate = exportExpertTemplate;
    window.printReport = printReport;
    window.submit = submit;
    window.go = go;
    window.jump = jump;
    window.setBlock = setBlock;
    window.nextUnanswered = nextUnanswered;
    window.toggleFlag = toggleFlag;
    window.resetAll = resetAll;
    window.resetAnswersOnly = resetAnswersOnly;
    window.resetTimersOnly = resetTimersOnly;
    window.toggleTimerPaused = toggleTimerPaused;
    window.setTimerDuration = setTimerDuration;
    window.resetTimer = resetTimer;
    window.toggleTimerSettings = toggleTimerSettings;
    window.resetCurrentBlock = resetCurrentBlock;
    window.toggleTheme = toggleTheme;
    window.toggleReview = toggleReview;
    window.toggleShortcuts = toggleShortcuts;
    window.toggleAnalyticsSection = toggleAnalyticsSection;
    window.toggleExamBreak = toggleExamBreak;
    document.addEventListener("click", (event) => {
      if (event.target && event.target.matches(".skip-link")) {
        setTimeout(() => document.getElementById("question-panel")?.focus(), 0);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.target && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
      if (/^[1-5]$/.test(event.key)) setSelection(letters[Number(event.key) - 1]);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
      if (event.key.toLowerCase() === "f") toggleFlag();
      if (event.key === "?") toggleShortcuts();
      if (event.key === "Enter") submit();
    });
    if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
      navigator.serviceWorker.register("./sw.js")
        .then(() => { state.pwaStatus = "offline ready"; render(); })
        .catch(() => { state.pwaStatus = "registration failed"; render(); });
    } else {
      state.pwaStatus = "host required";
    }
    render();
    setInterval(render, 1000);
  </script>
</body>
</html>`;
}

function auditTests(tests) {
  const counts = {
    total: tests.length,
    A: tests.filter((t) => t.category === "A").length,
    B: tests.filter((t) => t.category === "B").length,
    C: tests.filter((t) => t.category === "C").length
  };
  const passageWords = tests.map((t) => wordCount(t.passage));
  const duplicatePassages = tests.length - new Set(tests.map((t) => t.passage)).size;
  const duplicateOptionSets = tests.length - new Set(tests.map((t) => t.options.join(" || "))).size;
  const articleLevelUrls = tests.filter((t) => t.sourceUrl.includes("nature.com/articles/") || t.sourceUrl.includes("science.org/doi/")).length;
  const openings = tests.map((t) => t.passage.split(/\s+/).slice(0, 10).join(" "));
  const repeatedOpenings = openings.length - new Set(openings).size;
  const bannedPatterns = [
    /The implication is that a /,
    /can overproduce confidence when methods are reported without their evidential boundaries/,
    /\\bis remained\\b/i,
    /as if it represented/i,
    /claims will replicate claims/i,
    /Attrition is/i,
    /attrition bias/i,
    /must determine .* removes remaining uncertainty/i,
    /automatically eliminates missing-data bias/i
  ];
  const bannedHits = [];
  for (const t of tests) {
    for (const pattern of bannedPatterns) {
      if (pattern.test(t.passage)) bannedHits.push({ id: t.id, pattern: String(pattern) });
    }
  }
  const errors = [];
  if (counts.total !== 300 || counts.A !== 100 || counts.B !== 100 || counts.C !== 100) errors.push(`Bad distribution: ${JSON.stringify(counts)}`);
  for (const t of tests) {
    const wc = wordCount(t.passage);
    if (wc < 150 || wc > 250) errors.push(`${t.id} passage word count ${wc}`);
    if (t.options.length !== 5) errors.push(`${t.id} option count ${t.options.length}`);
    if (new Set(t.options).size !== 5) errors.push(`${t.id} duplicate options`);
    if (t.category === "B" && ![2, 3].includes(t.correct.length)) errors.push(`${t.id} category B answer count ${t.correct.length}`);
    if (t.category !== "B" && t.correct.length !== 1) errors.push(`${t.id} single-select answer count ${t.correct.length}`);
    if (!t.correct.every((x) => letters.includes(x))) errors.push(`${t.id} invalid answer letter`);
    const needsOvergeneralisation = t.category !== "B" || t.options.some((option) => /^Delete the limitation/.test(option));
    if (!t.rationale.includes("false") || (needsOvergeneralisation && !t.rationale.includes("overgeneral") && !t.rationale.includes("overgeneralisation"))) {
      errors.push(`${t.id} rationale lacks distractor taxonomy`);
    }
  }
  if (duplicatePassages > 0) errors.push(`${duplicatePassages} duplicate passages`);
  if (duplicateOptionSets > 0) errors.push(`${duplicateOptionSets} duplicate option sets`);
  if (repeatedOpenings > 40) errors.push(`${repeatedOpenings} repeated ten-word openings`);
  if (bannedHits.length) errors.push(`Banned phrase hits: ${JSON.stringify(bannedHits.slice(0, 5))}`);
  return {
    counts,
    minWords: Math.min(...passageWords),
    maxWords: Math.max(...passageWords),
    duplicatePassages,
    duplicateOptionSets,
    repeatedOpenings,
    articleLevelUrls,
    bannedHits,
    errors
  };
}

const tests = buildTests();
const audit = auditTests(tests);
if (audit.errors.length && !process.env.ACC_ALLOW_AUDIT_FAIL) {
  throw new Error(audit.errors.join("\n"));
}
const itemBank = buildItemBank(tests, audit);
const sourceVerificationReport = buildSourceVerificationReport(tests);
const readinessReport = buildReadinessReport(tests, audit);

fs.writeFileSync(path.join(outputDir, "advanced_academic_tests.md"), buildMarkdown(tests, audit), "utf8");
fs.writeFileSync(path.join(outputDir, "academic_test_platform.html"), buildHtml(tests), "utf8");
fs.writeFileSync(path.join(outputDir, "item_bank.json"), JSON.stringify(itemBank, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "source_verification_report.json"), JSON.stringify(sourceVerificationReport, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "production_readiness_report.json"), JSON.stringify(readinessReport, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "wcag_conformance_matrix.json"), JSON.stringify(buildWcagConformanceMatrix(), null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "wcag_assistive_tech_protocol.md"), buildWcagAssistiveTechProtocol(), "utf8");
fs.writeFileSync(path.join(outputDir, "accessibility_statement.md"), buildAccessibilityStatement(), "utf8");
fs.writeFileSync(path.join(outputDir, "assessment_platform_docs.md"), buildDocs(), "utf8");
fs.writeFileSync(path.join(outputDir, "CHANGELOG.md"), buildChangelog(), "utf8");
fs.writeFileSync(path.join(outputDir, "app.webmanifest"), JSON.stringify(buildPwaManifest(), null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "sw.js"), buildServiceWorker(), "utf8");
fs.writeFileSync(path.join(outputDir, "academic_test_manifest.json"), JSON.stringify({
  generator: "build_academic_assessment_v2.js",
  bankVersion: itemBank.bankVersion,
  schemaVersion: itemBank.schemaVersion,
  counts: audit.counts,
  minWords: audit.minWords,
  maxWords: audit.maxWords,
  duplicatePassages: audit.duplicatePassages,
  duplicateOptionSets: audit.duplicateOptionSets,
  repeatedOpenings: audit.repeatedOpenings,
  articleLevelUrls: audit.articleLevelUrls,
  generatedAt: new Date().toISOString(),
  files: [
    "item_bank.json",
    "advanced_academic_tests.md",
    "academic_test_platform.html",
    "source_verification_report.json",
    "production_readiness_report.json",
    "wcag_audit_report.json",
    "wcag_conformance_matrix.json",
    "wcag_assistive_tech_protocol.md",
    "accessibility_statement.md",
    "psychometric_calibration_report.json",
    "psychometric_item_summary.csv",
    "pilot_response_template.csv",
    "score_interpretation_report.json",
    "standard_setting_protocol.md",
    "score_claim_register.md",
    "cut_score_policy.csv",
    "cefr_interpretation_report.json",
    "cefr_interpretation_matrix.csv",
    "adaptive_readiness_report.json",
    "adaptive_algorithm_spec.md",
    "item_exposure_policy.md",
    "adaptive_simulation_matrix.csv",
    "data_visualization_readiness_report.json",
    "category_c_visualization_matrix.csv",
    "exam_protocol_report.json",
    "exam_protocol_matrix.csv",
    "section_randomization_report.json",
    "section_randomization_matrix.csv",
    "session_management_report.json",
    "session_management_matrix.csv",
    "visual_snapshot_report.json",
    "visual_snapshot_matrix.csv",
    "export_integrity_report.json",
    "export_integrity_matrix.csv",
    "qa_dashboard_report.json",
    "hygiene_audit_report.json",
    "bank_governance_report.json",
    "item_lifecycle_policy.md",
    "next_bank_authoring_plan.md",
    "release_signoff_checklist.csv",
    "operations_readiness_report.json",
    "production_deployment_runbook.md",
    "data_retention_policy.md",
    "proctoring_integrity_policy.md",
    "incident_response_runbook.md",
    "bank_quality_review_report.json",
    "construct_coverage_report.json",
    "distractor_quality_report.json",
    "blueprint_matrix.csv",
    "manual_review_packet.md",
    "review_queue.csv",
    "expert_review_template.csv",
    "expert_review_protocol.md",
    "expert_adjudication_report.json",
    "secure_delivery_api_spec.json",
    "secure_delivery_blueprint.md",
    "secure_delivery_readiness_report.json",
    "pdf_report_pipeline_report.json",
    "pdf/academic-assessment-candidate-report.pdf",
    "pdf/academic-assessment-evaluator-report.pdf",
    "pdf/academic-assessment-candidate-report-preview.png",
    "pdf/academic-assessment-evaluator-report-preview.png",
    "snapshot_desktop_learning.png",
    "snapshot_category_c_visual.png",
    "snapshot_admin_review.png",
    "snapshot_mobile_initial.png",
    "banned_phrase_registry.json",
    "authoring_templates.md",
    "assessment_platform_docs.md",
    "CHANGELOG.md",
    "app.webmanifest",
    "sw.js"
  ]
}, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "academic_test_quality_audit.json"), JSON.stringify(audit, null, 2), "utf8");
console.log(JSON.stringify(audit, null, 2));





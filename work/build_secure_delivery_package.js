const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const bank = JSON.parse(fs.readFileSync(path.join(outputDir, "item_bank.json"), "utf8"));

const apiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Academic C1-C2 Secure Delivery API",
    version: "0.3.0-prototype",
    description: "Server-backed candidate delivery with per-attempt candidate authorization, durable attempt storage, reporting and scoring API that keeps answer keys and rationales out of candidate payloads."
  },
  servers: [{ url: "http://127.0.0.1:8790", description: "local prototype" }],
  security: [],
  paths: {
    "/health": {
      get: {
        summary: "Read bank health metadata",
        responses: { "200": { description: "Bank metadata and item count" } }
      }
    },
    "/api/attempts": {
      post: {
        summary: "Create a candidate attempt",
        description: "Returns attempt metadata, a one-time candidate access token and the first candidate-safe item. Correct answers and rationales are omitted. The server stores only a hash of the candidate token.",
        responses: { "201": { description: "Attempt created" } }
      }
    },
    "/api/attempts/{attemptId}/responses": {
      post: {
        summary: "Submit one candidate response for server-side scoring",
        description: "Scores the response on the server and returns only score plus next candidate-safe item.",
        security: [{ bearerCandidateAttemptToken: [] }],
        responses: {
          "200": { description: "Response accepted and scored" },
          "401": { description: "Candidate access token required" }
        }
      }
    },
    "/api/attempts/{attemptId}": {
      get: {
        summary: "Read candidate-safe attempt state",
        description: "Returns submitted response summaries and the next candidate-safe item without evaluator-only material.",
        security: [{ bearerCandidateAttemptToken: [] }],
        responses: {
          "200": { description: "Candidate-safe attempt state" },
          "401": { description: "Candidate access token required" }
        }
      }
    },
    "/api/attempts/{attemptId}/finalize": {
      post: {
        summary: "Finalize an attempt and return result summary",
        security: [{ bearerCandidateAttemptToken: [] }],
        responses: {
          "200": { description: "Final score summary" },
          "401": { description: "Candidate access token required" }
        }
      }
    },
    "/api/attempts/{attemptId}/report/candidate": {
      get: {
        summary: "Render a candidate-safe HTML report",
        description: "Printable report that omits answer keys, rationales and evaluator-only bank metadata.",
        security: [{ bearerCandidateAttemptToken: [] }],
        responses: {
          "200": { description: "Candidate-safe HTML report" },
          "401": { description: "Candidate access token required" }
        }
      }
    },
    "/api/admin/items": {
      get: {
        summary: "Read protected bank with answer keys for evaluator/admin use",
        security: [{ bearerRuntimeAdminToken: [] }],
        responses: {
          "200": { description: "Full item bank including scoring keys" },
          "401": { description: "Runtime admin token required" }
        }
      }
    },
    "/api/admin/attempts": {
      get: {
        summary: "Read protected persisted attempt registry",
        security: [{ bearerRuntimeAdminToken: [] }],
        responses: {
          "200": { description: "Persisted attempts for authorized evaluator/admin use" },
          "401": { description: "Runtime admin token required" }
        }
      }
    },
    "/api/admin/audit-log": {
      get: {
        summary: "Read protected audit log",
        security: [{ bearerRuntimeAdminToken: [] }],
        responses: {
          "200": { description: "Recent JSONL audit rows" },
          "401": { description: "Runtime admin token required" }
        }
      }
    },
    "/api/admin/attempts/{attemptId}/report/evaluator": {
      get: {
        summary: "Render a protected evaluator HTML report",
        security: [{ bearerRuntimeAdminToken: [] }],
        responses: {
          "200": { description: "Evaluator HTML report including answer keys and rationales" },
          "401": { description: "Runtime admin token required" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerRuntimeAdminToken: {
        type: "http",
        scheme: "bearer",
        description: "Runtime environment token. Do not commit or expose this value."
      },
      bearerCandidateAttemptToken: {
        type: "http",
        scheme: "bearer",
        description: "Per-attempt candidate token returned once at attempt creation. The server stores only its SHA-256 hash."
      }
    }
  },
  xSecurityInvariants: [
    "Candidate item payloads must not contain correct answers, rationales, sourceCorrect or displayCorrect fields.",
    "Candidate attempt, response, finalize and candidate-report endpoints require a per-attempt bearer token.",
    "Candidate access tokens are returned once and persisted only as hashes.",
    "Candidate attempt summaries and candidate reports must not expose evaluator-only scoring material.",
    "Server-side scoring uses the canonical item_bank.json loaded on the server.",
    "Admin/evaluator bank access requires an authorization token supplied through the runtime environment.",
    "Prototype attempts persist to local JSON storage and audit events persist to JSONL without storing runtime tokens.",
    "Production must replace local storage with managed durable storage, backups, retention policy and audited authentication."
  ]
};

const blueprint = [
  "# Secure Delivery Blueprint",
  "",
  `Bank version: ${bank.bankVersion}. Schema: ${bank.schemaVersion}.`,
  "",
  "## Purpose",
  "",
  "The standalone HTML platform is useful for offline beta testing, but it cannot hide answer keys from a technically capable candidate. The secure delivery layer moves attempt creation, answer-key custody, scoring, reporting and audit events to a server process. Candidate endpoints receive only passages, prompts, options, public metadata and candidate-safe response summaries, and they require a per-attempt bearer token after attempt creation.",
  "",
  "## Prototype Files",
  "",
  "- `work/secure_delivery_server.js`: dependency-free Node.js HTTP prototype with local durable attempt storage.",
  "- `work/qa_secure_delivery.js`: regression test for candidate authorization, redaction, scoring, storage, report rendering, audit log and admin authorization boundary.",
  "- `secure_delivery_api_spec.json`: API contract and security invariants.",
  "- `secure_delivery_readiness_report.json`: latest QA evidence for the secure delivery prototype.",
  "",
  "## Candidate Flow",
  "",
  "1. `POST /api/attempts` creates an attempt, returns the first safe item and returns a one-time candidate access token.",
  "2. `POST /api/attempts/{attemptId}/responses` accepts selected letters and scores server-side when the candidate token is supplied.",
  "3. `GET /api/attempts/{attemptId}` reads candidate-safe attempt state when the candidate token is supplied.",
  "4. `POST /api/attempts/{attemptId}/finalize` returns the result summary when the candidate token is supplied.",
  "5. `GET /api/attempts/{attemptId}/report/candidate` renders a printable candidate-safe HTML report when the candidate token is supplied.",
  "",
  "## Evaluator/Admin Flow",
  "",
  "Protected endpoints require a runtime environment bearer token. The token is not stored in repository files, generated outputs or remote configuration by this prototype. Authorized evaluator endpoints expose the full bank, persisted attempts, audit log rows and evaluator reports.",
  "",
  "## Storage and Audit",
  "",
  "The prototype writes attempts to local JSON and audit events to JSONL under `ASSESSMENT_STORAGE_DIR`, or `work/secure_delivery_data` by default. Candidate access tokens are stored only as hashes. Audit rows include action names, timestamps, bank version and scoped metadata, but never runtime tokens.",
  "",
  "## Production Work Still Required",
  "",
  "- Real authentication and role management.",
  "- Managed durable attempt/session storage with backups and retention controls.",
  "- TLS, rate limits, centralized audit logging and operational monitoring.",
  "- Secure PDF rendering pipeline beyond printable HTML reports.",
  "- Privacy policy, data retention policy and proctoring decision.",
  "- Deployment-specific secret handling.",
  ""
].join("\n");

fs.writeFileSync(path.join(outputDir, "secure_delivery_api_spec.json"), JSON.stringify(apiSpec, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "secure_delivery_blueprint.md"), blueprint, "utf8");

console.log(JSON.stringify({
  bankVersion: bank.bankVersion,
  files: ["secure_delivery_api_spec.json", "secure_delivery_blueprint.md"],
  securityInvariants: apiSpec.xSecurityInvariants.length
}, null, 2));

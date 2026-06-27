import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs"
PDF_DIR = OUTPUT_DIR / "pdf"
BANK_PATH = OUTPUT_DIR / "item_bank.json"
REPORT_PATH = OUTPUT_DIR / "pdf_report_pipeline_report.json"

SAMPLE_RESPONSES = [
    {"itemId": "ACC_001", "selected": ["D"], "confidence": "high", "timeSeconds": 91},
    {"itemId": "ACC_101", "selected": ["A", "C"], "confidence": "medium", "timeSeconds": 126},
    {"itemId": "ACC_201", "selected": ["B"], "confidence": "low", "timeSeconds": 144},
]


def clean_text(value):
    text = str(value if value is not None else "")
    text = text.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", "-")
    text = unicodedata.normalize("NFKD", text)
    return text.encode("ascii", "ignore").decode("ascii")


def score_question(item, selected):
    correct = set(item["correct"])
    selected_set = set(selected)
    if item["type"] == "single":
        return 1 if len(selected_set) == 1 and next(iter(selected_set)) in correct else 0
    true_hits = len([letter for letter in selected_set if letter in correct])
    false_hits = len([letter for letter in selected_set if letter not in correct])
    possible_wrong = 5 - len(correct)
    return max(0, min(1, true_hits / len(correct) - false_hits / max(1, possible_wrong)))


def load_attempt():
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    by_id = {item["id"]: item for item in bank["items"]}
    rows = []
    for response in SAMPLE_RESPONSES:
        item = by_id[response["itemId"]]
        score = score_question(item, response["selected"])
        rows.append(
            {
                **response,
                "score": round(score, 3),
                "category": item["category"],
                "skillModule": item["skillModule"],
                "difficultyTier": item["difficultyTier"],
                "correct": item["correct"],
                "rationale": item["rationale"],
            }
        )
    return {
        "attemptId": "pdf-pipeline-sample",
        "candidateId": "sample-candidate",
        "bankVersion": bank["bankVersion"],
        "schemaVersion": bank["schemaVersion"],
        "itemCount": len(rows),
        "submitted": len(rows),
        "weightedPercent": round(sum(row["score"] for row in rows) / len(rows), 4),
        "rows": rows,
    }


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            spaceAfter=10,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#111827"),
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.HexColor("#111827"),
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1f2937"),
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#4b5563"),
        ),
        "header": ParagraphStyle(
            "Header",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white,
        ),
        "right": ParagraphStyle(
            "Right",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            alignment=TA_RIGHT,
            textColor=colors.HexColor("#4b5563"),
        ),
    }


def paragraph(style, value):
    return Paragraph(clean_text(value), style)


def footer(canvas, doc, title, bank_version):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6b7280"))
    canvas.drawString(18 * mm, 12 * mm, clean_text(f"{title} - {bank_version}"))
    canvas.drawRightString(192 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def table_style(header_fill):
    return TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), header_fill),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("LEADING", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#d1d5db")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f9fafb")]),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]
    )


def build_pdf(path, title, attempt, evaluator=False):
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    s = styles()
    story = [
        paragraph(s["title"], title),
        paragraph(
            s["body"],
            f"Bank {attempt['bankVersion']} / schema {attempt['schemaVersion']}. Attempt {attempt['attemptId']}. Generated {datetime.now(timezone.utc).isoformat()}.",
        ),
        Spacer(1, 6),
    ]
    if evaluator:
        story.append(paragraph(s["small"], "Evaluator-only report. Includes scoring keys, rationales and timing evidence for authorized review."))
        headers = ["ID", "Skill", "Selected", "Correct", "Score", "Time", "Rationale"]
        rows = [
            [
                paragraph(s["small"], row["itemId"]),
                paragraph(s["small"], row["skillModule"]),
                paragraph(s["small"], ", ".join(row["selected"])),
                paragraph(s["small"], ", ".join(row["correct"])),
                paragraph(s["small"], row["score"]),
                paragraph(s["small"], row["timeSeconds"]),
                paragraph(s["small"], row["rationale"]),
            ]
            for row in attempt["rows"]
        ]
        widths = [20 * mm, 28 * mm, 18 * mm, 18 * mm, 15 * mm, 15 * mm, 62 * mm]
        header_color = colors.HexColor("#374151")
    else:
        story.append(paragraph(s["small"], "Candidate report. Evaluator-only scoring material is omitted."))
        headers = ["ID", "Category", "Skill", "Selected", "Score", "Confidence", "Time"]
        rows = [
            [
                paragraph(s["small"], row["itemId"]),
                paragraph(s["small"], row["category"]),
                paragraph(s["small"], row["skillModule"]),
                paragraph(s["small"], ", ".join(row["selected"])),
                paragraph(s["small"], row["score"]),
                paragraph(s["small"], row["confidence"]),
                paragraph(s["small"], row["timeSeconds"]),
            ]
            for row in attempt["rows"]
        ]
        widths = [22 * mm, 18 * mm, 44 * mm, 22 * mm, 18 * mm, 28 * mm, 20 * mm]
        header_color = colors.HexColor("#1f4f46")
    story.extend(
        [
            Spacer(1, 8),
            paragraph(s["h2"], "Attempt Summary"),
            Table(
                [
                    ["Metric", "Value"],
                    [paragraph(s["small"], "Submitted"), paragraph(s["small"], str(attempt["submitted"]))],
                    [paragraph(s["small"], "Weighted percent"), paragraph(s["small"], str(attempt["weightedPercent"]))],
                    [paragraph(s["small"], "Report boundary"), paragraph(s["small"], "candidate-safe" if not evaluator else "authorized evaluator")],
                ],
                colWidths=[38 * mm, 80 * mm],
                style=table_style(colors.HexColor("#475569")),
            ),
            paragraph(s["h2"], "Responses"),
            Table([[paragraph(s["header"], h) for h in headers]] + rows, colWidths=widths, repeatRows=1, style=table_style(header_color)),
        ]
    )
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=title,
        author="Academic C1-C2 Assessment",
    )
    doc.build(story, onFirstPage=lambda canvas, doc: footer(canvas, doc, title, attempt["bankVersion"]), onLaterPages=lambda canvas, doc: footer(canvas, doc, title, attempt["bankVersion"]))


def read_pdf_text(path):
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages), len(reader.pages)


def render_preview(path, prefix):
    bundled = Path(sys.executable).resolve().parents[1] / "native" / "poppler" / "Library" / "bin" / "pdftoppm.exe"
    tool = str(bundled) if bundled.exists() else shutil.which("pdftoppm")
    if not tool:
        return None
    subprocess.run([tool, "-png", "-f", "1", "-singlefile", str(path), str(prefix)], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    preview = Path(f"{prefix}.png")
    return str(preview.relative_to(OUTPUT_DIR)).replace("\\", "/") if preview.exists() else None


def main():
    attempt = load_attempt()
    candidate_pdf = PDF_DIR / "academic-assessment-candidate-report.pdf"
    evaluator_pdf = PDF_DIR / "academic-assessment-evaluator-report.pdf"
    build_pdf(candidate_pdf, "Academic Assessment Candidate Report", attempt, evaluator=False)
    build_pdf(evaluator_pdf, "Academic Assessment Evaluator Report", attempt, evaluator=True)

    candidate_text, candidate_pages = read_pdf_text(candidate_pdf)
    evaluator_text, evaluator_pages = read_pdf_text(evaluator_pdf)
    hidden_pattern = re.compile(r"\bCorrect\b|\bRationale\b|answer key|sourceCorrect|displayCorrect", re.IGNORECASE)
    candidate_redacted = hidden_pattern.search(candidate_text) is None
    evaluator_has_key = "Correct" in evaluator_text and "Rationale" in evaluator_text and "false-synchrony" in evaluator_text
    candidate_preview = render_preview(candidate_pdf, PDF_DIR / "academic-assessment-candidate-report-preview")
    evaluator_preview = render_preview(evaluator_pdf, PDF_DIR / "academic-assessment-evaluator-report-preview")

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": "prototype-pass" if candidate_redacted and evaluator_has_key and candidate_preview and evaluator_preview else "fail",
        "bankVersion": attempt["bankVersion"],
        "schemaVersion": attempt["schemaVersion"],
        "pipeline": "reportlab-pypdf-poppler",
        "outputs": {
            "candidatePdf": str(candidate_pdf.relative_to(OUTPUT_DIR)).replace("\\", "/"),
            "evaluatorPdf": str(evaluator_pdf.relative_to(OUTPUT_DIR)).replace("\\", "/"),
            "candidatePreview": candidate_preview,
            "evaluatorPreview": evaluator_preview,
        },
        "evidence": {
            "candidateRedacted": candidate_redacted,
            "evaluatorHasKeyAndRationale": evaluator_has_key,
            "candidatePages": candidate_pages,
            "evaluatorPages": evaluator_pages,
            "candidateBytes": candidate_pdf.stat().st_size,
            "evaluatorBytes": evaluator_pdf.stat().st_size,
            "renderedPreviewPages": len([p for p in [candidate_preview, evaluator_preview] if p]),
        },
        "limitations": [
            "Prototype renders deterministic sample reports locally.",
            "Production still needs signed report access, managed rendering workers, retention policy and delivery logging.",
        ],
    }
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if report["status"] != "prototype-pass":
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

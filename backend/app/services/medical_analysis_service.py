from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib


BASE_DIR = Path(__file__).resolve().parents[2]

MEDICAL_SPECIALTY_MODEL_FILE = (
    BASE_DIR
    / "training"
    / "artifacts"
    / "medical_specialty_model_best.joblib"
)


@lru_cache(maxsize=1)
def load_model(model_path: str):
    path = Path(model_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Model not found: {path}"
        )

    return joblib.load(path)


def get_top_predictions(
    model,
    text: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    probabilities = model.predict_proba(
        [text]
    )[0]

    classes = model.classes_

    top_indices = probabilities.argsort()[::-1][:top_k]

    results = []

    for index in top_indices:
        results.append(
            {
                "label": str(classes[index]),
                "score": float(probabilities[index]),
                "percentage": round(
                    float(probabilities[index]) * 100,
                    2,
                ),
            }
        )

    return results


def detect_report_type(
    text: str,
) -> str:
    text_lower = text.lower()

    report_keywords = {
        "Echocardiogram": [
            "echocardiogram",
            "echo report",
            "ejection fraction",
            "left atrium",
            "mitral regurgitation",
            "tricuspid regurgitation",
        ],
        "MRI": [
            "mri",
            "magnetic resonance imaging",
        ],
        "CT Scan": [
            "ct scan",
            "computed tomography",
            "computed tomographic",
        ],
        "X-Ray": [
            "x-ray",
            "x ray",
            "radiograph",
        ],
        "Ultrasound": [
            "ultrasound",
            "sonography",
            "sonographic",
        ],
        "Pathology Report": [
            "pathology",
            "histopathology",
            "biopsy",
            "specimen",
        ],
        "Laboratory Report": [
            "laboratory",
            "lab report",
            "reference range",
            "test result",
            "blood test",
            "serum",
            "creatinine",
            "hemoglobin",
            "glucose",
        ],
        "Discharge Summary": [
            "discharge summary",
            "discharge diagnosis",
            "hospital course",
        ],
    }

    candidates = []

    for report_type, keywords in report_keywords.items():
        matched = [
            keyword
            for keyword in keywords
            if keyword in text_lower
        ]

        if matched:
            candidates.append(
                {
                    "report_type": report_type,
                    "score": len(matched),
                    "evidence": matched,
                }
            )

    if not candidates:
        return "General Medical Report"

    candidates.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return candidates[0]["report_type"]


def confidence_level(
    routing_score: float,
) -> str:
    if routing_score >= 0.70:
        return "high"

    if routing_score >= 0.45:
        return "moderate"

    if routing_score >= 0.25:
        return "low"

    return "very_low"


def combine_specialty_evidence(
    ml_predictions: list[dict[str, Any]],
    evidence_predictions: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    combined = {}

    for prediction in ml_predictions:
        label = prediction["label"]

        combined[label] = {
            "specialty": label,
            "ml_score": prediction["score"],
            "evidence_score": 0.0,
            "evidence": [],
        }

    for item in evidence_predictions:
        specialty = item["specialty"]

        if specialty not in combined:
            combined[specialty] = {
                "specialty": specialty,
                "ml_score": 0.0,
                "evidence_score": 0.0,
                "evidence": [],
            }

        combined[specialty][
            "evidence_score"
        ] = item["normalized_score"]

        combined[specialty][
            "evidence"
        ] = item["evidence"]

    results = []

    for item in combined.values():
        routing_score = (
            0.40 * item["ml_score"]
            + 0.60 * item["evidence_score"]
        )

        results.append(
            {
                "specialty": item["specialty"],
                "routing_score": routing_score,
                "ml_score": item["ml_score"],
                "evidence_score": item["evidence_score"],
                "evidence": item["evidence"],
            }
        )

    results.sort(
        key=lambda item: item["routing_score"],
        reverse=True,
    )

    return results


def analyze_medical_report(
    file_path: str,
) -> dict[str, Any]:

    from app.services.clinical_findings_service import (
        extract_key_findings,
        extract_measurements,
    )
    from app.services.medical_text_service import (
        clean_medical_text,
    )
    from app.services.report_extraction_service import (
        extract_report_text,
    )
    from app.services.specialty_evidence_service import (
        score_specialties,
    )

    extraction = extract_report_text(
        file_path
    )

    raw_text = extraction.get(
        "text",
        "",
    )

    text = clean_medical_text(
        raw_text
    )

    if len(text) < 40:
        raise ValueError(
            "Not enough readable medical text "
            "was extracted from the document."
        )

    report_type = detect_report_type(
        text
    )

    findings = extract_key_findings(
        text
    )

    measurements = extract_measurements(
        text
    )

    specialty_model = load_model(
        str(MEDICAL_SPECIALTY_MODEL_FILE)
    )

    ml_predictions = get_top_predictions(
        specialty_model,
        text,
        top_k=5,
    )

    evidence_predictions = score_specialties(
        text
    )

    combined_predictions = combine_specialty_evidence(
        ml_predictions,
        evidence_predictions,
    )

    if not combined_predictions:
        raise ValueError(
            "Could not identify a likely medical specialty."
        )

    top_prediction = combined_predictions[0]

    routing_score = top_prediction[
        "routing_score"
    ]

    return {
        "report_type": report_type,
        "extraction_method": extraction.get(
            "method",
            "unknown",
        ),
        "text_length": len(text),
        "primary_specialty": top_prediction[
            "specialty"
        ],
        "routing_score": round(
            routing_score,
            4,
        ),
        "routing_score_percentage": round(
            routing_score * 100,
            2,
        ),
        "confidence_level": confidence_level(
            routing_score
        ),
        "requires_review": (
            routing_score < 0.45
        ),
        "specialties": [
            {
                "specialty": item["specialty"],
                "routing_score": round(
                    item["routing_score"],
                    4,
                ),
                "percentage": round(
                    item["routing_score"] * 100,
                    2,
                ),
                "ml_score": round(
                    item["ml_score"],
                    4,
                ),
                "evidence_score": round(
                    item["evidence_score"],
                    4,
                ),
                "evidence": item["evidence"],
            }
            for item in combined_predictions[:5]
        ],
        "findings": findings,
        "measurements": measurements,
        "text_preview": text[:1500],
    }
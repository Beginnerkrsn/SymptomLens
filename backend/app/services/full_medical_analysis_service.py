from __future__ import annotations

from typing import Any

from app.services.medical_analysis_service import (
    analyze_medical_report,
)
from app.services.physician_matching import (
    match_physicians,
)


def analyze_report_and_match_physicians(
    file_path: str,
    location: str | None = None,
    max_distance_km: float | None = None,
    physician_limit: int = 5,
) -> dict[str, Any]:

    # --------------------------------------------------------------
    # 1. Analyze the medical report
    # --------------------------------------------------------------

    analysis = analyze_medical_report(
        file_path
    )

    # --------------------------------------------------------------
    # 2. Get the specialty selected by the analysis layer
    # --------------------------------------------------------------

    specialty = analysis[
        "primary_specialty"
    ]

    # --------------------------------------------------------------
    # 3. Find matching physicians
    # --------------------------------------------------------------

    physicians = match_physicians(
        specialty=specialty,
        location=location,
        max_distance_km=max_distance_km,
        limit=physician_limit,
    )

    # --------------------------------------------------------------
    # 4. Return one unified response
    # --------------------------------------------------------------

    return {
        "report_type": analysis[
            "report_type"
        ],

        "extraction_method": analysis[
            "extraction_method"
        ],

        "primary_specialty": specialty,

        "routing_score": analysis[
            "routing_score"
        ],

        "routing_score_percentage": analysis[
            "routing_score_percentage"
        ],

        "confidence_level": analysis[
            "confidence_level"
        ],

        "requires_review": analysis[
            "requires_review"
        ],

        "specialties": analysis[
            "specialties"
        ],

        "findings": analysis[
            "findings"
        ],

        "measurements": analysis[
            "measurements"
        ],

        "physicians": physicians,

        "text_preview": analysis[
            "text_preview"
        ],
    }
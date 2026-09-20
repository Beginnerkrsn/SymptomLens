from app.services.medical_analysis_service import (
    analyze_medical_report,
)


def main():
    file_path = "tests/test_report.png"

    print("=" * 80)
    print("MEDICAL REPORT ANALYSIS TEST")
    print("=" * 80)

    result = analyze_medical_report(
        file_path
    )

    print("\nReport type:")
    print(result["report_type"])

    print("\nExtraction method:")
    print(result["extraction_method"])

    print("\nPrimary specialty:")
    print(result["primary_specialty"])

    print("\nRouting score:")
    print(
        f"{result['routing_score_percentage']:.2f}%"
    )

    print("\nConfidence level:")
    print(result["confidence_level"])

    print("\nRequires review:")
    print(result["requires_review"])

    print("\nTop specialties:")

    for item in result["specialties"]:
        print(
            f"- {item['specialty']}: "
            f"{item['percentage']:.2f}% "
            f"(ML: {item['ml_score'] * 100:.2f}%, "
            f"Evidence: {item['evidence_score'] * 100:.2f}%)"
        )

        if item["evidence"]:
            print(
                "  Evidence: "
                + ", ".join(item["evidence"])
            )

    print("\nKey findings:")

    for finding in result["findings"]:
        print(
            f"- {finding}"
        )

    print("\nMeasurements:")

    if result["measurements"]:
        for measurement in result["measurements"]:
            print(
                f"- {measurement['name']}: "
                f"{measurement['value']}"
            )
    else:
        print("- None detected")

    print("\nText preview:")
    print(
        result["text_preview"]
    )


if __name__ == "__main__":
    main()
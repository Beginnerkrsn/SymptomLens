from app.services.full_medical_analysis_service import (
    analyze_report_and_match_physicians,
)


def main():
    file_path = "tests/test_report.png"

    print("=" * 80)
    print("FULL MEDICAL ANALYSIS + PHYSICIAN MATCHING TEST")
    print("=" * 80)

    result = analyze_report_and_match_physicians(
        file_path=file_path,
        location="Nellore",
        max_distance_km=20,
        physician_limit=5,
    )

    print("\nReport type:")
    print(result["report_type"])

    print("\nPrimary specialty:")
    print(result["primary_specialty"])

    print("\nRouting score:")
    print(
        f"{result['routing_score_percentage']:.2f}%"
    )

    print("\nConfidence:")
    print(result["confidence_level"])

    print("\nKey findings:")

    for finding in result["findings"]:
        print(
            f"- {finding}"
        )

    print("\nMeasurements:")

    for measurement in result["measurements"]:
        print(
            f"- {measurement['name']}: "
            f"{measurement['value']}"
        )

    print("\nMatched physicians:")

    for doctor in result["physicians"]:
        print(
            f"#{doctor['rank']} "
            f"{doctor['name']} — "
            f"{doctor['specialty']} — "
            f"{doctor['match_score']}/100"
        )

    print("\n" + "=" * 80)
    print("FULL PIPELINE TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
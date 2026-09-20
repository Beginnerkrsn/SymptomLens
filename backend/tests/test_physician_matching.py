from pprint import pprint

from app.services.physician_matching import (
    match_physicians,
)


def main():
    print("=" * 80)
    print("PHYSICIAN MATCHING TEST")
    print("=" * 80)

    specialty = "Cardiology"

    physicians = match_physicians(
        specialty=specialty,
        location="Nellore",
        max_distance_km=20,
        limit=5,
    )

    print(f"\nRequested specialty: {specialty}")
    print(f"Matches found: {len(physicians)}")

    print("\nRanked physicians:")

    for doctor in physicians:
        print(
            f"\n#{doctor['rank']} "
            f"{doctor['name']}"
        )

        print(
            f"Specialty: "
            f"{doctor['specialty']}"
        )

        print(
            f"Sub-specialty: "
            f"{doctor['sub_specialty']}"
        )

        print(
            f"Experience: "
            f"{doctor['experience_years']} years"
        )

        print(
            f"Rating: "
            f"{doctor['rating']}/5 "
            f"({doctor['review_count']} reviews)"
        )

        print(
            f"Distance: "
            f"{doctor['distance_km']} km"
        )

        print(
            f"Match score: "
            f"{doctor['match_score']}/100"
        )

        print(
            f"Available: "
            f"{doctor['available']}"
        )


if __name__ == "__main__":
    main()
from typing import Any
from urllib.parse import quote


SPECIALTY_SLUGS = {
    "cardiology": "cardiologist",
    "nephrology": "nephrologist",
    "gastroenterology": "gastroenterologist",
    "neurology": "neurologist",
    "orthopedics": "orthopedist",
    "ophthalmology": "ophthalmologist",
    "pulmonology": "pulmonologist",
    "dermatology": "dermatologist",
    "endocrinology": "endocrinologist",
    "gynecology": "gynecologist",
    "general medicine": "general-physician",
}


def normalize(value: str) -> str:
    return " ".join(str(value).lower().split())


def match_physicians(
    specialty: str,
    location: str | None = None,
    max_distance_km: float | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:

    requested_specialty = normalize(specialty)

    specialty_slug = SPECIALTY_SLUGS.get(
        requested_specialty,
        requested_specialty.replace(" ", "-"),
    )

    city = normalize(location or "Nellore")
    city_slug = city.replace(" ", "-")

    city_display = location or "Nellore"

    practo_url = (
        f"https://www.practo.com/{city_slug}/"
        f"{specialty_slug}"
    )

    apollo_url = (
        "https://www.apollo247.com/doctors/"
        f"{specialty_slug}s-in-{city_slug}-scity"
    )

    providers = [
        {
            "name": f"Find {specialty} doctors",
            "specialty": specialty,
            "provider_name": "Practo",
            "city": city_display,
            "booking_url": practo_url,
            "source": "Practo",
            "source_type": "official_provider_directory",
        },
        {
            "name": f"Find {specialty} doctors",
            "specialty": specialty,
            "provider_name": "Apollo 24|7",
            "city": city_display,
            "booking_url": apollo_url,
            "source": "Apollo 24|7",
            "source_type": "official_provider_directory",
        },
    ]

    return providers[:limit]
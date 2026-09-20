import re


def extract_measurements(text: str) -> list[dict]:
    measurements = []

    patterns = [
        (
            "LVEF",
            r"(?:ejection fraction|lvef)[^\d]{0,30}"
            r"(\d+(?:\.\d+)?)\s*%",
        ),
        (
            "Creatinine",
            r"(?:creatinine)[^\d]{0,20}"
            r"(\d+(?:\.\d+)?)\s*(?:mg/dl|mg\/dl)?",
        ),
        (
            "eGFR",
            r"(?:egfr|estimated glomerular filtration rate)"
            r"[^\d]{0,30}(\d+(?:\.\d+)?)",
        ),
        (
            "Hemoglobin",
            r"(?:hemoglobin|hgb)[^\d]{0,20}"
            r"(\d+(?:\.\d+)?)\s*(?:g/dl|g\/dl)?",
        ),
        (
            "Glucose",
            r"(?:glucose|blood sugar)[^\d]{0,20}"
            r"(\d+(?:\.\d+)?)\s*(?:mg/dl|mg\/dl)?",
        ),
    ]

    text_lower = text.lower()

    for name, pattern in patterns:
        match = re.search(
            pattern,
            text_lower,
        )

        if match:
            measurements.append(
                {
                    "name": name,
                    "value": match.group(1),
                }
            )

    return measurements


def normalize_finding(text: str) -> str:
    text = " ".join(text.split()).strip()

    prefixes = [
        "findings:",
        "impression:",
        "results:",
        "conclusion:",
    ]

    lower = text.lower()

    for prefix in prefixes:
        if lower.startswith(prefix):
            text = text[len(prefix):].strip()
            break

    # Remove numbered prefixes such as:
    # "1. Finding..."
    # "2) Finding..."
    text = re.sub(
        r"^\d+[\.\)]\s*",
        "",
        text,
    )

    return text.strip()


def remove_report_metadata(text: str) -> str:
    """
    Remove obvious report-header metadata while preserving
    useful clinical information.
    """

    text = " ".join(text.split()).strip()

    lower = text.lower()

    # If the OCR sentence contains a "Clinical Information:"
    # section, preserve only the clinical information after it.
    clinical_marker = "clinical information:"

    if clinical_marker in lower:
        index = lower.find(clinical_marker)

        text = text[
            index + len(clinical_marker):
        ].strip()

        return text

    # Remove obvious fictional/demo/test headers.
    metadata_phrases = [
        "sample medical report",
        "fictional data",
        "software testing only",
        "for software testing only",
    ]

    if any(
        phrase in lower
        for phrase in metadata_phrases
    ):
        return ""

    return text


def _finding_key(text: str) -> str:
    """
    Create a normalized key for duplicate detection.
    """

    text = text.lower()

    replacements = {
        "approximately": "",
        "there is": "",
        "there are": "",
        "the ": "",
        "patient has": "",
        "patient is": "",
        "approximately ": "",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(
        r"[^a-z0-9]+",
        " ",
        text,
    )

    words = text.split()

    return " ".join(words)


def _is_substantially_duplicate(
    candidate_key: str,
    existing_key: str,
) -> bool:
    """
    Treat similar wording as duplicate when the shorter
    normalized phrase is largely contained in the longer one.
    """

    if candidate_key == existing_key:
        return True

    candidate_words = set(
        candidate_key.split()
    )

    existing_words = set(
        existing_key.split()
    )

    if not candidate_words or not existing_words:
        return False

    smaller = min(
        len(candidate_words),
        len(existing_words),
    )

    intersection = len(
        candidate_words & existing_words
    )

    similarity = intersection / smaller

    return similarity >= 0.75


def extract_key_findings(text: str) -> list[str]:
    finding_terms = [
        "enlarged",
        "regurgitation",
        "stenosis",
        "effusion",
        "lesion",
        "mass",
        "abnormal",
        "fracture",
        "inflammation",
        "infection",
        "calcification",
        "obstruction",
        "nodule",
        "cyst",
        "edema",
        "thickening",
        "dilated",
        "hypertrophy",
        "degeneration",
        "reduced",
        "elevated",
        "decreased",
        "increased",
    ]

    raw_sentences = re.split(
        r"(?<=[.!?])\s+",
        text,
    )

    findings = []
    finding_keys = []

    for sentence in raw_sentences:
        cleaned = normalize_finding(
            sentence
        )

        # Remove report metadata/header material.
        cleaned = remove_report_metadata(
            cleaned
        )

        if not cleaned:
            continue

        if len(cleaned) < 15:
            continue

        lower = cleaned.lower()

        if not any(
            term in lower
            for term in finding_terms
        ):
            continue

        key = _finding_key(
            cleaned
        )

        if any(
            _is_substantially_duplicate(
                key,
                existing_key,
            )
            for existing_key in finding_keys
        ):
            continue

        finding_keys.append(key)

        findings.append(cleaned)

    return findings[:15]
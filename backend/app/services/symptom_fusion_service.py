from functools import lru_cache


CLASSIFIER_WEIGHT = 0.55
SEMANTIC_WEIGHT = 0.25
EVIDENCE_WEIGHT = 0.20


def normalize_condition_name(condition: str) -> str:
    return " ".join(
        condition.strip().lower().split()
    )


@lru_cache(maxsize=1)
def get_classifier():
    from app.api.predictions import get_model

    return get_model()


def get_classifier_predictions(
    text: str,
) -> dict[str, float]:
    from app.api.predictions import build_model_text

    model = get_classifier()

    model_text, _ = build_model_text(text)

    probabilities = model.predict_proba(
        [model_text]
    )[0]

    classes = model.classes_

    return {
        normalize_condition_name(
            str(condition)
        ): float(probability)
        for condition, probability in zip(
            classes,
            probabilities,
        )
    }


def get_semantic_predictions(
    text: str,
) -> list[dict]:
    from app.services.semantic_symptom_service import (
        predict_semantic,
    )

    return predict_semantic(
        text,
        top_k=22,
    )


def build_semantic_scores(
    semantic_predictions: list[dict],
) -> dict[str, float]:
    if not semantic_predictions:
        return {}

    similarities = [
        float(item["similarity"])
        for item in semantic_predictions
    ]

    minimum = min(similarities)
    maximum = max(similarities)

    if maximum == minimum:
        return {}

    scores = {}

    for item in semantic_predictions:
        condition = normalize_condition_name(
            item["condition"]
        )

        similarity = float(
            item["similarity"]
        )

        score = (
            similarity - minimum
        ) / (
            maximum - minimum
        )

        scores[condition] = score

    return scores


def extract_symptoms(
    text: str,
) -> set[str]:
    from app.api.predictions import build_model_text

    _, normalized_symptoms = build_model_text(
        text
    )

    return {
        normalize_condition_name(symptom)
        for symptom in normalized_symptoms
    }


def build_evidence_score(
    condition: str,
    symptoms: set[str],
) -> float:

    condition = normalize_condition_name(
        condition
    )

    condition_evidence = {
        "migraine": {
            "headache",
            "vomiting",
            "nausea",
        },
        "bronchial asthma": {
            "cough",
            "difficulty breathing",
            "shortness of breath",
            "breathlessness",
        },
        "pneumonia": {
            "cough",
            "difficulty breathing",
            "shortness of breath",
            "fever",
            "chills",
            "chest pain",
        },
        "allergy": {
            "itching",
            "rash",
            "difficulty breathing",
            "shortness of breath",
        },
        "urinary tract infection": {
            "burning urination",
            "frequent urination",
            "urination",
        },
        "malaria": {
            "fever",
            "chills",
            "vomiting",
            "headache",
            "muscle pain",
            "body pain",
        },
        "dengue": {
            "fever",
            "chills",
            "headache",
            "body pain",
            "muscle pain",
            "rash",
        },
        "fungal infection": {
            "itching",
            "rash",
            "skin",
        },
        "psoriasis": {
            "itching",
            "rash",
            "skin",
        },
        "typhoid": {
            "fever",
            "headache",
            "vomiting",
            "abdominal pain",
            "stomach pain",
        },
        "hypertension": {
            "headache",
            "dizziness",
            "chest pain",
        },
        "chicken pox": {
            "rash",
            "itching",
            "fever",
        },
        "impetigo": {
            "rash",
            "skin",
        },
        "jaundice": {
            "fever",
            "vomiting",
        },
        "diabetes": {
            "frequent urination",
            "urination",
        },
        "common cold": {
            "cough",
            "headache",
        },
        "drug reaction": {
            "rash",
            "itching",
        },
    }

    expected = condition_evidence.get(
        condition
    )

    if not expected:
        return 0.0

    matched = expected.intersection(
        symptoms
    )

    if not matched:
        return 0.0

    return (
        len(matched) / len(expected)
    )


def predict_fused(
    text: str,
    top_k: int = 3,
) -> list[dict]:
    cleaned_text = " ".join(
        text.strip().split()
    )

    if not cleaned_text:
        return []

    classifier_scores = (
        get_classifier_predictions(
            cleaned_text
        )
    )

    semantic_predictions = (
        get_semantic_predictions(
            cleaned_text
        )
    )

    semantic_scores = (
        build_semantic_scores(
            semantic_predictions
        )
    )

    symptoms = extract_symptoms(
        cleaned_text
    )

    all_conditions = set(
        classifier_scores
    )

    all_conditions.update(
        semantic_scores
    )

    results = []

    for condition in all_conditions:
        classifier_score = (
            classifier_scores.get(
                condition,
                0.0,
            )
        )

        semantic_score = (
            semantic_scores.get(
                condition,
                0.0,
            )
        )

        evidence_score = (
            build_evidence_score(
                condition,
                symptoms,
            )
        )

        fused_score = (
            CLASSIFIER_WEIGHT
            * classifier_score
            + SEMANTIC_WEIGHT
            * semantic_score
            + EVIDENCE_WEIGHT
            * evidence_score
        )

        results.append(
            {
                "condition": condition,
                "classifier_score": round(
                    classifier_score,
                    4,
                ),
                "semantic_score": round(
                    semantic_score,
                    4,
                ),
                "evidence_score": round(
                    evidence_score,
                    4,
                ),
                "fused_score": round(
                    fused_score,
                    4,
                ),
            }
        )

    results.sort(
        key=lambda item: item[
            "fused_score"
        ],
        reverse=True,
    )

    return results[:top_k]
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "training" / "data"
TRAIN_FILE = DATA_DIR / "gretel_train.jsonl"


def _load_jsonl(path: Path):
    if not path.exists():
        raise FileNotFoundError(
            f"Semantic training data not found: {path}"
        )

    with path.open(
        "r",
        encoding="utf-8",
    ) as file:
        return [
            json.loads(line)
            for line in file
            if line.strip()
        ]


@lru_cache(maxsize=1)
def get_semantic_engine():
    rows = _load_jsonl(TRAIN_FILE)

    if not rows:
        raise RuntimeError(
            "Semantic training dataset is empty."
        )

    texts = [
        str(row["input_text"])
        for row in rows
        if row.get("input_text")
    ]

    labels = [
        str(row["output_text"])
        for row in rows
        if row.get("input_text")
    ]

    if not texts:
        raise RuntimeError(
            "Semantic training dataset contains no usable text."
        )

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
    )

    train_matrix = vectorizer.fit_transform(
        texts
    )

    return {
        "vectorizer": vectorizer,
        "train_matrix": train_matrix,
        "labels": labels,
    }


def predict_semantic(
    text: str,
    top_k: int = 3,
):
    cleaned_text = " ".join(
        text.strip().split()
    )

    if not cleaned_text:
        return []

    engine = get_semantic_engine()

    vectorizer = engine["vectorizer"]
    train_matrix = engine["train_matrix"]
    train_labels = engine["labels"]

    query_matrix = vectorizer.transform(
        [cleaned_text]
    )

    similarities = cosine_similarity(
        train_matrix,
        query_matrix,
    ).ravel()

    unique_labels = list(
        dict.fromkeys(train_labels)
    )

    ranked_conditions = []

    for label in unique_labels:
        indices = [
            index
            for index, train_label in enumerate(
                train_labels
            )
            if train_label == label
        ]

        if not indices:
            continue

        label_scores = similarities[
            indices
        ]

        top_count = min(
            5,
            len(label_scores),
        )

        strongest_scores = np.sort(
            label_scores
        )[-top_count:]

        condition_similarity = float(
            np.mean(strongest_scores)
        )

        ranked_conditions.append(
            {
                "condition": label,
                "similarity": condition_similarity,
            }
        )

    ranked_conditions.sort(
        key=lambda item: item["similarity"],
        reverse=True,
    )

    return ranked_conditions[:top_k]
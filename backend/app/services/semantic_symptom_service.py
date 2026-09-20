import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


MODEL_NAME = "NeuML/biomedbert-small-embeddings"

BASE_DIR = Path(__file__).resolve().parents[3]
DATA_DIR = BASE_DIR / "training" / "data"
TRAIN_FILE = DATA_DIR / "gretel_train.jsonl"


def _load_jsonl(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"Semantic training data not found: {path}")

    with path.open("r", encoding="utf-8") as file:
        return [json.loads(line) for line in file if line.strip()]


@lru_cache(maxsize=1)
def get_semantic_engine():
    rows = _load_jsonl(TRAIN_FILE)

    if not rows:
        raise RuntimeError("Semantic training dataset is empty.")

    texts = [row["input_text"] for row in rows]
    labels = [row["output_text"] for row in rows]

    model = SentenceTransformer(MODEL_NAME)

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False,
    )

    return {
        "model": model,
        "embeddings": np.asarray(embeddings, dtype=np.float32),
        "labels": labels,
    }


def predict_semantic(text: str, top_k: int = 3):
    cleaned_text = " ".join(text.strip().split())

    if not cleaned_text:
        return []

    engine = get_semantic_engine()

    model = engine["model"]
    train_embeddings = engine["embeddings"]
    train_labels = engine["labels"]

    query_embedding = model.encode(
        [cleaned_text],
        normalize_embeddings=True,
        show_progress_bar=False,
    )[0]

    similarities = np.dot(train_embeddings, query_embedding)

    unique_labels = list(dict.fromkeys(train_labels))
    ranked_conditions = []

    for label in unique_labels:
        indices = [
            index
            for index, train_label in enumerate(train_labels)
            if train_label == label
        ]

        label_scores = similarities[indices]

        # Use the strongest few matching descriptions for each condition.
        top_count = min(5, len(label_scores))
        strongest_scores = np.sort(label_scores)[-top_count:]

        condition_similarity = float(np.mean(strongest_scores))

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
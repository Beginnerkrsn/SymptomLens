import json
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "training" / "data"

TRAIN_FILE = DATA_DIR / "gretel_train.jsonl"
TEST_FILE = DATA_DIR / "gretel_test.jsonl"

MODEL_NAME = "NeuML/biomedbert-small-embeddings"


def load_jsonl(path):
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


print("Loading Gretel dataset...")

train_rows = load_jsonl(TRAIN_FILE)
test_rows = load_jsonl(TEST_FILE)

print(f"Training rows: {len(train_rows)}")
print(f"Test rows: {len(test_rows)}")

print("\nLoading BioMedBERT embedding model...")
model = SentenceTransformer(MODEL_NAME)

print("Encoding training descriptions...")

train_texts = [row["input_text"] for row in train_rows]
train_labels = [row["output_text"] for row in train_rows]

train_embeddings = model.encode(
    train_texts,
    normalize_embeddings=True,
    batch_size=32,
    show_progress_bar=True,
)

print("\nEncoding test descriptions...")

test_texts = [row["input_text"] for row in test_rows]
test_labels = [row["output_text"] for row in test_rows]

test_embeddings = model.encode(
    test_texts,
    normalize_embeddings=True,
    batch_size=32,
    show_progress_bar=True,
)

train_embeddings = np.asarray(train_embeddings)
test_embeddings = np.asarray(test_embeddings)

print("\nRunning semantic nearest-neighbor test...")

correct = 0

for i, test_embedding in enumerate(test_embeddings):
    similarities = np.dot(train_embeddings, test_embedding)

    best_index = int(np.argmax(similarities))
    predicted_label = train_labels[best_index]
    actual_label = test_labels[i]

    if predicted_label == actual_label:
        correct += 1

accuracy = correct / len(test_rows)

print("\n==============================")
print("SEMANTIC BENCHMARK")
print("==============================")
print(f"Correct:  {correct}/{len(test_rows)}")
print(f"Accuracy: {accuracy * 100:.2f}%")
print("==============================")

print("\nSample predictions:")

for i in range(min(10, len(test_rows))):
    similarities = np.dot(train_embeddings, test_embeddings[i])
    best_index = int(np.argmax(similarities))

    print(f"\nExample {i + 1}")
    print(f"Text:       {test_texts[i]}")
    print(f"Actual:     {test_labels[i]}")
    print(f"Predicted:  {train_labels[best_index]}")
    print(f"Similarity: {similarities[best_index]:.3f}")
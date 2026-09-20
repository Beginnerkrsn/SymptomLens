from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import train_test_split
from transformers import AutoModel, AutoTokenizer


BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "data" / "specialty_training.csv"
ARTIFACT_DIR = BASE_DIR / "artifacts"
REPORT_DIR = BASE_DIR / "reports"

ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_NAME = "emilyalsentzer/Bio_ClinicalBERT"

# CPU-safe settings.
MAX_LENGTH = 128
BATCH_SIZE = 4


def mean_pool(last_hidden_state, attention_mask):
    mask = attention_mask.unsqueeze(-1).expand(
        last_hidden_state.size()
    ).float()

    masked_embeddings = (
        last_hidden_state * mask
    )

    summed = masked_embeddings.sum(dim=1)

    counts = torch.clamp(
        mask.sum(dim=1),
        min=1e-9,
    )

    return summed / counts


def encode_texts(texts, tokenizer, model):
    all_embeddings = []

    model.eval()

    for start in range(
        0,
        len(texts),
        BATCH_SIZE,
    ):
        batch_texts = texts[
            start:start + BATCH_SIZE
        ]

        encoded = tokenizer(
            batch_texts,
            padding=True,
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt",
        )

        with torch.no_grad():
            outputs = model(
                **encoded
            )

        embeddings = mean_pool(
            outputs.last_hidden_state,
            encoded["attention_mask"],
        )

        all_embeddings.append(
            embeddings.cpu().numpy()
        )

        if (
            start == 0
            or (start // BATCH_SIZE) % 50 == 0
        ):
            print(
                f"Encoded "
                f"{min(start + BATCH_SIZE, len(texts))}"
                f"/{len(texts)}"
            )

    return np.vstack(
        all_embeddings
    )


def main():
    print("=" * 80)
    print("CLINICAL LANGUAGE EMBEDDING BENCHMARK")
    print("=" * 80)

    print(f"\nModel: {MODEL_NAME}")
    print(f"Device: CPU")
    print(f"Max tokens per report: {MAX_LENGTH}")
    print(f"Batch size: {BATCH_SIZE}")

    # ---------------------------------------------------------------
    # Load dataset
    # ---------------------------------------------------------------

    df = pd.read_csv(
        DATA_FILE
    )

    df = df.dropna(
        subset=[
            "specialty",
            "clinical_text",
        ]
    ).copy()

    df["specialty"] = (
        df["specialty"]
        .astype(str)
        .str.strip()
    )

    df["clinical_text"] = (
        df["clinical_text"]
        .astype(str)
        .str.strip()
    )

    df = df[
        (df["specialty"] != "")
        & (df["clinical_text"] != "")
    ].copy()

    print(
        f"\nTotal reports: {len(df)}"
    )

    # ---------------------------------------------------------------
    # Split BEFORE embedding to avoid accidental evaluation leakage.
    # ---------------------------------------------------------------

    train_texts, test_texts, y_train, y_test = (
        train_test_split(
            df["clinical_text"].tolist(),
            df["specialty"].tolist(),
            test_size=0.20,
            random_state=42,
            stratify=df["specialty"],
        )
    )

    print(
        f"Training reports: {len(train_texts)}"
    )

    print(
        f"Testing reports : {len(test_texts)}"
    )

    # ---------------------------------------------------------------
    # Load tokenizer/model
    # ---------------------------------------------------------------

    print("\nLoading Bio_ClinicalBERT...")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME
    )

    clinical_model = AutoModel.from_pretrained(
        MODEL_NAME
    )

    clinical_model.eval()

    print("Clinical language model loaded.")

    # ---------------------------------------------------------------
    # Generate embeddings
    # ---------------------------------------------------------------

    print("\nEncoding training reports...")

    X_train = encode_texts(
        train_texts,
        tokenizer,
        clinical_model,
    )

    print("\nEncoding testing reports...")

    X_test = encode_texts(
        test_texts,
        tokenizer,
        clinical_model,
    )

    print(
        f"\nEmbedding shape: {X_train.shape}"
    )

    # ---------------------------------------------------------------
    # Train classifier
    # ---------------------------------------------------------------

    print("\nTraining Logistic Regression...")

    classifier = LogisticRegression(
        C=3.0,
        max_iter=3000,
        class_weight="balanced",
        solver="lbfgs",
        random_state=42,
    )

    classifier.fit(
        X_train,
        y_train,
    )

    predictions = classifier.predict(
        X_test
    )

    probabilities = classifier.predict_proba(
        X_test
    )

    # ---------------------------------------------------------------
    # Evaluation
    # ---------------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    macro_f1 = f1_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0,
    )

    weighted_f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0,
    )

    print("\n" + "=" * 80)
    print("CLINICAL EMBEDDING MODEL EVALUATION")
    print("=" * 80)

    print(
        f"\nAccuracy    : {accuracy:.4f}"
    )

    print(
        f"Macro F1    : {macro_f1:.4f}"
    )

    print(
        f"Weighted F1 : {weighted_f1:.4f}"
    )

    print("\nClassification report:")

    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0,
        )
    )

    # ---------------------------------------------------------------
    # Save metrics
    # ---------------------------------------------------------------

    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0,
    )

    pd.DataFrame(
        report
    ).transpose().to_csv(
        REPORT_DIR /
        "clinical_embedding_classification_report.csv"
    )

    pd.DataFrame(
        [
            {
                "model": "Bio_ClinicalBERT embeddings + Logistic Regression",
                "accuracy": accuracy,
                "macro_f1": macro_f1,
                "weighted_f1": weighted_f1,
            }
        ]
    ).to_csv(
        REPORT_DIR /
        "clinical_embedding_model_metrics.csv",
        index=False,
    )

    # ---------------------------------------------------------------
    # Save classifier and label information
    # ---------------------------------------------------------------

    classifier_file = (
        ARTIFACT_DIR /
        "clinical_embedding_classifier.joblib"
    )

    joblib.dump(
        classifier,
        classifier_file,
    )

    print("\nClassifier saved:")
    print(classifier_file)

    # ---------------------------------------------------------------
    # Dynamic examples
    # ---------------------------------------------------------------

    examples = [
        (
            "Echocardiogram shows left atrial enlargement "
            "with mild mitral regurgitation and reduced "
            "ventricular function."
        ),
        (
            "MRI of the brain demonstrates abnormalities "
            "involving the cerebral structures."
        ),
        (
            "The patient has elevated creatinine and "
            "reduced estimated glomerular filtration rate."
        ),
        (
            "Persistent abdominal pain with reflux and "
            "upper gastrointestinal symptoms."
        ),
    ]

    print("\n" + "=" * 80)
    print("DYNAMIC CLINICAL EXAMPLES")
    print("=" * 80)

    example_embeddings = encode_texts(
        examples,
        tokenizer,
        clinical_model,
    )

    example_probabilities = (
        classifier.predict_proba(
            example_embeddings
        )
    )

    classes = classifier.classes_

    for text, probs in zip(
        examples,
        example_probabilities,
    ):
        top_indices = probs.argsort()[::-1][:3]

        print("\nReport:")
        print(text)

        print("\nTop specialties:")

        for rank, index in enumerate(
            top_indices,
            start=1,
        ):
            print(
                f"{rank}. "
                f"{classes[index]} "
                f"({probs[index] * 100:.2f}%)"
            )

    print("\n" + "=" * 80)
    print("CLINICAL EMBEDDING BENCHMARK COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
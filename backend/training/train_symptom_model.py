from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "data" / "cleaned_Symptom2Disease.csv"
ARTIFACT_DIR = BASE_DIR / "artifacts"
REPORT_DIR = BASE_DIR / "reports"

ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("=" * 80)
    print("SYMPTOM MODEL TRAINING")
    print("=" * 80)

    # Load cleaned dataset
    df = pd.read_csv(DATA_FILE)

    # Make sure required columns exist
    required_columns = {"label", "text"}

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
        )

    # Remove empty values just in case
    df = df.dropna(subset=["label", "text"]).copy()

    df["label"] = df["label"].astype(str)
    df["text"] = df["text"].astype(str)

    X = df["text"]
    y = df["label"]

    print(f"\nTotal samples : {len(df)}")
    print(f"Classes       : {y.nunique()}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"Training samples : {len(X_train)}")
    print(f"Testing samples  : {len(X_test)}")

    # TF-IDF text representation
    vectorizer = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        max_df=0.98,
        max_features=30000,
    )

    # Multiclass Logistic Regression
    #
    # lbfgs supports the 24-class multiclass problem.
    # It also gives probability estimates that we can use
    # later for confidence-aware dynamic predictions.
    classifier = LogisticRegression(
        C=4.0,
        max_iter=3000,
        class_weight="balanced",
        solver="lbfgs",
        random_state=42,
    )

    # Complete ML pipeline
    model = Pipeline(
        [
            ("tfidf", vectorizer),
            ("classifier", classifier),
        ]
    )

    print("\nTraining model...")

    model.fit(X_train, y_train)

    print("Training finished.")

    # Predictions
    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)

    # Overall accuracy
    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    print("\n" + "=" * 80)
    print("MODEL EVALUATION")
    print("=" * 80)

    print(f"\nAccuracy: {accuracy:.4f}")
    print(f"Accuracy percentage: {accuracy * 100:.2f}%")

    # Classification report
    report_text = classification_report(
        y_test,
        predictions,
        zero_division=0,
    )

    print("\nClassification report:")
    print(report_text)

    # Save detailed classification report
    report_dict = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0,
    )

    report_df = pd.DataFrame(report_dict).transpose()

    report_file = REPORT_DIR / "symptom_classification_report.csv"

    report_df.to_csv(
        report_file
    )

    # Confusion matrix
    labels = sorted(y.unique())

    cm = confusion_matrix(
        y_test,
        predictions,
        labels=labels,
    )

    cm_df = pd.DataFrame(
        cm,
        index=labels,
        columns=labels,
    )

    confusion_file = REPORT_DIR / "symptom_confusion_matrix.csv"

    cm_df.to_csv(
        confusion_file
    )

    # Save the trained model
    model_file = ARTIFACT_DIR / "symptom_model.joblib"

    joblib.dump(
        model,
        model_file,
    )

    print("\nSaved files:")

    print(f"Model:")
    print(model_file)

    print(f"\nClassification report:")
    print(report_file)

    print(f"\nConfusion matrix:")
    print(confusion_file)

    # ------------------------------------------------------------------
    # Dynamic prediction demonstration
    # ------------------------------------------------------------------

    print("\n" + "=" * 80)
    print("DYNAMIC PREDICTION EXAMPLES")
    print("=" * 80)

    sample_texts = [
        "I have a high fever, body pain and chills.",
        "I have an itchy red skin rash with dry scales.",
        "I have burning while urinating and frequent urination.",
    ]

    classes = model.classes_

    for text in sample_texts:
        probabilities = model.predict_proba([text])[0]

        top_indices = probabilities.argsort()[::-1][:3]

        print("\nInput:")
        print(text)

        print("\nTop predictions:")

        for rank, index in enumerate(
            top_indices,
            start=1,
        ):
            disease = classes[index]
            confidence = probabilities[index] * 100

            print(
                f"{rank}. {disease} "
                f"({confidence:.2f}%)"
            )

    print("\n" + "=" * 80)
    print("SYMPTOM MODEL TRAINING COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
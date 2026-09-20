from pathlib import Path

import joblib
import pandas as pd

from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC


BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "data" / "cleaned_Symptom2Disease.csv"
ARTIFACT_DIR = BASE_DIR / "artifacts"
REPORT_DIR = BASE_DIR / "reports"

ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


def build_features():
    word_features = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        analyzer="word",
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        max_df=0.98,
        max_features=30000,
    )

    char_features = TfidfVectorizer(
        lowercase=True,
        analyzer="char_wb",
        ngram_range=(3, 5),
        sublinear_tf=True,
        min_df=1,
        max_features=30000,
    )

    return FeatureUnion(
        [
            ("word_tfidf", word_features),
            ("char_tfidf", char_features),
        ]
    )


def evaluate_model(name, model, X_train, X_test, y_train, y_test):
    print("\n" + "=" * 80)
    print(name)
    print("=" * 80)

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

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

    print(f"Accuracy    : {accuracy:.4f}")
    print(f"Macro F1    : {macro_f1:.4f}")
    print(f"Weighted F1 : {weighted_f1:.4f}")

    print("\nClassification report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0,
        )
    )

    metrics = {
        "model": name,
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
    }

    return model, metrics


def main():
    print("=" * 80)
    print("SYMPTOM MODEL COMPARISON")
    print("=" * 80)

    df = pd.read_csv(DATA_FILE)

    df = df.dropna(
        subset=["text", "label"]
    ).copy()

    X = df["text"].astype(str)
    y = df["label"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    # ------------------------------------------------------------------
    # MODEL A: TF-IDF + Logistic Regression
    # ------------------------------------------------------------------

    logistic_model = Pipeline(
        [
            (
                "features",
                build_features(),
            ),
            (
                "classifier",
                LogisticRegression(
                    C=4.0,
                    max_iter=3000,
                    class_weight="balanced",
                    solver="lbfgs",
                    random_state=42,
                ),
            ),
        ]
    )

    logistic_model, logistic_metrics = evaluate_model(
        "MODEL A - TF-IDF + Logistic Regression",
        logistic_model,
        X_train,
        X_test,
        y_train,
        y_test,
    )

    # ------------------------------------------------------------------
    # MODEL B: TF-IDF + Calibrated Linear SVM
    # ------------------------------------------------------------------

    svm_base = LinearSVC(
        C=1.0,
        class_weight="balanced",
        random_state=42,
    )

    svm_model = Pipeline(
        [
            (
                "features",
                build_features(),
            ),
            (
                "classifier",
                CalibratedClassifierCV(
                    estimator=svm_base,
                    method="sigmoid",
                    cv=5,
                ),
            ),
        ]
    )

    svm_model, svm_metrics = evaluate_model(
        "MODEL B - TF-IDF + Calibrated Linear SVM",
        svm_model,
        X_train,
        X_test,
        y_train,
        y_test,
    )

    # ------------------------------------------------------------------
    # Compare
    # ------------------------------------------------------------------

    results = pd.DataFrame(
        [
            logistic_metrics,
            svm_metrics,
        ]
    )

    results_file = REPORT_DIR / "symptom_model_comparison.csv"

    results.to_csv(
        results_file,
        index=False,
    )

    print("\n" + "=" * 80)
    print("MODEL COMPARISON")
    print("=" * 80)

    print(
        results.to_string(
            index=False
        )
    )

    # Choose primarily by macro F1.
    # Macro F1 gives every disease class equal importance.
    best_index = results["macro_f1"].idxmax()

    best_name = results.loc[
        best_index,
        "model",
    ]

    best_model = (
        logistic_model
        if best_name.startswith("MODEL A")
        else svm_model
    )

    best_model_file = (
        ARTIFACT_DIR / "symptom_model_best.joblib"
    )

    joblib.dump(
        best_model,
        best_model_file,
    )

    print("\nBest model:")
    print(best_name)

    print("\nSaved:")
    print(best_model_file)

    # ------------------------------------------------------------------
    # Confidence examples
    # ------------------------------------------------------------------

    sample_texts = [
        "I have a high fever, body pain and chills.",
        "I have an itchy red skin rash with dry scales.",
        "I have burning while urinating and frequent urination.",
    ]

    print("\n" + "=" * 80)
    print("CONFIDENCE CHECK")
    print("=" * 80)

    classes = best_model.classes_

    for text in sample_texts:
        probabilities = best_model.predict_proba([text])[0]

        top_indices = probabilities.argsort()[::-1][:3]

        print("\nInput:")
        print(text)

        for rank, index in enumerate(
            top_indices,
            start=1,
        ):
            print(
                f"{rank}. {classes[index]} "
                f"{probabilities[index] * 100:.2f}%"
            )


if __name__ == "__main__":
    main()
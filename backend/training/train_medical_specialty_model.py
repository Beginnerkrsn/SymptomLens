from pathlib import Path

import joblib
import pandas as pd

from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.svm import LinearSVC


BASE_DIR = Path(__file__).resolve().parent

DATA_FILE = BASE_DIR / "data" / "specialty_training.csv"
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
        min_df=2,
        max_df=0.98,
        max_features=50000,
    )

    char_features = TfidfVectorizer(
        lowercase=True,
        analyzer="char_wb",
        ngram_range=(3, 5),
        sublinear_tf=True,
        min_df=2,
        max_features=50000,
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

    print("\nTraining...")
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

    print(f"\nAccuracy    : {accuracy:.4f}")
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

    return {
        "name": name,
        "model": model,
        "predictions": predictions,
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
    }


def main():
    print("=" * 80)
    print("MEDICAL SPECIALTY MODEL - CLEAN DATASET")
    print("=" * 80)

    df = pd.read_csv(DATA_FILE)

    required_columns = {
        "specialty",
        "clinical_text",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {sorted(missing_columns)}"
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

    print(f"\nTotal reports : {len(df)}")
    print(
        f"Specialties   : {df['specialty'].nunique()}"
    )

    print("\nSpecialty counts:")
    print(
        df["specialty"]
        .value_counts()
        .to_string()
    )

    X = df["clinical_text"]
    y = df["specialty"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"\nTraining reports : {len(X_train)}")
    print(f"Testing reports  : {len(X_test)}")

    # ---------------------------------------------------------------
    # MODEL A
    # ---------------------------------------------------------------

    logistic_model = Pipeline(
        [
            (
                "features",
                build_features(),
            ),
            (
                "classifier",
                LogisticRegression(
                    C=3.0,
                    max_iter=4000,
                    class_weight="balanced",
                    solver="lbfgs",
                    random_state=42,
                ),
            ),
        ]
    )

    logistic_result = evaluate_model(
        "MODEL A - TF-IDF + LOGISTIC REGRESSION",
        logistic_model,
        X_train,
        X_test,
        y_train,
        y_test,
    )

    # ---------------------------------------------------------------
    # MODEL B
    # ---------------------------------------------------------------

    svm_model = Pipeline(
        [
            (
                "features",
                build_features(),
            ),
            (
                "classifier",
                CalibratedClassifierCV(
                    estimator=LinearSVC(
                        C=1.0,
                        class_weight="balanced",
                        random_state=42,
                    ),
                    method="sigmoid",
                    cv=3,
                ),
            ),
        ]
    )

    svm_result = evaluate_model(
        "MODEL B - TF-IDF + CALIBRATED LINEAR SVM",
        svm_model,
        X_train,
        X_test,
        y_train,
        y_test,
    )

    # ---------------------------------------------------------------
    # MODEL COMPARISON
    # ---------------------------------------------------------------

    results = pd.DataFrame(
        [
            {
                "model": logistic_result["name"],
                "accuracy": logistic_result["accuracy"],
                "macro_f1": logistic_result["macro_f1"],
                "weighted_f1": logistic_result["weighted_f1"],
            },
            {
                "model": svm_result["name"],
                "accuracy": svm_result["accuracy"],
                "macro_f1": svm_result["macro_f1"],
                "weighted_f1": svm_result["weighted_f1"],
            },
        ]
    )

    print("\n" + "=" * 80)
    print("MODEL COMPARISON")
    print("=" * 80)

    print(
        results.to_string(
            index=False
        )
    )

    results.to_csv(
        REPORT_DIR / "medical_model_comparison.csv",
        index=False,
    )

    # Select by macro F1.
    if (
        logistic_result["macro_f1"]
        >= svm_result["macro_f1"]
    ):
        best_result = logistic_result
    else:
        best_result = svm_result

    best_model = best_result["model"]

    print("\n" + "=" * 80)
    print("SELECTED MODEL")
    print("=" * 80)

    print(best_result["name"])

    # ---------------------------------------------------------------
    # Detailed evaluation of the selected model
    # ---------------------------------------------------------------

    best_predictions = best_result["predictions"]

    report = classification_report(
        y_test,
        best_predictions,
        output_dict=True,
        zero_division=0,
    )

    report_df = (
        pd.DataFrame(report)
        .transpose()
    )

    report_file = (
        REPORT_DIR /
        "medical_specialty_classification_report.csv"
    )

    report_df.to_csv(
        report_file
    )

    # Confusion matrix
    labels = sorted(
        y.unique()
    )

    confusion = confusion_matrix(
        y_test,
        best_predictions,
        labels=labels,
    )

    confusion_df = pd.DataFrame(
        confusion,
        index=labels,
        columns=labels,
    )

    confusion_file = (
        REPORT_DIR /
        "medical_specialty_confusion_matrix.csv"
    )

    confusion_df.to_csv(
        confusion_file
    )

    # ---------------------------------------------------------------
    # Save model
    # ---------------------------------------------------------------

    model_file = (
        ARTIFACT_DIR /
        "medical_specialty_model_best.joblib"
    )

    joblib.dump(
        best_model,
        model_file,
    )

    print("\nSaved model:")
    print(model_file)

    print("\nSaved classification report:")
    print(report_file)

    print("\nSaved confusion matrix:")
    print(confusion_file)

    # ---------------------------------------------------------------
    # Dynamic prediction examples
    # ---------------------------------------------------------------

    print("\n" + "=" * 80)
    print("DYNAMIC MEDICAL REPORT EXAMPLES")
    print("=" * 80)

    examples = [
        (
            "Echocardiogram shows left atrial enlargement, "
            "mild mitral regurgitation and reduced ventricular function."
        ),
        (
            "MRI of the brain demonstrates findings involving "
            "the cerebral structures and neurological examination."
        ),
        (
            "Patient has chronic kidney disease with elevated "
            "creatinine and reduced estimated glomerular filtration rate."
        ),
        (
            "Patient reports persistent abdominal pain, reflux, "
            "and upper gastrointestinal symptoms."
        ),
    ]

    classes = best_model.classes_

    for text in examples:
        probabilities = best_model.predict_proba(
            [text]
        )[0]

        top_indices = probabilities.argsort()[::-1][:3]

        print("\nReport text:")
        print(text)

        print("\nTop specialties:")

        for rank, index in enumerate(
            top_indices,
            start=1,
        ):
            specialty = classes[index]
            confidence = (
                probabilities[index] * 100
            )

            print(
                f"{rank}. {specialty} "
                f"({confidence:.2f}%)"
            )

    print("\n" + "=" * 80)
    print("MEDICAL SPECIALTY MODEL TRAINING COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
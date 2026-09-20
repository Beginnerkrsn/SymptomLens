import re
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
REPORT_DIR = BASE_DIR / "reports"

SYMPTOM_FILE = DATA_DIR / "Symptom2Disease.csv"
MEDICAL_FILE = DATA_DIR / "mtsamples.csv"


def clean_whitespace(text):
    if pd.isna(text):
        return ""

    text = str(text)
    text = text.replace("\n", " ")
    text = text.replace("\r", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def save_class_distribution(df, label_column, filename):
    distribution = (
        df[label_column]
        .value_counts()
        .rename_axis(label_column)
        .reset_index(name="count")
    )

    distribution["percentage"] = (
        distribution["count"] / len(df) * 100
    ).round(2)

    distribution.to_csv(REPORT_DIR / filename, index=False)

    return distribution


def prepare_symptom_dataset():
    print("\n" + "=" * 80)
    print("PREPARING SYMPTOM2DISEASE")
    print("=" * 80)

    df = pd.read_csv(SYMPTOM_FILE)

    original_rows = len(df)

    # Remove automatically generated index columns.
    df = df.drop(
        columns=[column for column in df.columns if column.startswith("Unnamed")],
        errors="ignore",
    )

    # Keep only the columns required for symptom classification.
    df = df[["label", "text"]].copy()

    df["label"] = df["label"].apply(clean_whitespace)
    df["text"] = df["text"].apply(clean_whitespace)

    # Remove empty records.
    df = df[
        (df["label"] != "")
        & (df["text"] != "")
    ].copy()

    after_empty_removal = len(df)

    # Remove duplicate symptom descriptions.
    df = df.drop_duplicates(
        subset=["text", "label"]
    ).reset_index(drop=True)

    duplicates_removed = after_empty_removal - len(df)

    output_file = DATA_DIR / "cleaned_Symptom2Disease.csv"
    df.to_csv(output_file, index=False)

    distribution = save_class_distribution(
        df,
        "label",
        "symptom_class_distribution.csv",
    )

    print(f"\nOriginal rows              : {original_rows}")
    print(f"Rows after cleaning        : {len(df)}")
    print(f"Duplicate rows removed     : {duplicates_removed}")
    print(f"Number of diseases/classes : {df['label'].nunique()}")

    print("\nDisease distribution:")
    print(distribution.to_string(index=False))

    print(f"\nSaved cleaned dataset:")
    print(output_file)

    return df


def prepare_medical_dataset():
    print("\n" + "=" * 80)
    print("PREPARING MEDICAL TRANSCRIPTIONS")
    print("=" * 80)

    df = pd.read_csv(MEDICAL_FILE)

    original_rows = len(df)

    # Remove automatically generated index columns.
    df = df.drop(
        columns=[column for column in df.columns if column.startswith("Unnamed")],
        errors="ignore",
    )

    # We deliberately do NOT use sample_name as a model feature.
    # We also do not depend on keywords because many records have them missing.
    required_columns = [
        "description",
        "medical_specialty",
        "transcription",
    ]

    df = df[required_columns].copy()

    # Clean individual fields.
    for column in required_columns:
        df[column] = df[column].apply(clean_whitespace)

    # A specialty must exist.
    df = df[df["medical_specialty"] != ""].copy()

    after_specialty_filter = len(df)

    # A medical report needs actual transcription text.
    df = df[df["transcription"] != ""].copy()

    missing_transcription_removed = (
        after_specialty_filter - len(df)
    )

    # Create the clinical text used by the classifier.
    #
    # We use description + transcription.
    # We do NOT use sample_name or the target specialty itself.
    df["clinical_text"] = (
        df["description"]
        + ". "
        + df["transcription"]
    ).apply(clean_whitespace)

    # Remove records where the resulting clinical text is empty.
    df = df[df["clinical_text"] != ""].copy()

    # Remove exact duplicate clinical records.
    before_duplicate_removal = len(df)

    df = df.drop_duplicates(
        subset=["clinical_text", "medical_specialty"]
    ).reset_index(drop=True)

    duplicates_removed = (
        before_duplicate_removal - len(df)
    )

    output = df[
        [
            "medical_specialty",
            "clinical_text",
        ]
    ].copy()

    output_file = DATA_DIR / "cleaned_mtsamples.csv"
    output.to_csv(output_file, index=False)

    distribution = save_class_distribution(
        output,
        "medical_specialty",
        "specialty_class_distribution.csv",
    )

    print(f"\nOriginal rows                    : {original_rows}")
    print(f"Rows after specialty filtering  : {after_specialty_filter}")
    print(f"Missing transcription removed   : {missing_transcription_removed}")
    print(f"Duplicate records removed       : {duplicates_removed}")
    print(f"Rows remaining                  : {len(output)}")
    print(f"Number of specialties/classes   : {output['medical_specialty'].nunique()}")

    print("\nSpecialty distribution:")
    print(distribution.to_string(index=False))

    print("\nSmall specialty classes:")
    small_classes = distribution[
        distribution["count"] < 10
    ]

    if len(small_classes) == 0:
        print("No specialty has fewer than 10 records.")
    else:
        print(small_classes.to_string(index=False))

    print(f"\nSaved cleaned dataset:")
    print(output_file)

    return output


def main():
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    symptom_df = prepare_symptom_dataset()
    medical_df = prepare_medical_dataset()

    print("\n" + "=" * 80)
    print("DATASET PREPARATION COMPLETE")
    print("=" * 80)

    print("\nOutput files created:")

    print(
        f"1. {DATA_DIR / 'cleaned_Symptom2Disease.csv'}"
    )

    print(
        f"2. {DATA_DIR / 'cleaned_mtsamples.csv'}"
    )

    print(
        f"3. {REPORT_DIR / 'symptom_class_distribution.csv'}"
    )

    print(
        f"4. {REPORT_DIR / 'specialty_class_distribution.csv'}"
    )


if __name__ == "__main__":
    main()
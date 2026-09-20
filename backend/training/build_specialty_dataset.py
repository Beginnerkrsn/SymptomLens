from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent

DATA_DIR = BASE_DIR / "data"
REPORT_DIR = BASE_DIR / "reports"

INPUT_FILE = DATA_DIR / "cleaned_mtsamples.csv"

OUTPUT_FILE = DATA_DIR / "specialty_training.csv"
DISTRIBUTION_FILE = REPORT_DIR / "specialty_training_distribution.csv"


def main():
    print("=" * 80)
    print("BUILDING CLEAN MEDICAL SPECIALTY DATASET")
    print("=" * 80)

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{INPUT_FILE}"
        )

    df = pd.read_csv(INPUT_FILE)

    required_columns = {
        "medical_specialty",
        "clinical_text",
    }

    missing_columns = required_columns - set(df.columns)

    if missing_columns:
        raise ValueError(
            f"Missing columns: {sorted(missing_columns)}"
        )

    df = df.dropna(
        subset=[
            "medical_specialty",
            "clinical_text",
        ]
    ).copy()

    df["medical_specialty"] = (
        df["medical_specialty"]
        .astype(str)
        .str.strip()
    )

    df["clinical_text"] = (
        df["clinical_text"]
        .astype(str)
        .str.strip()
    )

    df = df[
        (df["medical_specialty"] != "")
        & (df["clinical_text"] != "")
    ].copy()

    print(f"\nStarting records: {len(df)}")
    print(
        f"Starting categories: "
        f"{df['medical_specialty'].nunique()}"
    )

    # ------------------------------------------------------------------
    # CLINICALLY USEFUL SPECIALTIES
    #
    # We deliberately exclude document/encounter categories such as:
    # Consult - History and Phy.
    # SOAP / Chart / Progress Notes
    # Discharge Summary
    # Office Notes
    # Letters
    # Emergency Room Reports
    #
    # We also exclude extremely small categories because there is not
    # enough data to evaluate them reliably.
    # ------------------------------------------------------------------

    selected_specialties = {
        "Surgery": "Surgery",
        "Cardiovascular / Pulmonary": "Cardiovascular / Pulmonary",
        "Orthopedic": "Orthopedics",
        "Radiology": "Radiology",
        "General Medicine": "General Medicine",
        "Gastroenterology": "Gastroenterology",
        "Neurology": "Neurology",
        "Urology": "Urology",
        "Obstetrics / Gynecology": "Obstetrics and Gynecology",
        "ENT - Otolaryngology": "ENT / Otolaryngology",
        "Neurosurgery": "Neurosurgery",
        "Hematology - Oncology": "Hematology / Oncology",
        "Ophthalmology": "Ophthalmology",
        "Nephrology": "Nephrology",
        "Pain Management": "Pain Management",
        "Psychiatry / Psychology": "Psychiatry / Psychology",
    }

    df = df[
        df["medical_specialty"].isin(
            selected_specialties.keys()
        )
    ].copy()

    # Convert the dataset labels into cleaner application labels.
    df["specialty"] = df["medical_specialty"].map(
        selected_specialties
    )

    # ------------------------------------------------------------------
    # Remove exact duplicate clinical text within a specialty.
    # ------------------------------------------------------------------

    before_duplicates = len(df)

    df = df.drop_duplicates(
        subset=[
            "specialty",
            "clinical_text",
        ]
    ).reset_index(drop=True)

    duplicates_removed = (
        before_duplicates - len(df)
    )

    # ------------------------------------------------------------------
    # Remove extremely short text.
    # ------------------------------------------------------------------

    df["text_length"] = (
        df["clinical_text"]
        .str.len()
    )

    before_short_text = len(df)

    df = df[
        df["text_length"] >= 80
    ].copy()

    short_records_removed = (
        before_short_text - len(df)
    )

    df = df.drop(
        columns=["text_length"]
    )

    # ------------------------------------------------------------------
    # Distribution
    # ------------------------------------------------------------------

    distribution = (
        df["specialty"]
        .value_counts()
        .rename_axis("specialty")
        .reset_index(name="count")
    )

    distribution["percentage"] = (
        distribution["count"]
        / len(df)
        * 100
    ).round(2)

    distribution.to_csv(
        DISTRIBUTION_FILE,
        index=False,
    )

    # ------------------------------------------------------------------
    # Save final training dataset
    # ------------------------------------------------------------------

    final_df = df[
        [
            "specialty",
            "clinical_text",
        ]
    ].copy()

    final_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print("\n" + "=" * 80)
    print("FINAL SPECIALTY DATASET")
    print("=" * 80)

    print(
        f"\nRecords retained : {len(final_df)}"
    )

    print(
        f"Specialties      : "
        f"{final_df['specialty'].nunique()}"
    )

    print(
        f"Duplicates removed: "
        f"{duplicates_removed}"
    )

    print(
        f"Short records removed: "
        f"{short_records_removed}"
    )

    print("\nSpecialty distribution:")
    print(
        distribution.to_string(
            index=False
        )
    )

    print("\nSaved dataset:")
    print(OUTPUT_FILE)

    print("\nSaved distribution:")
    print(DISTRIBUTION_FILE)

    print("\n" + "=" * 80)
    print("DATASET BUILD COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
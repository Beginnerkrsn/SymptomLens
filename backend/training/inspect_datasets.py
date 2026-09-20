import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

symptom_file = DATA_DIR / "Symptom2Disease.csv"
medical_file = DATA_DIR / "mtsamples.csv"


def inspect_dataset(name, file_path):
    print("\n" + "=" * 70)
    print(name)
    print("=" * 70)

    if not file_path.exists():
        print(f"ERROR: File not found: {file_path}")
        return

    df = pd.read_csv(file_path)

    print(f"\nFile: {file_path.name}")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    print("\nColumn names:")
    for column in df.columns:
        print(f"  - {column}")

    print("\nFirst 5 rows:")
    print(df.head().to_string())

    print("\nMissing values:")
    print(df.isnull().sum().to_string())

    print(f"\nDuplicate rows: {df.duplicated().sum()}")

    print("\nData types:")
    print(df.dtypes.to_string())

    print("\nUnique values per column:")
    for column in df.columns:
        print(f"  {column}: {df[column].nunique()}")


inspect_dataset("SYMPTOM2DISEASE DATASET", symptom_file)
inspect_dataset("MEDICAL TRANSCRIPTIONS DATASET", medical_file)
from PIL import Image
import pytesseract


def main():
    image_path = "tests/test_report.png"

    image = Image.open(image_path).convert("RGB")

    text = pytesseract.image_to_string(
        image,
        lang="eng",
    )

    print("=" * 80)
    print("OCR RESULT")
    print("=" * 80)

    print(text)


if __name__ == "__main__":
    main()
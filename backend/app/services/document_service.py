from pathlib import Path

import pymupdf
from PIL import Image


SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


def validate_file_extension(filename: str) -> None:
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. "
            "Only PDF, JPG, JPEG, and PNG files are allowed."
        )


def extract_pdf_text(file_path: str) -> str:
    document = pymupdf.open(file_path)

    pages = []

    try:
        for page in document:
            text = page.get_text("text")

            if text:
                pages.append(text)

    finally:
        document.close()

    return "\n".join(pages).strip()


def render_pdf_pages(file_path: str):
    document = pymupdf.open(file_path)

    try:
        for page_number in range(len(document)):
            page = document.load_page(page_number)

            pixmap = page.get_pixmap(
    matrix=pymupdf.Matrix(2, 2),
    alpha=False,
)

            image = Image.frombytes(
                "RGB",
                [
                    pixmap.width,
                    pixmap.height,
                ],
                pixmap.samples,
            )

            yield image

    finally:
        document.close()


def open_image(file_path: str) -> Image.Image:
    return Image.open(file_path).convert("RGB")


def is_text_sufficient(
    text: str,
    minimum_characters: int = 80,
) -> bool:
    if not text:
        return False

    cleaned = " ".join(text.split())

    return len(cleaned) >= minimum_characters
from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from PIL import Image


TESSERACT_CANDIDATES = [
    Path(
        r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    ),
    Path(
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
    ),
]


if os.environ.get("LOCALAPPDATA"):
    TESSERACT_CANDIDATES.append(
        Path(os.environ["LOCALAPPDATA"])
        / "Tesseract-OCR"
        / "tesseract.exe"
    )


if os.environ.get("PROGRAMFILES"):
    TESSERACT_CANDIDATES.append(
        Path(os.environ["PROGRAMFILES"])
        / "Tesseract-OCR"
        / "tesseract.exe"
    )


if os.environ.get("PROGRAMFILES(X86)"):
    TESSERACT_CANDIDATES.append(
        Path(os.environ["PROGRAMFILES(X86)"])
        / "Tesseract-OCR"
        / "tesseract.exe"
    )


def find_tesseract() -> Path | None:
    configured_path = os.environ.get(
        "TESSERACT_CMD"
    )

    if configured_path:
        path = Path(
            configured_path
        ).expanduser()

        if path.is_file():
            return path

    path_from_path = shutil.which(
        "tesseract"
    )

    if path_from_path:
        path = Path(path_from_path)

        if path.is_file():
            return path

    seen = set()

    for candidate in TESSERACT_CANDIDATES:
        try:
            candidate = candidate.resolve()
        except OSError:
            continue

        if candidate in seen:
            continue

        seen.add(candidate)

        if candidate.is_file():
            return candidate

    return None


def configure_tesseract() -> Path:
    import pytesseract

    executable = find_tesseract()

    if executable is None:
        raise RuntimeError(
            "OCR is unavailable because Tesseract OCR "
            "is not installed or could not be found. "
            "Install Tesseract OCR or set the "
            "TESSERACT_CMD environment variable "
            "to the full path of tesseract.exe."
        )

    pytesseract.pytesseract.tesseract_cmd = str(
        executable
    )

    return executable


def ocr_image(
    image: "Image.Image",
    language: str = "eng",
) -> str:
    import pytesseract

    configure_tesseract()

    try:
        text = pytesseract.image_to_string(
            image,
            lang=language,
        )

    except pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR could not be started. "
            "Please verify that Tesseract is installed "
            "and that TESSERACT_CMD points to "
            "tesseract.exe."
        ) from exc

    except pytesseract.TesseractError as exc:
        raise RuntimeError(
            f"Tesseract OCR failed while processing "
            f"the image: {exc}"
        ) from exc

    except OSError as exc:
        raise RuntimeError(
            f"OCR processing failed: {exc}"
        ) from exc

    return text.strip()


def ocr_image_file(
    file_path: str | Path,
    language: str = "eng",
) -> str:
    from PIL import Image

    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(
            f"Image file not found: {path}"
        )

    try:
        with Image.open(path) as image:
            rgb_image = image.convert("RGB")

    except Exception as exc:
        raise ValueError(
            f"Unable to read the uploaded image: {exc}"
        ) from exc

    return ocr_image(
        rgb_image,
        language=language,
    )
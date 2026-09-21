from pathlib import Path


def extract_report_text(
    file_path: str,
) -> dict:

    from app.services.document_service import (
        extract_pdf_text,
        is_text_sufficient,
        render_pdf_pages,
    )
    from app.services.ocr_service import (
        ocr_image,
        ocr_image_file,
    )

    path = Path(file_path)

    extension = path.suffix.lower()

    if extension == ".pdf":

        native_text = extract_pdf_text(
            file_path
        )

        if is_text_sufficient(
            native_text
        ):
            return {
                "text": native_text,
                "method": "pdf_text",
            }

        page_texts = []

        for page_image in render_pdf_pages(
            file_path
        ):
            text = ocr_image(
                page_image
            )

            if text:
                page_texts.append(
                    text
                )

        combined_text = "\n".join(
            page_texts
        ).strip()

        return {
            "text": combined_text,
            "method": "pdf_ocr",
        }

    if extension in {
        ".jpg",
        ".jpeg",
        ".png",
    }:
        return {
            "text": ocr_image_file(
                file_path
            ),
            "method": "image_ocr",
        }

    raise ValueError(
        "Unsupported medical report format."
    )
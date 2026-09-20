import re


def clean_medical_text(
    text: str,
) -> str:

    if not text:
        return ""

    text = text.replace(
        "\x00",
        " ",
    )

    text = text.replace(
        "\r",
        " ",
    )

    text = text.replace(
        "\n",
        " ",
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()
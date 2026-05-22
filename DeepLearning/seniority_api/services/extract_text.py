from io import BytesIO

import pdfplumber
import docx
from PIL import Image
import pytesseract


# Force Tesseract path on Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Force Poppler path on Windows
POPPLER_PATH = r"C:\poppler\Library\bin"


def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)

    if filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)

    if filename_lower.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")

    if filename_lower.endswith((".png", ".jpg", ".jpeg")):
        return extract_text_from_image(file_bytes)

    return ""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""

    # 1) Try normal PDF extraction first
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    if len(text.strip()) >= 30:
        return text.strip()

    # 2) If PDF is scanned, use OCR
    return extract_text_from_scanned_pdf_with_ocr(file_bytes)


def extract_text_from_scanned_pdf_with_ocr(file_bytes: bytes) -> str:
    from pdf2image import convert_from_bytes

    text = ""

    images = convert_from_bytes(
        file_bytes,
        dpi=300,
        poppler_path=POPPLER_PATH
    )

    for image in images:
        page_text = pytesseract.image_to_string(image)
        if page_text:
            text += page_text + "\n"

    return text.strip()


def extract_text_from_docx(file_bytes: bytes) -> str:
    document = docx.Document(BytesIO(file_bytes))
    return "\n".join(
        paragraph.text for paragraph in document.paragraphs
    ).strip()


def extract_text_from_image(file_bytes: bytes) -> str:
    image = Image.open(BytesIO(file_bytes))
    return pytesseract.image_to_string(image).strip()
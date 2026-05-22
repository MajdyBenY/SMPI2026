# Seniority Detector API

This backend exposes one endpoint that your frontend can consume.

## Folder structure

```text
seniority_api/
│
├── main.py
├── requirements.txt
├── README.md
│
├── model/
│   └── seniority_detector_model.pickle
│
└── services/
    ├── extract_text.py
    └── predictor.py
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Put your model file here

Place your pickle file in:

```text
model/seniority_detector_model.pickle
```

## Run the API

```bash
uvicorn main:app --reload
```

The API will run on:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

## Endpoint

```http
POST /predict-seniority
```

Form-data:

```text
file: resume.pdf
```

## Example frontend request

```javascript
const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch("http://127.0.0.1:8000/predict-seniority", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

## OCR note

For scanned PDFs/images, you need Tesseract installed on your machine.

### Windows

Install Tesseract OCR, then if needed add this line in `services/extract_text.py`:

```python
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

You may also need Poppler for scanned PDF OCR.

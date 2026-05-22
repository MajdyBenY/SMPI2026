from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.extract_text import extract_text_from_file
from services.predictor import predict_seniority


app = FastAPI(
    title="Seniority Detector API",
    description="API to upload a resume/CV and predict seniority level",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Seniority Detector API is running",
        "endpoint": "/predict-seniority",
    }


@app.post("/predict-seniority")
async def predict_resume_seniority(file: UploadFile = File(...)):
    allowed_extensions = [".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"]

    filename = file.filename.lower()

    if not any(filename.endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload PDF, DOCX, TXT, PNG, JPG or JPEG.",
        )

    try:
        file_bytes = await file.read()

        resume_text = extract_text_from_file(
            file_bytes=file_bytes,
            filename=file.filename,
        )

        if not resume_text or len(resume_text.strip()) < 30:
            raise HTTPException(
                status_code=400,
                detail="Could not extract enough text from this resume. Try a clearer PDF or image.",
            )

        prediction_result = predict_seniority(resume_text)

        return {
            "filename": file.filename,
            "extracted_text_preview": resume_text[:500],
            "seniority_level": prediction_result["seniority_level"],
            "confidence": prediction_result["confidence"],
            "probabilities": prediction_result["probabilities"],
            "extracted_text_length": prediction_result.get("extracted_text_length", len(resume_text)),
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Importation de votre fonction de résumé adaptative
from services.summm import summarize_job_description

app = FastAPI(
    title="Job Description Summarizer API",
    description="API to summarize job descriptions using ML model",
    version="1.0.0",
)

# ------------------------------------------------------------------
# CORS (Mis à jour pour correspondre au port 3000 de votre Frontend)
# ------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Port de votre serveur Vite local
        "http://127.0.0.1:3000",    
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# Request schema
# ------------------------
class JobRequest(BaseModel):
    text: str


# ------------------------
# Home route
# ------------------------
@app.get("/")
def home():
    return {
        "message": "Job Summarizer API is running",
        "endpoint": "/summarize-job"
    }


# ------------------------
# Prediction endpoint
# ------------------------
@app.post("/summarize-job")
def summarize_job(request: JobRequest):

    if not request.text or len(request.text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description too short or empty"
        )

    try:
        # Appelle le script qui utilise votre checkpoint-214
        result = summarize_job_description(request.text)

        return {
            "original_text": request.text,
            "summary": result["summary"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Summarization failed: {str(e)}"
        )
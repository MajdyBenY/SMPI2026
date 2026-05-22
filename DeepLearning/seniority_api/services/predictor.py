import os
import pickle
import re

import numpy as np


MODEL_PATH = os.path.join("model", "seniority_detector_model.pickle")


with open(MODEL_PATH, "rb") as f:
    saved_data = pickle.load(f)

model = saved_data["model"]
tfidf = saved_data["tfidf"]
scaler = saved_data["scaler"]
classes = saved_data["classes"]


SENIOR_P = [
    (r"\bsenior\b", 3), (r"\bdirector\b", 3), (r"\bvp\b", 3),
    (r"\bvice president\b", 3), (r"\bhead of\b", 3), (r"\bchief\b", 3),
    (r"\bmanager\b", 2), (r"\barchitect\b", 2), (r"\bprincipal\b", 2),
    (r"\bteam lead\b", 2), (r"\blead\b", 1),
    (r"\b(15|16|17|18|19|20)\+?\s*years?\b", 3),
    (r"\b(10|11|12|13|14)\+?\s*years?\b", 2),
    (r"\b(8|9)\+?\s*years?\b", 1),
]

MID_P = [
    (r"\bassociate\b", 2), (r"\bspecialist\b", 2),
    (r"\bmid[\s\-]?level\b", 3),
    (r"\b(5|6|7)\+?\s*years?\b", 2),
    (r"\b(3|4)\+?\s*years?\b", 1),
]

ENTRY_P = [
    (r"\bjunior\b", 3), (r"\bjr\.?\b", 3), (r"\bintern\b", 3),
    (r"\binternship\b", 3), (r"\btrainee\b", 3), (r"\bfreshman\b", 3),
    (r"\brecent graduate\b", 3), (r"\bnew graduate\b", 3),
    (r"\bentry[\s\-]?level\b", 3), (r"\bcurrently pursuing\b", 2),
    (r"\b(0|1|2)\+?\s*years?\b", 2),
]


def clean_text(text):
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def compute_scores(text):
    t = text.lower()
    s = {"Senior": 0, "Mid": 0, "Entry": 0}

    for p, pts in SENIOR_P:
        if re.search(p, t):
            s["Senior"] += pts

    for p, pts in MID_P:
        if re.search(p, t):
            s["Mid"] += pts

    for p, pts in ENTRY_P:
        if re.search(p, t):
            s["Entry"] += pts

    return s


def extract_handcrafted(text):
    t = text.lower()
    scores = compute_scores(text)
    years = re.findall(r"(\d+)\+?\s*years?", t)

    return [
        max([int(y) for y in years], default=0),
        scores["Senior"],
        scores["Mid"],
        scores["Entry"],
        1 if re.search(r"\b(bachelor|master|phd|mba|bsc|msc)\b", t) else 0,
        1 if re.search(r"\b(managed|supervised|oversaw|directed|led a team)\b", t) else 0,
        len(t.split()),
    ]


def predict_seniority(text: str) -> dict:
    if not text or len(text.strip()) < 20:
        raise ValueError("Not enough text extracted from the file.")

    cleaned_text = clean_text(text)

    text_features = tfidf.transform([cleaned_text]).toarray().astype("float32")

    handcrafted_features = np.array(
        [extract_handcrafted(text)],
        dtype="float32"
    )

    handcrafted_scaled = scaler.transform(handcrafted_features).astype("float32")

    prediction = model.predict(
        [text_features, handcrafted_scaled],
        verbose=0
    )[0]

    predicted_index = int(np.argmax(prediction))
    predicted_label = classes[predicted_index]
    confidence = float(np.max(prediction))

    probabilities = {
        str(classes[i]): float(prediction[i])
        for i in range(len(classes))
    }

    return {
        "seniority_level": str(predicted_label),
        "confidence": confidence,
        "probabilities": probabilities,
        "extracted_text_length": len(text)
    }
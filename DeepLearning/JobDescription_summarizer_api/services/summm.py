import os
from pathlib import Path
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# 1. Pointage direct sur le dossier stable du Bureau
MODEL_DIR = r"C:\Users\Ragna\Desktop\DeepLearning\job_summarizer_t5\checkpoint-214"

print(f"--- Loading Fine-Tuned T5 Model from Desktop: {MODEL_DIR} ---")

if not os.path.exists(MODEL_DIR):
    raise FileNotFoundError(f"Le script ne trouve pas le dossier à l'adresse : {MODEL_DIR}")

# 2. Chargement du Tokenizer et du Modèle
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, use_fast=False)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_DIR)

# 3. Configuration de l'appareil (GPU Cuda ou CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def summarize_job_description(text: str):
    """
    True Deep Learning Inference en utilisant l'inférence native de T5
    """
    try:
        # T5 exige un préfixe de tâche clair
        input_text = "summarize job description: " + text
        
        # Tokenisation du texte d'entrée et envoi sur le bon composant (CPU/GPU)
        inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Inférence native par propagation avant (Forward pass) dans le réseau de neurones
        with torch.no_grad():
            summary_ids = model.generate(
                inputs["input_ids"],
                max_length=160,
                min_length=30,
                num_beams=4,      # Beam search pour une meilleure qualité de résumé
                early_stopping=True
            )
        
        # Décodage des tokens générés en texte lisible
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        return {
            "summary": summary
        }
    except Exception as e:
        return {
            "error": f"Deep Learning generation failed: {str(e)}"
        }
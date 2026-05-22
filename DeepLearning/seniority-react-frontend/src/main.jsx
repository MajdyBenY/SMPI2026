import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import "./style.css";

const API_URL = "http://127.0.0.1:8000/predict-seniority";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile || null);
    setResult(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a resume file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const confidencePercent = result ? Math.round(result.confidence * 100) : 0;

  return (
    <main className="page">
      <section className="hero-card">
        <div className="badge">
          <Sparkles size={16} />
          AI Resume Seniority Detector
        </div>

        <h1>Upload a CV and detect seniority</h1>
        <p className="subtitle">
          Upload PDF, DOCX, TXT, PNG, JPG or JPEG. The app sends the file to your FastAPI backend and displays the prediction.
        </p>

        <div className="upload-box">
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            hidden
          />

          <label htmlFor="file-input" className="upload-label">
            <Upload size={34} />
            <span>{file ? file.name : "Choose resume file"}</span>
            <small>PDF, DOCX, TXT, PNG, JPG, JPEG</small>
          </label>
        </div>

        <button className="predict-btn" onClick={handleUpload} disabled={loading}>
          {loading ? <Loader2 className="spin" size={20} /> : <CheckCircle2 size={20} />}
          {loading ? "Analyzing resume..." : "Predict Seniority"}
        </button>

        {error && (
          <div className="error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {result && (
        <section className="result-grid">
          <div className="result-card main-result">
            <p className="label">Predicted Seniority</p>
            <h2>{result.seniority_level}</h2>
            <div className="confidence-bar">
              <div style={{ width: `${confidencePercent}%` }}></div>
            </div>
            <p className="confidence-text">Confidence: {confidencePercent}%</p>
          </div>

          <div className="result-card">
            <p className="label">Probabilities</p>
            <div className="probabilities">
              {Object.entries(result.probabilities || {}).map(([label, value]) => {
                const percent = Math.round(value * 100);
                return (
                  <div className="probability-row" key={label}>
                    <div className="probability-header">
                      <span>{label}</span>
                      <strong>{percent}%</strong>
                    </div>
                    <div className="mini-bar">
                      <div style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="result-card preview-card">
            <p className="label">
              <FileText size={16} /> Extracted Text Preview
            </p>
            <pre>{result.extracted_text_preview}</pre>
          </div>
        </section>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

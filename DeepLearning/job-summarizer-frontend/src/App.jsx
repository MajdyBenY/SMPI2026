import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

const SAMPLE_JOBS = [
  {
    title: "Senior Data Analyst",
    text: "Position: Senior Data Analyst. Company: InnovateTech. Location: Remote. Requirements: Advanced SQL querying, strong experience with Python libraries such as Pandas and NumPy, and hands-on experience building dashboards in Power BI. Responsibilities: Design and maintain interactive dashboards, interpret large data volumes, automate recurring tasks using Python scripts, and support strategic business initiatives."
  },
  {
    title: "Full Stack Engineer",
    text: "Position: Full Stack Developer. Company: CloudScale. Location: New York. Requirements: 3+ years experience with React, Node.js, and TypeScript. Experience with AWS architecture and PostgreSQL optimization. Responsibilities: Architect responsive frontend interfaces, deploy microservices, maintain secure REST APIs, and collaborate with product designers."
  }
];

export default function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('http://127.0.0.1:8000/summarize-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text })
      });

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || 'Failed to connect to the AI model endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-group">
          <div className="icon-badge"><Sparkles size={24} className="sparkle-icon" /></div>
          <div>
            <h1>BriefJob AI</h1>
            <p>Fine-Tuned T5 Deep Learning Summarizer</p>
          </div>
        </div>
      </header>
      <main className="app-main">
        <section className="panel input-panel">
          <div className="panel-header"><FileText size={20} /><h2>Job Description</h2></div>
          <div className="samples-row">
            <span className="sample-label">Try a sample:</span>
            {SAMPLE_JOBS.map((job, idx) => (
              <button key={idx} className="sample-btn" onClick={() => { setText(job.text); setError(''); setSummary(''); }}>{job.title}</button>
            ))}
          </div>
          <textarea placeholder="Paste the raw job description details here..." value={text} onChange={(e) => setText(e.target.value)}></textarea>
          <div className="actions-row">
            <button className="secondary-btn" onClick={() => { setText(''); setSummary(''); setError(''); }} disabled={loading}>Clear</button>
            <button className="primary-btn" onClick={handleSummarize} disabled={loading || !text.trim()}>
              {loading ? <><Loader2 className="spinner" size={18} /> Processing Model...</> : <><RefreshCw size={18} /> Generate Summary <ArrowRight size={18} /></>}
            </button>
          </div>
        </section>
        <section className="panel output-panel">
          <div className="panel-header"><Sparkles size={20} /><h2>AI Executive Summary</h2></div>
          <div className="output-display">
            {loading && <div className="state-view loading-state"><Loader2 className="spinner-large" size={40} /><p>Running text tokenization and model inference layers...</p></div>}
            {error && <div className="state-view error-state"><AlertCircle size={36} className="error-icon" /><h3>Inference Error</h3><p>{error}</p></div>}
            {!loading && !error && !summary && <div className="state-view empty-state"><p>Provide a job description context on the left and trigger inference to view the compressed AI digest.</p></div>}
            {!loading && !error && summary && (
              <div className="summary-card animate-fade-in">
                <div className="card-badge">T5 Generated Digest</div>
                <div className="summary-text-body">{summary.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}</div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

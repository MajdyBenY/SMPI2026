import { useState } from 'react'
import { JOBS } from './jobs'
import './App.css'

const TAG_COLORS = {
  Tech: { bg: '#e8f0e5', text: '#4a6741' },
  Design: { bg: '#fceee9', text: '#b84a2a' },
  AI: { bg: '#fdf6e3', text: '#a07820' },
  Data: { bg: '#f0eeea', text: '#5a5040' },
  Infra: { bg: '#e5ede5', text: '#3a5738' },
}

function JobCard({ job, selected, onClick }) {
  const tagStyle = TAG_COLORS[job.tag] || TAG_COLORS.Tech
  return (
    <button
      className={`job-card ${selected ? 'job-card--active' : ''}`}
      onClick={onClick}
      style={{ '--accent': job.color }}
    >
      <div className="job-card__header">
        <span className="job-card__tag" style={{ background: tagStyle.bg, color: tagStyle.text }}>
          {job.tag}
        </span>
        <span className="job-card__location">{job.location}</span>
      </div>
      <h3 className="job-card__title">{job.title}</h3>
      <p className="job-card__company">{job.company}</p>
      <div className="job-card__footer">
        <span className="job-card__category">{job.category}</span>
        {selected && <span className="job-card__selected-badge">Selected ✓</span>}
      </div>
    </button>
  )
}

function SummaryResult({ summary, jobTitle, company }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0)

  return (
    <div className="result-card">
      <div className="result-card__eyebrow">
        <div className="result-card__pulse" />
        <span>AI Summary Generated</span>
      </div>
      <div className="result-card__meta">
        <h2 className="result-card__title">{jobTitle}</h2>
        <span className="result-card__company">@ {company}</span>
      </div>
      <div className="result-card__divider" />
      <div className="result-card__content">
        {sentences.map((sentence, i) => (
          <p key={i} className="result-card__sentence" style={{ '--delay': `${i * 0.06}s` }}>
            {sentence}
          </p>
        ))}
      </div>
      <div className="result-card__actions">
        <button className="btn-copy" onClick={handleCopy}>
          {copied ? '✓ Copied!' : 'Copy Summary'}
        </button>
        <span className="result-card__wordcount">
          {summary.split(/\s+/).length} words
        </span>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const handleSummarize = async () => {
    if (!selectedJob) return
    setLoading(true)
    setSummary(null)
    setError(null)

    try {
      const res = await fetch('/summarize-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedJob.text }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setSummary(data.summary)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-ornament bg-ornament--1" />
      <div className="bg-ornament bg-ornament--2" />

      {/* Header */}
      <header className="header">
        <div className="header__badge">Powered by AI</div>
        <h1 className="header__title">
          Job<em>Lens</em>
        </h1>
        <p className="header__subtitle">
          Select a job below and let our AI distill the essential details in seconds.
        </p>
      </header>

      {/* Main content */}
      <main className="main">
        {/* Left panel — Job grid */}
        <section className="panel panel--left">
          <div className="panel__label">
            <span className="panel__step">01</span>
            <h2>Choose a Position</h2>
          </div>
          <div className="jobs-grid">
            {JOBS.map(job => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onClick={() => {
                  setSelectedJob(job)
                  setSummary(null)
                  setError(null)
                }}
              />
            ))}
          </div>
        </section>

        {/* Right panel — Action + Result */}
        <section className="panel panel--right">
          <div className="panel__label">
            <span className="panel__step">02</span>
            <h2>Generate Summary</h2>
          </div>

          {/* Selected job preview */}
          {selectedJob ? (
            <div className="preview-box">
              <div className="preview-box__header">
                <div>
                  <p className="preview-box__role">{selectedJob.title}</p>
                  <p className="preview-box__company">{selectedJob.company} · {selectedJob.location}</p>
                </div>
                <span className="preview-box__chars">{selectedJob.text.length} chars</span>
              </div>
              <p className="preview-box__excerpt">
                {selectedJob.text.slice(0, 180).trim()}…
              </p>
            </div>
          ) : (
            <div className="empty-preview">
              <div className="empty-preview__icon">◈</div>
              <p>Select a job from the left to get started</p>
            </div>
          )}

          {/* Summarize button */}
          <button
            className={`btn-summarize ${loading ? 'btn-summarize--loading' : ''}`}
            onClick={handleSummarize}
            disabled={!selectedJob || loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <span className="btn-summarize__icon">⚡</span>
                Summarize Job
              </>
            )}
          </button>

          {/* Error state */}
          {error && (
            <div className="error-box">
              <span className="error-box__icon">⚠</span>
              <div>
                <strong>Something went wrong</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {summary && (
            <SummaryResult
              summary={summary}
              jobTitle={selectedJob.title}
              company={selectedJob.company}
            />
          )}
        </section>
      </main>

      <footer className="footer">
        <p>JobLens — Powered by your FastAPI backend · <code>POST /summarize-job</code></p>
      </footer>
    </div>
  )
}

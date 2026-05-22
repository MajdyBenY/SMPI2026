# JobLens — Job Summarizer Frontend

A polished React UI that lets users pick a job from a curated list and summarize it via your FastAPI backend.

## Prerequisites

- **Node.js** 18+ and **npm**
- Your FastAPI backend running at `http://localhost:8000`

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (runs on port 3000)
npm run dev
```

Then open **http://localhost:3000** in your browser.

## How it works

1. The Vite dev server proxies requests from `/summarize-job` → `http://localhost:8000/summarize-job`
2. User picks a job card → clicks **Summarize Job**
3. The app POSTs `{ "text": "..." }` to your endpoint
4. The summary is displayed in a styled result card

## Production Build

```bash
npm run build
# Output in /dist — serve with any static file server
```

## Customizing Jobs

Edit `src/jobs.js` to add, remove, or modify job listings.

## API Expected Response

```json
{
  "original_text": "...",
  "summary": "..."
}
```

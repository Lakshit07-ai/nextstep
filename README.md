# NextStep — AI-Powered Career Assistant

NextStep helps college students, fresh graduates, and job seekers understand how well their resumes match specific job descriptions, identify skill gaps, improve resume content, and prepare for interviews.

**Primary academic focus:** Prompt Engineering (structured prompts, versioning, comparison, and evaluation).

## Features

- **Authentication** — Register / Login with JWT, secure password hashing
- **Resume Management** — Upload PDF/DOCX or paste text, store multiple versions
- **Resume Analysis** — Strengths, weaknesses, ATS readability, suggested summary
- **Resume Improvement** — Rewrite bullets/summaries without fabricating facts or metrics
- **Job Description Matching** — Explainable match score (0–100) with weighted breakdown
- **Skill Gap Analysis** — Matched, partial, missing must-have / nice-to-have skills
- **Mock Interviews** — Role-specific questions + structured evaluation + final report
- **Dashboard** — Real stats from the database
- **Prompt Laboratory** — Compare prompt versions side-by-side (core academic feature)

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router |
| Backend   | Node.js, Express                    |
| Database  | MongoDB + Mongoose                 |
| Auth      | JWT + bcryptjs                      |
| AI        | OpenAI API (modular provider)       |
| Docs      | PDF (pdf-parse), DOCX (mammoth)     |

## Project Structure

```
nextstep/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── prompts/          # Centralised prompt templates (versioned)
│   │   │   └── providers/        # OpenAI (extensible)
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/             # ai.service.js — single entry for LLM calls
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- OpenAI API key (optional — app falls back to mock responses without it)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and OPENAI_API_KEY
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### 3. Environment Variables (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nextstep
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai
CLIENT_URL=http://localhost:5173
```

Without a valid `OPENAI_API_KEY`, the AI endpoints return deterministic mock responses so you can still test the full UI flow.

## Prompt Engineering Architecture

Prompts live in `backend/src/ai/prompts/`. Each category supports multiple versions:

| Category            | Versions                              | Techniques              |
|---------------------|---------------------------------------|-------------------------|
| Job Matching        | v1_baseline, v2_structured, v3_role_based | zero-shot, structured, role-based |
| Resume Analysis     | v1_baseline, v2_structured            | zero-shot, structured   |
| Resume Improvement  | v1_structured                         | structured + constraints|
| Mock Interview      | generate + evaluate                   | role-based, structured  |

All LLM calls go through `services/ai.service.js`. Templates use `{{variable}}` placeholders. Responses are expected as JSON and parsed safely.

### Scoring Framework (Job Match)

| Category                    | Weight |
|-----------------------------|--------|
| Required technical skills   | 30     |
| Relevant experience         | 25     |
| Projects / practical exposure | 20   |
| Education                   | 10     |
| Preferred skills            | 10     |
| Resume clarity              | 5      |
| **Total**                   | **100**|

## API Overview

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | `/api/auth/register`            | Create account             |
| POST   | `/api/auth/login`               | Login                      |
| GET    | `/api/auth/me`                  | Current user               |
| GET    | `/api/resumes`                  | List resumes               |
| POST   | `/api/resumes`                  | Create from text           |
| POST   | `/api/resumes/upload`           | Upload PDF/DOCX            |
| POST   | `/api/matches`                  | Run JD match analysis      |
| GET    | `/api/matches/:id`              | Get match result           |
| POST   | `/api/interviews/start`         | Start mock interview       |
| POST   | `/api/interviews/sessions/:id/answer` | Submit answer        |
| GET    | `/api/dashboard`                | Dashboard stats            |

All routes except auth require `Authorization: Bearer <token>`.

## Demonstration Flow

1. **Register** → Create account  
2. **Upload / paste resume** → Resumes page  
3. **Analyze** → Run structured resume analysis  
4. **Improve** → Rewrite a weak bullet (no invented metrics)  
5. **Match Job** → Select resume, paste JD, run analysis  
6. **Review result** → Score, breakdown, skill gaps, recommendations  
7. **Mock Interview** → Choose role, answer questions, get feedback + report  
8. **Prompt Lab** → Compare prompt versions on the same inputs  

## Design Notes

- Palette: deep navy / charcoal + muted electric blue accents
- Typography: Inter
- Intentionally avoids generic “AI product” visual patterns (no purple gradients, glassmorphism, floating orbs, etc.)
- Responsive layout with mobile navigation

## Academic Context

- Course: Prompt Engineering (SCSE4041)
- Problem: C9 — Students submit generic resumes that poorly match specific JDs
- Contribution: Prompt versioning, structured output, comparison laboratory, and evaluation-ready architecture

## Limitations & Future Work

- OpenAI is the only provider currently wired (architecture supports more)
- Resume structured extraction is basic (raw text is primary)
- Prompt evaluation metrics UI is minimal (data model exists)
- No production deployment configuration included
- Rate limiting is basic

## License

MIT — for academic and portfolio use.

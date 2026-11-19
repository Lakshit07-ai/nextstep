# NextStep Architecture

## Overview

NextStep is a MERN application with a strong emphasis on modular prompt engineering.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│   Express    │────▶│  MongoDB    │
│  (Vite)     │     │   REST API   │     │             │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │  AI Service  │
                    │  (prompts +  │
                    │   providers) │
                    └──────────────┘
```

## Backend Layers

1. **Routes** — thin, validate input, call controllers
2. **Controllers** — business orchestration, ownership checks
3. **Services** — AI service is the single place LLM calls are made
4. **Prompts** — versioned templates, never scattered in controllers
5. **Providers** — OpenAI today; swap without touching feature code
6. **Models** — User, Resume, JobMatch, InterviewSession, PromptVersion

## Auth

- bcrypt (cost 12) password hashing
- JWT (7d default) in `Authorization: Bearer` header
- `protect` middleware on all private routes
- User-scoped queries on every data endpoint

## AI Safety Rules (enforced in prompts)

- Never invent technologies, metrics, projects, or achievements
- Distinguish “absent” from “not provided”
- Prefer conservative scoring when evidence is weak
- Structured JSON output required

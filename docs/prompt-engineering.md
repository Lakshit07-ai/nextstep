# Prompt Engineering in NextStep

This document describes the prompt architecture that forms the academic core of the project.

## Design Principles

1. **Centralised prompts** — All templates live under `backend/src/ai/prompts/`. Controllers never embed long prompt strings.
2. **Versioned** — Important prompts exist in multiple versions (baseline → structured → role-based).
3. **Structured output** — Prefer strict JSON schemas. The service layer parses and validates before returning data to the client.
4. **No hallucination of credentials** — Improvement and analysis prompts explicitly forbid inventing technologies, metrics, projects, or achievements.
5. **Comparable** — The Prompt Laboratory runs the same inputs against multiple versions for fair comparison.

## Techniques Implemented

| Technique              | Where used                          | Purpose                                      |
|------------------------|-------------------------------------|----------------------------------------------|
| Zero-shot              | Job Match v1, Resume Analysis v1    | Baseline for comparison                      |
| Structured prompting   | Job Match v2, Resume Analysis v2    | Explicit schema + scoring weights            |
| Role-based             | Job Match v3, Interview generation | Strong persona + constraints                 |
| Output constraints     | All JSON prompts                    | “Return ONLY valid JSON”                     |
| Context-grounded       | All analysis prompts                | Resume + JD text injected as evidence source |
| Instruction hierarchy  | Improvement prompts                 | Critical rules listed before the content      |

## Job Matching Scoring Framework

Documented weights (configurable in the prompt):

- Required technical skills — 30
- Relevant experience — 25
- Projects / practical exposure — 20
- Education — 10
- Preferred skills — 10
- Presentation / clarity — 5

The score is an **indicative compatibility assessment**, not a prediction of ATS behaviour or hiring outcomes.

## Prompt Laboratory

Route: `/app/prompt-lab`

- Select one or more prompt versions
- Provide the same resume + JD sample
- Execute and view match scores, skill counts, and summaries side-by-side
- Useful for qualitative comparison and for collecting data for evaluation tables

## Evaluation Notes

For formal evaluation:

1. Fix a small set of synthetic resumes and job descriptions.
2. Run every prompt version on the same set.
3. Score (manually or with a rubric): relevance, completeness, JSON validity, instruction adherence, hallucination rate, helpfulness.
4. Record results in a comparison table (see course evaluation report template).

Do not fabricate evaluation numbers. Run real experiments and document limitations (sample size, model used, temperature, etc.).

## Extending Prompts

1. Add a new key to the appropriate file in `ai/prompts/`.
2. Include: `name`, `version`, `technique`, `description`, `template`.
3. Use `{{variable}}` placeholders that the service fills.
4. Wire the version id into the frontend selector if it should be user-selectable.
5. Prefer `response_format: json_object` when calling the provider.

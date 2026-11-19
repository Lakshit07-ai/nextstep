/**
 * Job Description Matching Prompts
 * Multiple versions for prompt engineering evaluation
 */

export const jobMatchingPrompts = {
  v1_baseline: {
    name: 'Job Matching Baseline',
    version: 'v1',
    technique: 'zero-shot',
    description: 'Simple zero-shot prompt asking for match analysis',
    template: `Analyze how well this resume matches the job description.

Resume:
{{resumeText}}

Job Description:
{{jobDescription}}

Target Role: {{jobTitle}}
Company: {{company}}

Provide a match score from 0-100 and list matched skills, missing skills, and recommendations.`,
  },

  v2_structured: {
    name: 'Job Matching Structured',
    version: 'v2',
    technique: 'structured',
    description: 'Structured prompt with explicit scoring weights and JSON output',
    template: `You are an expert technical recruiter and ATS specialist.

Analyze the candidate's resume against the job description using this scoring framework:

SCORING WEIGHTS (Total 100):
- Required technical skills: 30 points
- Relevant experience: 25 points
- Projects and practical exposure: 20 points
- Education and qualifications: 10 points
- Preferred / nice-to-have skills: 10 points
- Resume clarity and presentation: 5 points

RULES:
1. Never invent skills, experience, projects, or achievements not present in the resume.
2. Distinguish between "not mentioned" and "clearly missing".
3. Be evidence-based. Reference specific parts of the resume or JD.
4. Output ONLY valid JSON. No markdown, no extra text.

RESUME:
{{resumeText}}

JOB TITLE: {{jobTitle}}
COMPANY: {{company}}

JOB DESCRIPTION:
{{jobDescription}}

Return this exact JSON structure:
{
  "matchScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "scoreBreakdown": {
    "technicalSkills": <0-30>,
    "experience": <0-25>,
    "projects": <0-20>,
    "education": <0-10>,
    "preferredSkills": <0-10>,
    "presentation": <0-5>
  },
  "matchedSkills": ["skill1", "skill2"],
  "partialSkills": ["skill that is partially covered"],
  "missingMustHaveSkills": ["critical missing skill"],
  "missingGoodToHaveSkills": ["nice-to-have missing skill"],
  "experienceGaps": ["specific gap description"],
  "recommendations": ["actionable recommendation 1", "recommendation 2"]
}`,
  },

  v3_role_based: {
    name: 'Job Matching Role-Based',
    version: 'v3',
    technique: 'role-based',
    description: 'Strong role definition + constrained output',
    template: `You are a senior technical recruiter at a top-tier technology company with 12 years of experience evaluating candidates for {{jobTitle}} roles.

Your task is to produce an objective, evidence-based compatibility assessment between the provided resume and the job description.

Critical constraints:
- Do NOT hallucinate any technology, project, metric, or achievement.
- If something is absent from the resume, state that it is missing rather than assuming.
- Base every claim on explicit evidence from the resume text.
- Prefer conservative scoring when evidence is weak.

RESUME TEXT:
---
{{resumeText}}
---

TARGET ROLE: {{jobTitle}}
COMPANY: {{company}}

JOB DESCRIPTION:
---
{{jobDescription}}
---

Respond with valid JSON only using this schema:
{
  "matchScore": number,
  "summary": string,
  "scoreBreakdown": {
    "technicalSkills": number,
    "experience": number,
    "projects": number,
    "education": number,
    "preferredSkills": number,
    "presentation": number
  },
  "matchedSkills": string[],
  "partialSkills": string[],
  "missingMustHaveSkills": string[],
  "missingGoodToHaveSkills": string[],
  "experienceGaps": string[],
  "recommendations": string[]
}`,
  },
};

export default jobMatchingPrompts;

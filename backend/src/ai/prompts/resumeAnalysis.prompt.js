/**
 * Resume Analysis Prompts
 */

export const resumeAnalysisPrompts = {
  v1_baseline: {
    name: 'Resume Analysis Baseline',
    version: 'v1',
    technique: 'zero-shot',
    template: `Analyze this resume and provide strengths, weaknesses, and improvement suggestions.

Resume:
{{resumeText}}`,
  },

  v2_structured: {
    name: 'Resume Analysis Structured',
    version: 'v2',
    technique: 'structured',
    template: `You are an expert resume coach and former technical recruiter.

Analyze the following resume thoroughly. Focus only on what is actually present. Never invent experience, skills, or achievements.

RESUME:
{{resumeText}}

Return ONLY valid JSON:
{
  "overallAssessment": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "missingSections": ["string"],
  "atsReadability": {
    "score": number,
    "issues": ["string"]
  },
  "sectionFeedback": {
    "summary": "string",
    "experience": "string",
    "projects": "string",
    "skills": "string",
    "education": "string"
  },
  "suggestedProfessionalSummary": "string",
  "actionableRecommendations": ["string"]
}`,
  },
};

export default resumeAnalysisPrompts;

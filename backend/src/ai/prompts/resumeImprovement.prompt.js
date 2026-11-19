/**
 * Resume Improvement Prompts
 * Critical rule: Never fabricate facts, metrics, or technologies.
 */

export const resumeImprovementPrompts = {
  v1_structured: {
    name: 'Bullet Point Improver',
    version: 'v1',
    technique: 'structured',
    template: `You are an expert resume writer specializing in technical roles.

Improve the following bullet points or section for clarity, impact, and ATS compatibility.

CRITICAL RULES:
1. NEVER invent technologies, metrics, achievements, or responsibilities that are not already stated or clearly implied.
2. If a quantifiable metric is missing, do not invent one. Instead note that a metric would strengthen the point.
3. Preserve the original meaning and facts.
4. Use strong action verbs.
5. Prefer concise, results-oriented language.

ORIGINAL CONTENT:
{{originalContent}}

TARGET ROLE (optional): {{targetRole}}
JOB DESCRIPTION CONTEXT (optional): {{jobDescription}}

Return ONLY valid JSON:
{
  "improvedContent": "the rewritten version",
  "explanation": "what was changed and why",
  "suggestedMetricsToAdd": ["only if the original lacks quantification and the user could realistically provide it"],
  "changesMade": ["list of specific improvements"]
}`,
  },
};

export default resumeImprovementPrompts;

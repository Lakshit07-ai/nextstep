/**
 * Mock Interview Prompts
 */

export const mockInterviewPrompts = {
  generateQuestion: {
    name: 'Generate Interview Question',
    version: 'v1',
    technique: 'role-based',
    template: `You are an experienced interviewer conducting a {{difficulty}} {{interviewType}} interview for the role of {{targetRole}} at {{company}}.

Candidate background (from resume summary):
{{resumeSummary}}

Previous questions already asked:
{{previousQuestions}}

Generate the next interview question. Make it realistic, relevant, and appropriate for the difficulty level.

Return ONLY valid JSON:
{
  "question": "the interview question",
  "type": "{{interviewType}}",
  "expectedFocus": ["key points a strong answer should cover"],
  "followUpPotential": "optional follow-up direction"
}`,
  },

  evaluateAnswer: {
    name: 'Evaluate Interview Answer',
    version: 'v1',
    technique: 'structured',
    template: `You are evaluating a candidate's answer in a {{difficulty}} interview for {{targetRole}}.

QUESTION:
{{question}}

CANDIDATE'S ANSWER:
{{answer}}

Provide a fair, specific, constructive evaluation. Avoid generic praise. Base feedback on the actual content of the answer.

Return ONLY valid JSON:
{
  "score": <0-10>,
  "strengths": ["specific strengths observed"],
  "weaknesses": ["specific weaknesses"],
  "missingPoints": ["important points the answer missed"],
  "suggestedImprovements": ["concrete ways to improve this answer"],
  "explanation": "brief overall assessment"
}`,
  },
};

export default mockInterviewPrompts;

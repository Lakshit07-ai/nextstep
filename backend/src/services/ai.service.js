import { generateCompletion } from '../ai/providers/openai.provider.js';
import jobMatchingPrompts from '../ai/prompts/jobMatching.prompt.js';
import resumeAnalysisPrompts from '../ai/prompts/resumeAnalysis.prompt.js';
import resumeImprovementPrompts from '../ai/prompts/resumeImprovement.prompt.js';
import mockInterviewPrompts from '../ai/prompts/mockInterview.prompt.js';

/**
 * Central AI service - all LLM calls go through here
 */

const fillTemplate = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value || '');
  }
  return result;
};

const safeParseJSON = (text) => {
  if (!text) return null;
  try {
    // Remove potential markdown code fences
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse failed:', e.message);
    return null;
  }
};

export const analyzeJobMatch = async ({
  resumeText,
  jobDescription,
  jobTitle,
  company = '',
  promptVersion = 'v2_structured',
}) => {
  const promptConfig = jobMatchingPrompts[promptVersion] || jobMatchingPrompts.v2_structured;

  const userPrompt = fillTemplate(promptConfig.template, {
    resumeText: resumeText.slice(0, 12000),
    jobDescription: jobDescription.slice(0, 8000),
    jobTitle,
    company,
  });

  const result = await generateCompletion({
    systemPrompt: 'You are an expert technical recruiter. Always respond with valid JSON only.',
    userPrompt,
    temperature: 0.2,
    responseFormat: 'json',
  });

  if (!result.success && !result.isMock) {
    throw new Error(result.error || 'AI service unavailable');
  }

  const parsed = safeParseJSON(result.content);

  return {
    ...parsed,
    promptVersion: promptConfig.version,
    technique: promptConfig.technique,
    isMock: result.isMock || false,
  };
};

export const analyzeResume = async ({ resumeText, promptVersion = 'v2_structured' }) => {
  const promptConfig = resumeAnalysisPrompts[promptVersion] || resumeAnalysisPrompts.v2_structured;

  const userPrompt = fillTemplate(promptConfig.template, {
    resumeText: resumeText.slice(0, 12000),
  });

  const result = await generateCompletion({
    systemPrompt: 'You are an expert resume coach. Respond with valid JSON only.',
    userPrompt,
    temperature: 0.3,
    responseFormat: 'json',
  });

  const parsed = safeParseJSON(result.content);
  return { ...parsed, isMock: result.isMock || false };
};

export const improveResumeContent = async ({
  originalContent,
  targetRole = '',
  jobDescription = '',
}) => {
  const promptConfig = resumeImprovementPrompts.v1_structured;

  const userPrompt = fillTemplate(promptConfig.template, {
    originalContent,
    targetRole,
    jobDescription: jobDescription.slice(0, 3000),
  });

  const result = await generateCompletion({
    systemPrompt: 'You are an expert resume writer. Never invent facts. Respond with valid JSON only.',
    userPrompt,
    temperature: 0.4,
    responseFormat: 'json',
  });

  const parsed = safeParseJSON(result.content);
  return { ...parsed, isMock: result.isMock || false };
};

export const generateInterviewQuestion = async ({
  targetRole,
  company = '',
  difficulty = 'medium',
  interviewType = 'technical',
  resumeSummary = '',
  previousQuestions = [],
}) => {
  const promptConfig = mockInterviewPrompts.generateQuestion;

  const userPrompt = fillTemplate(promptConfig.template, {
    targetRole,
    company,
    difficulty,
    interviewType,
    resumeSummary: resumeSummary.slice(0, 2000),
    previousQuestions: previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n') || 'None yet',
  });

  const result = await generateCompletion({
    systemPrompt: 'You are an experienced technical interviewer. Respond with valid JSON only.',
    userPrompt,
    temperature: 0.7,
    responseFormat: 'json',
  });

  const parsed = safeParseJSON(result.content);
  return { ...parsed, isMock: result.isMock || false };
};

export const evaluateInterviewAnswer = async ({
  question,
  answer,
  targetRole,
  difficulty = 'medium',
}) => {
  const promptConfig = mockInterviewPrompts.evaluateAnswer;

  const userPrompt = fillTemplate(promptConfig.template, {
    question,
    answer,
    targetRole,
    difficulty,
  });

  const result = await generateCompletion({
    systemPrompt: 'You are a fair and constructive interviewer. Respond with valid JSON only.',
    userPrompt,
    temperature: 0.3,
    responseFormat: 'json',
  });

  const parsed = safeParseJSON(result.content);
  return { ...parsed, isMock: result.isMock || false };
};

export default {
  analyzeJobMatch,
  analyzeResume,
  improveResumeContent,
  generateInterviewQuestion,
  evaluateInterviewAnswer,
};

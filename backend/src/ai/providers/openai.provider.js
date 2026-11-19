import OpenAI from 'openai';

let client = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return null;
    }
    client = new OpenAI({ apiKey });
  }
  return client;
};

/** Context-aware mock responses so the full UI works without an API key */
const getMockContent = (userPrompt = '', systemPrompt = '') => {
  const text = (userPrompt + systemPrompt).toLowerCase();

  // Job matching
  if (text.includes('matchscore') || text.includes('scorebreakdown') || text.includes('missingmusthaveskills')) {
    return JSON.stringify({
      matchScore: 68,
      summary:
        'MOCK RESPONSE (set OPENAI_API_KEY for real analysis). The candidate shows relevant project experience with JavaScript and React, but lacks explicit TypeScript and cloud experience that the role appears to require.',
      scoreBreakdown: {
        technicalSkills: 20,
        experience: 16,
        projects: 14,
        education: 8,
        preferredSkills: 6,
        presentation: 4,
      },
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'Git'],
      partialSkills: ['MongoDB', 'REST APIs'],
      missingMustHaveSkills: ['TypeScript', 'AWS'],
      missingGoodToHaveSkills: ['Docker', 'GraphQL', 'CI/CD'],
      experienceGaps: [
        'Limited mention of production-scale or team-based development',
        'No explicit experience with the company tech stack requirements',
      ],
      recommendations: [
        'Add quantifiable impact metrics to project descriptions (users, performance, etc.)',
        'Highlight any TypeScript or typed-JavaScript exposure more prominently',
        'Include a short professional summary tailored to the target role',
        'Mention collaboration tools and any Agile/Scrum experience if applicable',
      ],
    });
  }

  // Resume analysis
  if (text.includes('overallassessment') || text.includes('atsreadability') || text.includes('suggestedprofessionalsummary')) {
    return JSON.stringify({
      overallAssessment:
        'MOCK RESPONSE. The resume has a solid foundation with clear project work, but would benefit from a stronger professional summary and more quantifiable achievements.',
      strengths: [
        'Clear listing of technical skills',
        'Multiple projects demonstrating practical application',
        'Education section is complete',
      ],
      weaknesses: [
        'Missing or weak professional summary',
        'Bullet points lack measurable outcomes',
        'Some sections could be more ATS-friendly (standard headings)',
      ],
      missingSections: ['Professional Summary', 'Certifications (if any)'],
      atsReadability: {
        score: 72,
        issues: ['Consider using standard section headings', 'Avoid tables or multi-column layouts if present'],
      },
      sectionFeedback: {
        summary: 'Add a 2–3 line professional summary targeted at the roles you want.',
        experience: 'Where possible, turn responsibilities into impact statements with numbers.',
        projects: 'Strong project variety; add tech stack and outcomes more consistently.',
        skills: 'Good coverage; group by category (languages, frameworks, tools).',
        education: 'Looks complete.',
      },
      suggestedProfessionalSummary:
        'Computer Science graduate with hands-on experience building full-stack web applications using React and Node.js. Passionate about clean code and solving real user problems. Seeking a software engineering role where I can contribute to product impact.',
      actionableRecommendations: [
        'Write a targeted professional summary',
        'Add metrics to at least 3–4 bullet points',
        'Ensure skill keywords match common JD requirements for your target roles',
      ],
    });
  }

  // Resume improvement
  if (text.includes('improvedcontent') || text.includes('changesmade') || text.includes('suggestedmetricstoadd')) {
    return JSON.stringify({
      improvedContent:
        'Developed and deployed a full-stack web application using React and Node.js, implementing user authentication and RESTful APIs to support core product features.',
      explanation:
        'MOCK RESPONSE. Strengthened the action verb, clarified the tech stack, and made the outcome more concrete while staying faithful to the original facts. No metrics were invented.',
      suggestedMetricsToAdd: [
        'Number of users or requests handled (if known)',
        'Performance improvement percentage (if measured)',
      ],
      changesMade: [
        'Replaced weak verb with a stronger action verb',
        'Made technology stack explicit',
        'Focused on outcome rather than only activity',
      ],
    });
  }

  // Interview question generation
  if (text.includes('expectedfocus') || text.includes('followuppotential') || text.includes('generate the next interview question')) {
    return JSON.stringify({
      question:
        'Walk me through a challenging technical problem you solved recently. What was the problem, how did you approach it, and what was the outcome?',
      type: 'technical',
      expectedFocus: [
        'Clear problem statement',
        'Reasoning and alternatives considered',
        'Technologies used',
        'Measurable or qualitative outcome',
      ],
      followUpPotential: 'Dive deeper into trade-offs or how the solution was tested.',
    });
  }

  // Interview answer evaluation
  if (text.includes('"score"') || text.includes('suggestedimprovements') || text.includes('missingpoints')) {
    return JSON.stringify({
      score: 6.5,
      strengths: [
        'Structured the answer with a clear beginning and end',
        'Mentioned specific technologies',
      ],
      weaknesses: [
        'Limited discussion of trade-offs or alternatives',
        'Outcome was described qualitatively rather than with impact',
      ],
      missingPoints: [
        'Why this approach over alternatives',
        'How success was measured',
        'What you would do differently next time',
      ],
      suggestedImprovements: [
        'Use a STAR or similar structure more explicitly',
        'Quantify impact where possible',
        'Mention collaboration or constraints if relevant',
      ],
      explanation:
        'MOCK RESPONSE. A solid baseline answer that would be stronger with clearer reasoning about decisions and measurable outcomes.',
    });
  }

  // Generic fallback
  return JSON.stringify({
    message: 'MOCK RESPONSE — set OPENAI_API_KEY in backend/.env for real AI output.',
    note: 'The application is fully functional; only the LLM content is simulated.',
  });
};

export const generateCompletion = async ({
  systemPrompt = 'You are a helpful career assistant.',
  userPrompt,
  temperature = 0.3,
  maxTokens = 2000,
  responseFormat = null,
}) => {
  const openai = getClient();

  if (!openai) {
    return {
      success: true,
      isMock: true,
      content: getMockContent(userPrompt, systemPrompt),
      message: 'Using mock response — set OPENAI_API_KEY for real analysis',
    };
  }

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const options = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json') {
      options.response_format = { type: 'json_object' };
    }

    const completion = await openai.chat.completions.create(options);
    const content = completion.choices[0]?.message?.content || '';

    return {
      success: true,
      isMock: false,
      content,
      usage: completion.usage,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    // Fall back to mock on API failure so the app stays usable
    return {
      success: true,
      isMock: true,
      content: getMockContent(userPrompt, systemPrompt),
      error: error.message,
      message: 'API error — returned mock response',
    };
  }
};

export default { generateCompletion };

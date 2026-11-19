import InterviewSession from '../models/InterviewSession.js';
import Resume from '../models/Resume.js';
import { generateInterviewQuestion, evaluateInterviewAnswer } from '../services/ai.service.js';

export const startInterview = async (req, res) => {
  try {
    const { targetRole, company, difficulty, interviewType, resumeId } = req.body;

    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'Target role is required' });
    }

    let resumeSummary = '';
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
      if (resume) {
        resumeSummary = resume.rawText.slice(0, 2500);
      }
    }

    const session = await InterviewSession.create({
      user: req.user._id,
      resume: resumeId || null,
      targetRole,
      company: company || '',
      difficulty: difficulty || 'medium',
      interviewType: interviewType || 'mixed',
      status: 'in-progress',
      questions: [],
      currentQuestionIndex: 0,
    });

    // Generate first question
    const qResult = await generateInterviewQuestion({
      targetRole,
      company,
      difficulty: session.difficulty,
      interviewType: session.interviewType === 'mixed' ? 'technical' : session.interviewType,
      resumeSummary,
      previousQuestions: [],
    });

    session.questions.push({
      question: qResult.question || 'Tell me about yourself and why you are interested in this role.',
      type: qResult.type || 'hr',
      order: 0,
    });
    await session.save();

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        targetRole: session.targetRole,
        company: session.company,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        status: session.status,
        currentQuestion: session.questions[0],
        questionNumber: 1,
        totalQuestionsEstimate: 6,
      },
      isMock: qResult.isMock || false,
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'in-progress',
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Active interview session not found' });
    }

    const currentIdx = session.currentQuestionIndex;
    if (currentIdx >= session.questions.length) {
      return res.status(400).json({ success: false, message: 'No pending question' });
    }

    // Evaluate the answer
    const evaluation = await evaluateInterviewAnswer({
      question: session.questions[currentIdx].question,
      answer,
      targetRole: session.targetRole,
      difficulty: session.difficulty,
    });

    session.questions[currentIdx].userAnswer = answer;
    session.questions[currentIdx].evaluation = {
      score: evaluation.score,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      missingPoints: evaluation.missingPoints || [],
      suggestedImprovements: evaluation.suggestedImprovements || [],
      explanation: evaluation.explanation,
    };

    // Decide whether to generate next question or finish
    const maxQuestions = 5;
    if (currentIdx + 1 >= maxQuestions) {
      session.status = 'completed';
      // Simple overall report
      const scores = session.questions
        .filter((q) => q.evaluation?.score != null)
        .map((q) => q.evaluation.score);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      session.overallReport = {
        overallScore: Math.round(avg * 10) / 10,
        technicalKnowledge: avg >= 7 ? 'Strong' : avg >= 5 ? 'Adequate' : 'Needs improvement',
        communication: 'See individual feedback',
        problemSolving: 'See individual feedback',
        areasForImprovement: session.questions
          .flatMap((q) => q.evaluation?.weaknesses || [])
          .slice(0, 5),
        suggestedTopics: session.questions
          .flatMap((q) => q.evaluation?.missingPoints || [])
          .slice(0, 5),
        summary: `You completed ${session.questions.length} questions with an average score of ${avg.toFixed(1)}/10.`,
      };
    } else {
      // Generate next question
      const previousQuestions = session.questions.map((q) => q.question);
      const nextQ = await generateInterviewQuestion({
        targetRole: session.targetRole,
        company: session.company,
        difficulty: session.difficulty,
        interviewType: session.interviewType === 'mixed' ? 'technical' : session.interviewType,
        previousQuestions,
      });

      session.questions.push({
        question: nextQ.question || 'What is a challenging problem you solved recently?',
        type: nextQ.type || 'technical',
        order: currentIdx + 1,
      });
      session.currentQuestionIndex = currentIdx + 1;
    }

    await session.save();

    res.json({
      success: true,
      evaluation: session.questions[currentIdx].evaluation,
      status: session.status,
      nextQuestion:
        session.status === 'in-progress'
          ? session.questions[session.currentQuestionIndex]
          : null,
      overallReport: session.status === 'completed' ? session.overallReport : null,
      questionNumber: session.currentQuestionIndex + 1,
      isMock: evaluation.isMock || false,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .select('-questions.userAnswer')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

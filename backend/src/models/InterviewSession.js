import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  type: {
    type: String,
    enum: ['technical', 'hr', 'behavioural', 'project', 'role-specific'],
  },
  userAnswer: String,
  evaluation: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    missingPoints: [String],
    suggestedImprovements: [String],
    explanation: String,
  },
  order: Number,
});

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    targetRole: {
      type: String,
      required: true,
    },
    company: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioural', 'project-based', 'role-specific', 'mixed'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    questions: [questionSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallReport: {
      overallScore: Number,
      technicalKnowledge: String,
      communication: String,
      problemSolving: String,
      areasForImprovement: [String],
      suggestedTopics: [String],
      summary: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('InterviewSession', interviewSessionSchema);

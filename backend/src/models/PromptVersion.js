import mongoose from 'mongoose';

const promptVersionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'resume_analysis',
        'job_matching',
        'skill_gap',
        'resume_improvement',
        'mock_interview_question',
        'mock_interview_evaluation',
        'summary_generation',
      ],
    },
    version: {
      type: String,
      required: true,
    },
    technique: {
      type: String,
      enum: [
        'zero-shot',
        'role-based',
        'structured',
        'few-shot',
        'context-grounded',
        'output-constraint',
        'multi-stage',
        'chain',
      ],
    },
    template: {
      type: String,
      required: true,
    },
    inputRequirements: [String],
    expectedOutputSchema: mongoose.Schema.Types.Mixed,
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    evaluationMetrics: {
      relevance: Number,
      accuracy: Number,
      completeness: Number,
      instructionAdherence: Number,
      consistency: Number,
      hallucinationRate: Number,
      jsonValidity: Number,
      helpfulness: Number,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

promptVersionSchema.index({ category: 1, version: 1 }, { unique: true });

export default mongoose.model('PromptVersion', promptVersionSchema);

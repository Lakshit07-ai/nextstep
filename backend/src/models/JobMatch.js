import mongoose from 'mongoose';

const jobMatchSchema = new mongoose.Schema(
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
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    scoreBreakdown: {
      technicalSkills: Number,
      experience: Number,
      projects: Number,
      education: Number,
      preferredSkills: Number,
      presentation: Number,
    },
    matchedSkills: [String],
    partialSkills: [String],
    missingMustHaveSkills: [String],
    missingGoodToHaveSkills: [String],
    experienceGaps: [String],
    recommendations: [String],
    summary: String,
    promptVersion: String,
    rawAiResponse: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

jobMatchSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('JobMatch', jobMatchSchema);

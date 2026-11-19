import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    originalFileName: String,
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'text', 'manual'],
      default: 'manual',
    },
    rawText: {
      type: String,
      required: true,
    },
    extractedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
          gpa: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          startDate: String,
          endDate: String,
          description: String,
          bullets: [String],
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          bullets: [String],
          link: String,
        },
      ],
      skills: {
        technical: [String],
        soft: [String],
        tools: [String],
      },
      certifications: [String],
      achievements: [String],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Resume', resumeSchema);

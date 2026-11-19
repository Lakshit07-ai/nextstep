import Resume from '../models/Resume.js';
import { analyzeResume, improveResumeContent } from '../services/ai.service.js';

/**
 * Analyze a resume (structure, strengths, weaknesses, ATS, recommendations)
 */
export const analyzeResumeHandler = async (req, res) => {
  try {
    const { resumeId, promptVersion } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: 'resumeId is required' });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const analysis = await analyzeResume({
      resumeText: resume.rawText,
      promptVersion: promptVersion || 'v2_structured',
    });

    res.json({
      success: true,
      analysis,
      isMock: analysis.isMock || false,
      resume: { id: resume._id, title: resume.title },
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Improve a piece of resume content (bullet, summary, project description)
 * Never fabricates facts.
 */
export const improveContentHandler = async (req, res) => {
  try {
    const { originalContent, targetRole, jobDescription } = req.body;

    if (!originalContent || originalContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'originalContent is required (min 10 characters)',
      });
    }

    const result = await improveResumeContent({
      originalContent: originalContent.trim(),
      targetRole: targetRole || '',
      jobDescription: jobDescription || '',
    });

    res.json({
      success: true,
      result,
      isMock: result.isMock || false,
    });
  } catch (error) {
    console.error('Improve content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

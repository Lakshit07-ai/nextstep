import JobMatch from '../models/JobMatch.js';
import Resume from '../models/Resume.js';
import { analyzeJobMatch } from '../services/ai.service.js';

export const createMatch = async (req, res) => {
  try {
    const { resumeId, jobTitle, company, jobDescription, promptVersion } = req.body;

    if (!resumeId || !jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'resumeId, jobTitle and jobDescription are required',
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const analysis = await analyzeJobMatch({
      resumeText: resume.rawText,
      jobDescription,
      jobTitle,
      company: company || '',
      promptVersion: promptVersion || 'v2_structured',
    });

    const match = await JobMatch.create({
      user: req.user._id,
      resume: resumeId,
      jobTitle,
      company,
      jobDescription,
      matchScore: analysis.matchScore,
      scoreBreakdown: analysis.scoreBreakdown,
      matchedSkills: analysis.matchedSkills || [],
      partialSkills: analysis.partialSkills || [],
      missingMustHaveSkills: analysis.missingMustHaveSkills || [],
      missingGoodToHaveSkills: analysis.missingGoodToHaveSkills || [],
      experienceGaps: analysis.experienceGaps || [],
      recommendations: analysis.recommendations || [],
      summary: analysis.summary,
      promptVersion: analysis.promptVersion,
      rawAiResponse: analysis,
    });

    res.status(201).json({
      success: true,
      match,
      isMock: analysis.isMock || false,
    });
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const matches = await JobMatch.find({ user: req.user._id })
      .populate('resume', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatch = async (req, res) => {
  try {
    const match = await JobMatch.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'resume',
      'title rawText'
    );
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMatch = async (req, res) => {
  try {
    const match = await JobMatch.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    res.json({ success: true, message: 'Match deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

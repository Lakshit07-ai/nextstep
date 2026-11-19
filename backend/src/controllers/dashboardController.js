import Resume from '../models/Resume.js';
import JobMatch from '../models/JobMatch.js';
import InterviewSession from '../models/InterviewSession.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [resumeCount, matchCount, interviewCount, matches, recentInterviews] = await Promise.all([
      Resume.countDocuments({ user: userId }),
      JobMatch.countDocuments({ user: userId }),
      InterviewSession.countDocuments({ user: userId }),
      JobMatch.find({ user: userId }).select('matchScore createdAt jobTitle company').sort({ createdAt: -1 }).limit(5),
      InterviewSession.find({ user: userId })
        .select('targetRole company status overallReport createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const avgMatchScore =
      matches.length > 0
        ? Math.round(matches.reduce((sum, m) => sum + (m.matchScore || 0), 0) / matches.length)
        : null;

    res.json({
      success: true,
      stats: {
        totalResumes: resumeCount,
        totalMatches: matchCount,
        totalInterviews: interviewCount,
        averageMatchScore: avgMatchScore,
      },
      recentMatches: matches,
      recentInterviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

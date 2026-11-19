import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Target, MessageSquare, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = stats?.stats || {};

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-slate-500 text-sm">Your career preparation workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <FileText size={14} />
            Resumes
          </div>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{s.totalResumes ?? 0}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <Target size={14} />
            Job Matches
          </div>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{s.totalMatches ?? 0}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <MessageSquare size={14} />
            Interviews
          </div>
          <p className="mt-2 text-2xl font-semibold text-navy-900">{s.totalInterviews ?? 0}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium uppercase tracking-wide">
            <TrendingUp size={14} />
            Avg Match
          </div>
          <p className="mt-2 text-2xl font-semibold text-navy-900">
            {s.averageMatchScore != null ? `${s.averageMatchScore}%` : '—'}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/app/resumes"
          className="card p-5 hover:border-navy-200 transition-colors group"
        >
          <FileText size={20} className="text-navy-600 mb-3" />
          <h3 className="font-medium text-navy-900 group-hover:text-navy-700">Manage Resumes</h3>
          <p className="mt-1 text-sm text-slate-500">Upload or paste your resume</p>
        </Link>
        <Link
          to="/app/match"
          className="card p-5 hover:border-navy-200 transition-colors group"
        >
          <Target size={20} className="text-navy-600 mb-3" />
          <h3 className="font-medium text-navy-900 group-hover:text-navy-700">Match a Job</h3>
          <p className="mt-1 text-sm text-slate-500">Compare resume against a JD</p>
        </Link>
        <Link
          to="/app/interview"
          className="card p-5 hover:border-navy-200 transition-colors group"
        >
          <MessageSquare size={20} className="text-navy-600 mb-3" />
          <h3 className="font-medium text-navy-900 group-hover:text-navy-700">Mock Interview</h3>
          <p className="mt-1 text-sm text-slate-500">Practice for your target role</p>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-medium text-navy-900">Recent Matches</h2>
            <Link to="/app/match" className="text-xs text-accent-600 hover:text-accent-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {(stats?.recentMatches || []).length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No matches yet. Run your first job match analysis.
              </div>
            ) : (
              stats.recentMatches.map((m) => (
                <Link
                  key={m._id}
                  to={`/app/match/${m._id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-navy-900">{m.jobTitle}</p>
                    <p className="text-xs text-slate-500">{m.company || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        m.matchScore >= 70
                          ? 'text-emerald-600'
                          : m.matchScore >= 50
                          ? 'text-amber-600'
                          : 'text-red-500'
                      }`}
                    >
                      {m.matchScore}%
                    </span>
                    <ArrowRight size={14} className="text-slate-300" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-medium text-navy-900">Recent Interviews</h2>
            <Link
              to="/app/interview"
              className="text-xs text-accent-600 hover:text-accent-700 font-medium"
            >
              Practice
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {(stats?.recentInterviews || []).length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-slate-400">
                No interviews yet. Start a mock interview session.
              </div>
            ) : (
              stats.recentInterviews.map((s) => (
                <div key={s._id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy-900">{s.targetRole}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.company || '—'}
                    {s.overallReport?.overallScore != null &&
                      ` · Score ${s.overallReport.overallScore}/10`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

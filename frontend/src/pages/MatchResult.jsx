import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function MatchResult() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/matches/${id}`)
      .then((res) => setMatch(res.data.match))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />;
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Match not found</p>
        <Link to="/app/match" className="text-accent-600 text-sm mt-2 inline-block">
          Back to match
        </Link>
      </div>
    );
  }

  const score = match.matchScore ?? 0;
  const scoreColor =
    score >= 70 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBg =
    score >= 70 ? 'bg-emerald-50' : score >= 50 ? 'bg-amber-50' : 'bg-red-50';

  const breakdown = match.scoreBreakdown || {};

  return (
    <div className="max-w-4xl">
      <Link
        to="/app/match"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-6"
      >
        <ArrowLeft size={16} />
        New analysis
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-navy-900">{match.jobTitle}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{match.company || 'Company not specified'}</p>
            <p className="text-xs text-slate-400 mt-2">
              Prompt: {match.promptVersion || 'v2'} ·{' '}
              {new Date(match.createdAt).toLocaleString()}
            </p>
          </div>
          <div className={`rounded-xl px-5 py-3 text-center ${scoreBg}`}>
            <p className={`text-3xl font-bold ${scoreColor}`}>{score}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Match Score</p>
          </div>
        </div>
        {match.summary && (
          <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {match.summary}
          </p>
        )}
      </div>

      {/* Score breakdown */}
      {Object.keys(breakdown).length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-medium text-navy-900 mb-4">Score Breakdown</h2>
          <div className="space-y-3">
            {[
              { key: 'technicalSkills', label: 'Technical Skills', max: 30 },
              { key: 'experience', label: 'Relevant Experience', max: 25 },
              { key: 'projects', label: 'Projects & Practical', max: 20 },
              { key: 'education', label: 'Education', max: 10 },
              { key: 'preferredSkills', label: 'Preferred Skills', max: 10 },
              { key: 'presentation', label: 'Presentation', max: 5 },
            ].map((item) => {
              const val = breakdown[item.key] ?? 0;
              const pct = Math.min(100, (val / item.max) * 100);
              return (
                <div key={item.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium text-navy-800">
                      {val}/{item.max}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy-700 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <SkillList
          title="Matched Skills"
          items={match.matchedSkills}
          icon={<CheckCircle2 size={14} className="text-emerald-500" />}
          empty="None identified"
        />
        <SkillList
          title="Partially Matched"
          items={match.partialSkills}
          icon={<AlertCircle size={14} className="text-amber-500" />}
          empty="None"
        />
        <SkillList
          title="Missing Must-Have"
          items={match.missingMustHaveSkills}
          icon={<XCircle size={14} className="text-red-500" />}
          empty="None critical"
        />
        <SkillList
          title="Missing Nice-to-Have"
          items={match.missingGoodToHaveSkills}
          icon={<AlertCircle size={14} className="text-slate-400" />}
          empty="None"
        />
      </div>

      {/* Gaps & Recommendations */}
      {(match.experienceGaps?.length > 0 || match.recommendations?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {match.experienceGaps?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-3">Experience Gaps</h2>
              <ul className="space-y-2">
                {match.experienceGaps.map((g, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-slate-300 shrink-0">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {match.recommendations?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-3">Recommendations</h2>
              <ul className="space-y-2">
                {match.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-accent-500 shrink-0">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillList({ title, items, icon, empty }) {
  return (
    <div className="card p-5">
      <h2 className="font-medium text-navy-900 mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {!items || items.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((s, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-md bg-slate-50 text-slate-700 border border-slate-100"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

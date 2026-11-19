import { useEffect, useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AnalyzeResume() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    api.get('/resumes').then((res) => {
      setResumes(res.data.resumes);
      if (res.data.resumes.length) {
        const primary = res.data.resumes.find((r) => r.isPrimary) || res.data.resumes[0];
        setResumeId(primary._id);
      }
    });
  }, []);

  const runAnalysis = async (e) => {
    e.preventDefault();
    if (!resumeId) {
      toast.error('Select a resume');
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await api.post('/ai/analyze-resume', { resumeId });
      setAnalysis(res.data.analysis);
      setIsMock(res.data.isMock);
      if (res.data.isMock) {
        toast('Mock analysis — set OPENAI_API_KEY for real results', { icon: '⚠️' });
      } else {
        toast.success('Analysis complete');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">Resume Analysis</h1>
        <p className="mt-1 text-sm text-slate-500">
          Get structured feedback on strengths, weaknesses, ATS readiness, and improvement areas
        </p>
      </div>

      <form onSubmit={runAnalysis} className="card p-5 mb-6 flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="label">Select resume</label>
          <select
            className="input"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            required
          >
            {resumes.length === 0 && <option value="">No resumes — add one first</option>}
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading || !resumeId}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search size={16} />
              Analyze resume
            </>
          )}
        </button>
      </form>

      {analysis && (
        <div className="space-y-4">
          {isMock && (
            <div className="text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg border border-amber-100">
              Showing mock analysis. Configure OPENAI_API_KEY in backend/.env for real LLM output.
            </div>
          )}

          <div className="card p-5">
            <h2 className="font-medium text-navy-900 mb-2">Overall Assessment</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.overallAssessment}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Strengths
              </h2>
              <ul className="space-y-1.5">
                {(analysis.strengths || []).map((s, i) => (
                  <li key={i} className="text-sm text-slate-600">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Weaknesses
              </h2>
              <ul className="space-y-1.5">
                {(analysis.weaknesses || []).map((w, i) => (
                  <li key={i} className="text-sm text-slate-600">• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {analysis.atsReadability && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium text-navy-900">ATS Readability</h2>
                <span className="text-lg font-semibold text-navy-800">
                  {analysis.atsReadability.score}/100
                </span>
              </div>
              {(analysis.atsReadability.issues || []).length > 0 && (
                <ul className="mt-2 space-y-1">
                  {analysis.atsReadability.issues.map((issue, i) => (
                    <li key={i} className="text-sm text-slate-600">• {issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {analysis.suggestedProfessionalSummary && (
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-2">Suggested Professional Summary</h2>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {analysis.suggestedProfessionalSummary}
              </p>
            </div>
          )}

          {analysis.actionableRecommendations?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-3">Actionable Recommendations</h2>
              <ul className="space-y-2">
                {analysis.actionableRecommendations.map((r, i) => (
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

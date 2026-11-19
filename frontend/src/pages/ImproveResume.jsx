import { useState } from 'react';
import { Wand2, Loader2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function ImproveResume() {
  const [original, setOriginal] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImprove = async (e) => {
    e.preventDefault();
    if (original.trim().length < 10) {
      toast.error('Paste at least a short bullet or paragraph');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/improve-content', {
        originalContent: original,
        targetRole,
        jobDescription,
      });
      setResult(res.data.result);
      setIsMock(res.data.isMock);
      if (res.data.isMock) {
        toast('Mock improvement — set OPENAI_API_KEY for real results', { icon: '⚠️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Improvement failed');
    } finally {
      setLoading(false);
    }
  };

  const copyImproved = () => {
    if (!result?.improvedContent) return;
    navigator.clipboard.writeText(result.improvedContent);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">Improve Resume Content</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rewrite bullets or summaries for clarity and impact — without inventing facts or metrics
        </p>
      </div>

      <form onSubmit={handleImprove} className="card p-5 space-y-4 mb-6">
        <div>
          <label className="label">Original content *</label>
          <textarea
            className="input min-h-[120px] text-sm"
            placeholder="Paste a bullet point, project description, or summary..."
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Target role (optional)</label>
            <input
              className="input"
              placeholder="e.g. Frontend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Job description context (optional)</label>
            <input
              className="input"
              placeholder="Key requirements or paste short JD excerpt"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Improving...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Improve content
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {isMock && (
            <div className="text-xs bg-amber-50 text-amber-800 px-3 py-2 rounded-lg border border-amber-100">
              Mock result. Set OPENAI_API_KEY for real LLM rewriting.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h2 className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
                Original
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{original}</p>
            </div>
            <div className="card p-5 border-accent-200 bg-accent-50/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-medium uppercase tracking-wide text-accent-700">
                  Improved
                </h2>
                <button
                  onClick={copyImproved}
                  className="p-1.5 rounded hover:bg-white/80 text-slate-500 hover:text-navy-700"
                  title="Copy"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-sm text-navy-900 leading-relaxed whitespace-pre-wrap font-medium">
                {result.improvedContent}
              </p>
            </div>
          </div>

          {result.explanation && (
            <div className="card p-5">
              <h2 className="font-medium text-navy-900 mb-2">What changed</h2>
              <p className="text-sm text-slate-600">{result.explanation}</p>
              {result.changesMade?.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {result.changesMade.map((c, i) => (
                    <li key={i} className="text-sm text-slate-600">• {c}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result.suggestedMetricsToAdd?.length > 0 && (
            <div className="card p-5 border-amber-100 bg-amber-50/40">
              <h2 className="font-medium text-navy-900 mb-2">Metrics you could add (if true)</h2>
              <p className="text-xs text-slate-500 mb-2">
                The system will not invent numbers. Only add metrics you can genuinely support.
              </p>
              <ul className="space-y-1">
                {result.suggestedMetricsToAdd.map((m, i) => (
                  <li key={i} className="text-sm text-slate-700">• {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

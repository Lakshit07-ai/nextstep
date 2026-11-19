import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MatchJob() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [promptVersion, setPromptVersion] = useState('v2_structured');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/resumes').then((res) => {
      setResumes(res.data.resumes);
      if (res.data.resumes.length > 0) {
        const primary = res.data.resumes.find((r) => r.isPrimary) || res.data.resumes[0];
        setResumeId(primary._id);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeId || !jobTitle || !jobDescription) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/matches', {
        resumeId,
        jobTitle,
        company,
        jobDescription,
        promptVersion,
      });
      if (res.data.isMock) {
        toast('Using mock AI response — set OPENAI_API_KEY for real analysis', { icon: '⚠️' });
      } else {
        toast.success('Analysis complete');
      }
      navigate(`/app/match/${res.data.match._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">Job Description Match</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare a resume against a real job description and get an explainable match score
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Select resume *</label>
          {resumes.length === 0 ? (
            <p className="text-sm text-slate-500">
              No resumes found.{' '}
              <a href="/app/resumes" className="text-accent-600 hover:underline">
                Add one first
              </a>
            </p>
          ) : (
            <select
              className="input"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              required
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Job title *</label>
            <input
              className="input"
              placeholder="e.g. Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Company</label>
            <input
              className="input"
              placeholder="e.g. Stripe"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Job description *</label>
          <textarea
            className="input min-h-[220px] text-sm leading-relaxed"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Prompt version</label>
          <select
            className="input"
            value={promptVersion}
            onChange={(e) => setPromptVersion(e.target.value)}
          >
            <option value="v1_baseline">V1 — Baseline (zero-shot)</option>
            <option value="v2_structured">V2 — Structured (recommended)</option>
            <option value="v3_role_based">V3 — Role-based</option>
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Different prompt engineering techniques for comparison in the Prompt Lab
          </p>
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={loading || resumes.length === 0}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target size={16} />
              Run match analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
}

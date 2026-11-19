import { useState } from 'react';
import { FlaskConical, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const PROMPT_VERSIONS = [
  { id: 'v1_baseline', label: 'V1 Baseline (Zero-shot)', technique: 'zero-shot' },
  { id: 'v2_structured', label: 'V2 Structured', technique: 'structured' },
  { id: 'v3_role_based', label: 'V3 Role-based', technique: 'role-based' },
];

export default function PromptLab() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [selectedVersions, setSelectedVersions] = useState(['v2_structured']);
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);

  const toggleVersion = (id) => {
    setSelectedVersions((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const runExperiment = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error('Provide both resume text and job description');
      return;
    }
    if (selectedVersions.length === 0) {
      toast.error('Select at least one prompt version');
      return;
    }

    setRunning(true);
    setResults({});

    // Create a temporary resume for the API
    try {
      const resumeRes = await api.post('/resumes', {
        title: `PromptLab experiment ${Date.now()}`,
        rawText: resumeText,
      });
      const resumeId = resumeRes.data.resume._id;

      const newResults = {};
      for (const version of selectedVersions) {
        try {
          const res = await api.post('/matches', {
            resumeId,
            jobTitle,
            company: 'Prompt Lab Experiment',
            jobDescription,
            promptVersion: version,
          });
          newResults[version] = {
            success: true,
            data: res.data.match,
            isMock: res.data.isMock,
          };
        } catch (err) {
          newResults[version] = {
            success: false,
            error: err.response?.data?.message || 'Failed',
          };
        }
      }
      setResults(newResults);
      toast.success('Experiment complete');
    } catch (err) {
      toast.error('Failed to run experiment');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-900 tracking-tight flex items-center gap-2">
          <FlaskConical size={22} />
          Prompt Laboratory
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare different prompt engineering techniques side-by-side on the same inputs
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <label className="label">Sample Resume</label>
          <textarea
            className="input min-h-[200px] font-mono text-xs"
            placeholder="Paste a sample resume..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
        <div className="card p-5">
          <label className="label">Sample Job Description</label>
          <textarea
            className="input min-h-[200px] text-sm"
            placeholder="Paste a sample JD..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="label">Job Title</label>
            <input
              className="input"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Prompt versions to compare</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PROMPT_VERSIONS.map((v) => (
                <label
                  key={v.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    selectedVersions.includes(v.id)
                      ? 'border-navy-700 bg-navy-50 text-navy-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedVersions.includes(v.id)}
                    onChange={() => toggleVersion(v.id)}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </div>
          <button
            onClick={runExperiment}
            className="btn-primary"
            disabled={running}
          >
            {running ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} />
                Run comparison
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {Object.keys(results).length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {selectedVersions.map((version) => {
            const r = results[version];
            const meta = PROMPT_VERSIONS.find((v) => v.id === version);
            if (!r) return null;

            return (
              <div key={version} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-navy-900 text-sm">{meta?.label}</h3>
                  {r.isMock && (
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                      MOCK
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">Technique: {meta?.technique}</p>

                {!r.success ? (
                  <p className="text-sm text-red-500">{r.error}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-2">
                      <span className="text-3xl font-bold text-navy-900">
                        {r.data.matchScore ?? '—'}
                      </span>
                      <span className="text-sm text-slate-400 ml-1">score</span>
                    </div>
                    {r.data.summary && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                        {r.data.summary}
                      </p>
                    )}
                    <div className="text-xs space-y-1">
                      <p>
                        <span className="text-slate-400">Matched:</span>{' '}
                        {(r.data.matchedSkills || []).length}
                      </p>
                      <p>
                        <span className="text-slate-400">Missing must-have:</span>{' '}
                        {(r.data.missingMustHaveSkills || []).length}
                      </p>
                      <p>
                        <span className="text-slate-400">Recommendations:</span>{' '}
                        {(r.data.recommendations || []).length}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(results).length === 0 && !running && (
        <div className="card p-12 text-center text-sm text-slate-400">
          Run an experiment to compare prompt versions side-by-side
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { MessageSquare, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Interview() {
  const [step, setStep] = useState('setup'); // setup | active | completed
  const [targetRole, setTargetRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewType, setInterviewType] = useState('mixed');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [overallReport, setOverallReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const startInterview = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      toast.error('Target role is required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/interviews/start', {
        targetRole,
        company,
        difficulty,
        interviewType,
      });
      setSessionId(res.data.session.id);
      setCurrentQuestion(res.data.session.currentQuestion);
      setQuestionNumber(1);
      setStep('active');
      if (res.data.isMock) {
        toast('Using mock questions — set OPENAI_API_KEY for real AI', { icon: '⚠️' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please write an answer');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/sessions/${sessionId}/answer`, { answer });
      setEvaluation(res.data.evaluation);
      if (res.data.status === 'completed') {
        setOverallReport(res.data.overallReport);
        setStep('completed');
      } else {
        // Show evaluation briefly then move to next
        setTimeout(() => {
          setCurrentQuestion(res.data.nextQuestion);
          setQuestionNumber(res.data.questionNumber);
          setAnswer('');
          setEvaluation(null);
        }, 100);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('setup');
    setSessionId(null);
    setCurrentQuestion(null);
    setAnswer('');
    setEvaluation(null);
    setOverallReport(null);
  };

  if (step === 'setup') {
    return (
      <div className="max-w-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">Mock Interview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Practice with role-specific questions and get structured feedback
          </p>
        </div>

        <form onSubmit={startInterview} className="card p-6 space-y-4">
          <div>
            <label className="label">Target role *</label>
            <input
              className="input"
              placeholder="e.g. Backend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input
              className="input"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Interview type</label>
              <select
                className="input"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
              >
                <option value="mixed">Mixed</option>
                <option value="technical">Technical</option>
                <option value="behavioural">Behavioural</option>
                <option value="hr">HR</option>
                <option value="project-based">Project-based</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <MessageSquare size={16} />
                Start interview
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="max-w-2xl">
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-navy-900">Interview Complete</h1>
          {overallReport && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-navy-900">
                  {overallReport.overallScore}
                  <span className="text-base font-normal text-slate-400">/10</span>
                </div>
                <p className="text-sm text-slate-600">{overallReport.summary}</p>
              </div>
              {overallReport.areasForImprovement?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-navy-800 mb-2">Areas to improve</h3>
                  <ul className="space-y-1">
                    {overallReport.areasForImprovement.map((a, i) => (
                      <li key={i} className="text-sm text-slate-600">• {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {overallReport.suggestedTopics?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-navy-800 mb-2">Suggested topics</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {overallReport.suggestedTopics.map((t, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-slate-50 border border-slate-100 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button onClick={reset} className="btn-primary mt-6">
            Start another interview
          </button>
        </div>
      </div>
    );
  }

  // Active interview
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Question {questionNumber} of ~5
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {targetRole} {company && `· ${company}`}
          </p>
        </div>
        <button onClick={reset} className="text-xs text-slate-400 hover:text-slate-600">
          End session
        </button>
      </div>

      <div className="card p-6 mb-4">
        <p className="text-navy-900 leading-relaxed">{currentQuestion?.question}</p>
        {currentQuestion?.type && (
          <span className="inline-block mt-3 text-[10px] uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
            {currentQuestion.type}
          </span>
        )}
      </div>

      {evaluation && (
        <div className="card p-5 mb-4 border-l-4 border-l-accent-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-semibold text-navy-900">{evaluation.score}/10</span>
            <span className="text-sm text-slate-500">Score</span>
          </div>
          {evaluation.explanation && (
            <p className="text-sm text-slate-600 mb-3">{evaluation.explanation}</p>
          )}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {evaluation.strengths?.length > 0 && (
              <div>
                <p className="font-medium text-emerald-700 mb-1">Strengths</p>
                <ul className="space-y-0.5 text-slate-600">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            {evaluation.weaknesses?.length > 0 && (
              <div>
                <p className="font-medium text-amber-700 mb-1">Weaknesses</p>
                <ul className="space-y-0.5 text-slate-600">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card p-4">
        <textarea
          className="input min-h-[140px] border-0 focus:ring-0 p-0"
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
        />
        <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={submitAnswer}
            className="btn-primary"
            disabled={submitting || !answer.trim()}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit answer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { FileText, Target, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-semibold text-navy-900 tracking-tight">NextStep</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/app" className="btn-primary text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-navy-700 hover:text-navy-900">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-navy-950 tracking-tight leading-[1.15]">
            Stop sending generic resumes. Start matching the job.
          </h1>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            NextStep analyzes your resume against real job descriptions, shows exactly where you
            fall short, and helps you improve with evidence-based recommendations — not vague
            advice.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-5 py-3">
              Analyze your resume
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary px-5 py-3">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl font-semibold text-navy-900 tracking-tight">
            Built for the actual hiring process
          </h2>
          <p className="mt-2 text-slate-600 max-w-xl">
            Not another chatbot. Structured analysis designed around how recruiters and ATS systems
            actually evaluate candidates.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                <Target size={20} className="text-navy-700" />
              </div>
              <h3 className="font-semibold text-navy-900">Job Description Matching</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Get a transparent match score with a clear breakdown across technical skills,
                experience, projects, and presentation. See exactly which skills are missing.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                <FileText size={20} className="text-navy-700" />
              </div>
              <h3 className="font-semibold text-navy-900">Resume Improvement</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Rewrite bullet points and summaries while preserving every real fact. No invented
                metrics or technologies — only better presentation of what you actually did.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center mb-4">
                <MessageSquare size={20} className="text-navy-700" />
              </div>
              <h3 className="font-semibold text-navy-900">Mock Interviews</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Practice technical, behavioural, and role-specific questions. Receive specific
                feedback on your answers, not generic praise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl font-semibold text-navy-900 tracking-tight">How it works</h2>
        <div className="mt-10 space-y-6">
          {[
            {
              step: '01',
              title: 'Upload or paste your resume',
              desc: 'PDF, DOCX, or plain text. We extract the content so you can review and edit it.',
            },
            {
              step: '02',
              title: 'Paste a real job description',
              desc: 'Add the role title and company. The system compares your resume against the actual requirements.',
            },
            {
              step: '03',
              title: 'Review the match analysis',
              desc: 'See matched skills, gaps, score breakdown, and concrete recommendations grounded in your content.',
            },
            {
              step: '04',
              title: 'Improve and practice',
              desc: 'Rewrite weak sections and run mock interviews tailored to the target role.',
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-5">
              <div className="text-sm font-mono text-slate-400 pt-0.5 w-8 shrink-0">{item.step}</div>
              <div>
                <h3 className="font-medium text-navy-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            <div>
              <h3 className="font-semibold text-navy-900">Evidence-based, not invented</h3>
              <p className="mt-2 text-sm text-slate-600 max-w-sm">
                The system is instructed never to fabricate skills, projects, or metrics. If
                something is missing, it says so.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Your data stays yours</h3>
              <p className="mt-2 text-sm text-slate-600 max-w-sm">
                Resumes and analyses are tied to your account. We do not use your documents to train
                models.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-navy-900">Built around prompt engineering</h3>
              <p className="mt-2 text-sm text-slate-600 max-w-sm">
                Multiple prompt versions, structured outputs, and a Prompt Laboratory for evaluating
                and comparing approaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-navy-900">Ready to improve your next application?</h2>
        <p className="mt-2 text-slate-600">Create a free account and run your first match analysis.</p>
        <Link to="/register" className="btn-primary mt-6 inline-flex px-6 py-3">
          Get started free
          <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            <span>NextStep</span>
          </div>
          <p>AI-powered career assistant for students and job seekers</p>
        </div>
      </footer>
    </div>
  );
}

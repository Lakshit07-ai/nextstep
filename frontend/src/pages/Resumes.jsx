import { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchResumes = () => {
    api
      .get('/resumes')
      .then((res) => setResumes(res.data.resumes))
      .catch(() => toast.error('Failed to load resumes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) {
      toast.error('Title and resume text are required');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/resumes', { title, rawText });
      toast.success('Resume saved');
      setShowForm(false);
      setTitle('');
      setRawText('');
      fetchResumes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume uploaded and text extracted');
      fetchResumes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      toast.success('Deleted');
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900 tracking-tight">Resumes</h1>
          <p className="mt-1 text-sm text-slate-500">Upload or paste resumes to analyze against jobs</p>
        </div>
        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer">
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload PDF/DOCX'}
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} />
            Paste text
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-navy-900">Add resume from text</h2>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="e.g. Software Engineer Resume – Oct 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Resume text</label>
              <textarea
                className="input min-h-[240px] font-mono text-xs leading-relaxed"
                placeholder="Paste your full resume text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save resume'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">No resumes yet. Upload a PDF or paste your text to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((r) => (
            <div key={r._id} className="card p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-navy-900 truncate">{r.title}</h3>
                  {r.isPrimary && (
                    <span className="text-[10px] uppercase tracking-wide bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded font-medium">
                      Primary
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {r.fileType?.toUpperCase() || 'TEXT'} · {r.rawText?.length || 0} characters ·{' '}
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-xs text-slate-400 line-clamp-2 font-mono">
                  {r.rawText?.slice(0, 180)}...
                </p>
              </div>
              <button
                onClick={() => handleDelete(r._id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

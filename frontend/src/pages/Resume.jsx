import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';

const Resume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Loads all of the logged-in student's resumes, newest first.
  const fetchResumes = useCallback(async () => {
    setError('');
    try {
      const res = await api.get('/resumes/mine');
      setResumes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Runs once when the page opens, so saved resumes appear after a refresh.
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Student"
          title="My resumes"
          subtitle="Upload resumes to unlock AI analysis and job matching."
          action={
            <Link
              to="/job-matcher"
              className="inline-flex items-center bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Job Matcher →
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:col-span-1 h-fit">
            <h2 className="font-semibold text-slate-800 mb-1">Upload a resume</h2>
            <p className="text-sm text-slate-500 mb-4">
              Add a new version whenever you update your resume.
            </p>
            <ResumeUpload onUploadSuccess={fetchResumes} />
          </div>

          {/* List */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Your resumes</h2>
              {!loading && (
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  {resumes.length} saved
                </span>
              )}
            </div>

            {error && (
              <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</p>
            )}

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 animate-pulse">
                    <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                    <div className="h-3 w-1/4 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 text-center">
                <p className="text-3xl mb-2">📄</p>
                <p className="font-medium text-slate-700">No resumes yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Upload your first resume to start matching with jobs.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {resumes.map((r, index) => {
                  const analyzed = r.aiAnalysis?.skills?.length > 0;
                  return (
                    <li
                      key={r._id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">
                          PDF
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{r.fileName}</p>
                          <p className="text-xs text-slate-500">
                            Uploaded {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {index === 0 && (
                          <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                            Latest
                          </span>
                        )}
                        {analyzed && (
                          <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                            Analyzed
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Resume;
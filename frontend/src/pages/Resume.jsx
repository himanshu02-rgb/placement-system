import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';

const tones = {
  indigo: { dot: 'bg-indigo-500', ring: 'border-t-indigo-500' },
  emerald: { dot: 'bg-emerald-500', ring: 'border-t-emerald-500' },
  rose: { dot: 'bg-rose-500', ring: 'border-t-rose-500' },
  amber: { dot: 'bg-amber-500', ring: 'border-t-amber-500' },
};

// A resume counts as analyzed once its saved analysis has skills.
const hasAnalysis = (resume) => resume.aiAnalysis?.skills?.length > 0;

const Resume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback panel: which resume is open, and which one is being analyzed right now
  const [activeId, setActiveId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

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

  // Runs once when the page opens, so saved resumes and their feedback appear after a refresh.
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const activeResume = resumes.find((r) => r._id === activeId);

  // Analyzes one specific resume and saves the result on its card.
  const analyzeResume = async (resume) => {
    setActiveId(resume._id);
    setAnalyzingId(resume._id);
    setAnalysisError('');
    try {
      const res = await api.post('/ai/resume-analysis', { resumeId: resume._id });
      setResumes((prev) =>
        prev.map((r) => (r._id === resume._id ? { ...r, aiAnalysis: res.data } : r))
      );
    } catch (err) {
      setAnalysisError(err.response?.data?.message || 'Could not analyze this resume. Please try again.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleCardAction = (resume) => {
    if (hasAnalysis(resume)) {
      // Saved feedback: open or close the panel without an AI request
      setAnalysisError('');
      setActiveId((prev) => (prev === resume._id ? null : resume._id));
    } else {
      analyzeResume(resume);
    }
  };

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Student"
          title="My resumes"
          subtitle="Upload resumes, get AI feedback on each one, and use them for job matching."
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

          {/* List and feedback */}
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
                  const analyzed = hasAnalysis(r);
                  const isAnalyzing = analyzingId === r._id;

                  let buttonLabel = 'Analyze';
                  if (isAnalyzing) buttonLabel = 'Analyzing...';
                  else if (analyzed) buttonLabel = activeId === r._id ? 'Hide feedback' : 'View feedback';

                  return (
                    <li
                      key={r._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
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

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">
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
                        <button
                          type="button"
                          onClick={() => handleCardAction(r)}
                          disabled={analyzingId !== null}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                        >
                          {buttonLabel}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Feedback panel for the selected resume */}
            {activeResume && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800">AI feedback</h3>
                    <p className="text-xs text-slate-500 truncate">{activeResume.fileName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    className="text-sm text-slate-500 hover:text-slate-800 shrink-0"
                  >
                    Close
                  </button>
                </div>

                {analysisError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {analysisError}
                  </div>
                )}

                {analyzingId === activeResume._id ? (
                  <>
                    <p className="text-xs text-slate-400 mb-3">This can take up to 30 seconds.</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  </>
                ) : hasAnalysis(activeResume) ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Section title="Skills" items={activeResume.aiAnalysis.skills} tone="indigo" />
                    <Section title="Strengths" items={activeResume.aiAnalysis.strengths} tone="emerald" />
                    <Section title="Missing Skills" items={activeResume.aiAnalysis.missingSkills} tone="rose" />
                    <Section title="Suggestions" items={activeResume.aiAnalysis.suggestions} tone="amber" />
                  </div>
                ) : (
                  !analysisError && (
                    <p className="text-sm text-slate-500">No feedback yet for this resume.</p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const Section = ({ title, items, tone }) => {
  const style = tones[tone];
  return (
    <div className={`bg-white border border-slate-200 border-t-4 ${style.ring} rounded-xl p-5 shadow-sm`}>
      <h4 className="font-semibold text-slate-800 mb-3">{title}</h4>
      {items?.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${style.dot}`} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">None listed.</p>
      )}
    </div>
  );
};

export default Resume;
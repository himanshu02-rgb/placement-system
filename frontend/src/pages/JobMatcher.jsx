import { useState, useEffect } from 'react';
import api from '../services/api';
import ResumeUpload from '../components/ResumeUpload';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';

const JOB_MODES = [
  { id: 'posted', label: 'Posted job' },
  { id: 'paste', label: 'Paste text' },
  { id: 'upload', label: 'Upload PDF' },
];

const JobMatcher = () => {
  // Resume state
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Job state
  const [jobs, setJobs] = useState([]);
  const [jobMode, setJobMode] = useState('posted'); // 'posted' | 'paste' | 'upload'
  const [selectedJob, setSelectedJob] = useState('');
  const [jobDescription, setJobDescription] = useState(''); // shared by 'paste' and 'upload'
  const [jdFileName, setJdFileName] = useState('');
  const [uploadingJd, setUploadingJd] = useState(false);
  const [jdUploadError, setJdUploadError] = useState('');

  // Page state
  const [loadingData, setLoadingData] = useState(true);
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const hasResumes = resumes.length > 0;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumeRes, jobRes] = await Promise.all([
          api.get('/resumes/mine'),
          api.get('/jobs'),
        ]);
        setResumes(resumeRes.data);
        if (resumeRes.data.length > 0) {
          setSelectedResumeId(resumeRes.data[0]._id); // newest is selected by default
        }
        setJobs(jobRes.data);
      } catch (err) {
        setError('Could not load your resumes or jobs. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleUploadSuccess = (newResume) => {
    setResumes((prev) => [newResume, ...prev]);
    setSelectedResumeId(newResume._id);
    setShowUpload(false);
    setResult(null);
    setError('');
  };

  const handleSelectResume = (id) => {
    setSelectedResumeId(id);
    setResult(null);
  };

  const handleChangeMode = (mode) => {
    setJobMode(mode);
    setResult(null);
    setJdUploadError('');
  };

  // Reads the chosen JD PDF through the backend and puts the text into the shared state.
  const handleJdUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again later
    if (!file) return;

    setJdUploadError('');
    setResult(null);
    setUploadingJd(true);
    try {
      const data = new FormData();
      data.append('jd', file);
      const res = await api.post('/jobs/parse-jd', data);
      setJobDescription(res.data.text);
      setJdFileName(file.name);
    } catch (err) {
      setJdUploadError(err.response?.data?.message || 'Could not read this PDF');
    } finally {
      setUploadingJd(false);
    }
  };

  const clearJobText = () => {
    setJobDescription('');
    setJdFileName('');
    setResult(null);
  };

  const hasJobText = jobDescription.trim().length > 0;

  const canMatch =
    !matching &&
    Boolean(selectedResumeId) &&
    !uploadingJd &&
    (jobMode === 'posted' ? Boolean(selectedJob) : hasJobText);

  const handleMatch = async () => {
    setMatching(true);
    setError('');
    setResult(null);

    const payload = { resumeId: selectedResumeId };
    if (jobMode === 'posted') {
      payload.jobId = selectedJob;
    } else {
      payload.jobDescription = jobDescription.trim();
    }

    try {
      const res = await api.post('/ai/job-match', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Job match failed. Please try again.');
    } finally {
      setMatching(false);
    }
  };

  const scoreColor =
    result?.matchScore >= 75
      ? 'text-emerald-600'
      : result?.matchScore >= 50
      ? 'text-amber-600'
      : 'text-rose-600';

  const hint = !selectedResumeId
    ? 'Select or upload a resume to continue'
    : jobMode === 'posted'
    ? 'Select a job to continue'
    : 'Paste or upload a job description to continue';

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <PageHeader
          eyebrow="Student"
          title="AI job matcher"
          subtitle="Check how well one of your resumes fits a specific job."
        />

        {/* Step 1: Resume */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800">1. Choose your resume</p>
            {hasResumes && !showUpload && (
              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Upload new
              </button>
            )}
          </div>

          {loadingData ? (
            <p className="text-sm text-slate-500">Loading your resumes...</p>
          ) : hasResumes ? (
            <div className="flex flex-col gap-2">
              {resumes.map((r) => {
                const isSelected = r._id === selectedResumeId;
                return (
                  <button
                    key={r._id}
                    type="button"
                    onClick={() => handleSelectResume(r._id)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-800">📄 {r.fileName}</span>
                        <span className="block text-xs text-slate-500">
                          Uploaded {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </span>
                    {isSelected && (
                      <span className="text-xs font-medium text-indigo-700">Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-3">
              You need a resume to run a match. Upload one below and it will be saved to your account.
            </p>
          )}

          {(!hasResumes || showUpload) && !loadingData && (
            <div className="mt-4">
              <ResumeUpload onUploadSuccess={handleUploadSuccess} />
              {hasResumes && (
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="mt-3 text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Job */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-5">
          <p className="font-semibold text-slate-800 mb-3">2. Choose the job</p>

          <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1">
            {JOB_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleChangeMode(mode.id)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  jobMode === mode.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {jobMode === 'posted' && (
            <select
              value={selectedJob}
              onChange={(e) => {
                setSelectedJob(e.target.value);
                setResult(null);
              }}
              className="border border-slate-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} — {job.company}
                </option>
              ))}
            </select>
          )}

          {jobMode === 'paste' && (
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setJdFileName(''); // edited text is no longer the original PDF
                setResult(null);
              }}
              rows={7}
              placeholder="Paste the job description here (responsibilities, required skills, qualifications)..."
              className="border border-slate-300 p-3 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {jobMode === 'upload' && (
            <div className="flex flex-col gap-3">
              <label
                htmlFor="student-jd-pdf"
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-4 py-6 text-center transition-colors ${
                  uploadingJd
                    ? 'opacity-60 pointer-events-none'
                    : 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40'
                }`}
              >
                <span className="text-sm font-medium text-slate-700">
                  {uploadingJd ? 'Reading PDF...' : 'Click to choose a job description PDF'}
                </span>
                <span className="text-xs text-slate-400 mt-1">PDF only, max 5MB</span>
              </label>
              <input
                id="student-jd-pdf"
                type="file"
                accept="application/pdf"
                onChange={handleJdUpload}
                disabled={uploadingJd}
                className="hidden"
              />

              {jdUploadError && (
                <p className="text-xs text-rose-600">{jdUploadError}</p>
              )}

              {hasJobText && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-emerald-700">
                      {jdFileName ? `Loaded from ${jdFileName}` : 'Job description loaded'}
                    </p>
                    <button
                      type="button"
                      onClick={clearJobText}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-line max-h-40 overflow-y-auto">
                    {jobDescription}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Switch to "Paste text" to edit it.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Run */}
        <button
          type="button"
          onClick={handleMatch}
          disabled={!canMatch}
          className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full"
        >
          {matching ? 'Matching... this may take a few seconds' : 'Run match'}
        </button>

        {!canMatch && !matching && (
          <p className="text-xs text-slate-500 mt-2 text-center">{hint}</p>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <p className="text-center mb-5">
              <span className={`text-4xl font-bold ${scoreColor}`}>{result.matchScore}%</span>
              <span className="block text-sm text-slate-500 mt-1">Match score</span>
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <p className="font-semibold text-slate-800 text-sm mb-2">Matching skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm mb-2">Missing skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.map((s, i) => (
                    <span
                      key={i}
                      className="bg-rose-50 text-rose-600 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm mb-2">Recommendations</p>
                <ul className="flex flex-col gap-1.5">
                  {result.recommendations?.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default JobMatcher;
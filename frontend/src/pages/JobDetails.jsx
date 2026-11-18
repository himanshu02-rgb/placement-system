import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/PageShell';
import Skeleton from '../components/Skeleton';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [jobError, setJobError] = useState('');

  // Student: their resumes, and which one to send with the application
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Recruiter: whether this job belongs to them
  const [isOwner, setIsOwner] = useState(false);

  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        setJobError(err.response?.data?.message || 'Could not load this job');
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'student') {
      api
        .get('/resumes/mine')
        .then((res) => {
          setResumes(res.data);
          if (res.data.length > 0) {
            setSelectedResumeId(res.data[0]._id); // newest is selected by default
          }
        })
        .catch(() => setResumes([]));
    }

    if (user.role === 'admin') {
      api
        .get('/jobs/mine')
        .then((res) => setIsOwner(res.data.some((j) => j._id === id)))
        .catch(() => setIsOwner(false));
    }
  }, [user?.role, id]);

  const handleApply = async () => {
    setApplying(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post(`/jobs/${id}/apply`, { resumeId: selectedResumeId });
      const used = resumes.find((r) => r._id === selectedResumeId);
      setMessage({
        type: 'success',
        text: `Applied successfully with ${used?.fileName || 'your resume'}.`,
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply' });
    } finally {
      setApplying(false);
    }
  };

  if (jobError) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto text-center">
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{jobError}</p>
          <Link to="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to jobs
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!job) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96 w-full" />
        </div>
      </PageShell>
    );
  }

  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'admin';

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto">
        <Link to="/jobs" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          ← Back to jobs
        </Link>

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xl font-semibold">
              {job.company?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
              <p className="text-slate-500 mt-1">
                {job.company} · {job.location}
              </p>
            </div>
          </div>

          {job.salary && (
            <p className="mt-5 inline-block text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
              {job.salary}
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-800 mb-2">Job description</p>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-800 mb-2">Required skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action panel, based on role */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            {!user && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-slate-600">Log in as a student to apply for this job.</p>
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Log in
                </Link>
              </div>
            )}

            {isRecruiter && isOwner && (
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-slate-600">You posted this job.</p>
                <Link
                  to={`/my-jobs/${id}/applicants`}
                  className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View applicants
                </Link>
              </div>
            )}

            {isRecruiter && !isOwner && (
              <p className="text-sm text-slate-500">
                This job was posted by another recruiter.
              </p>
            )}

            {isStudent && (
              <div>
                <p className="font-semibold text-slate-800 mb-3">Apply with a resume</p>

                {resumes.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-slate-200 p-5 text-center">
                    <p className="text-sm text-slate-600">You need a resume to apply.</p>
                    <Link
                      to="/resume"
                      className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Upload a resume →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 mb-4">
                      {resumes.map((r) => {
                        const isSelected = r._id === selectedResumeId;
                        return (
                          <button
                            key={r._id}
                            type="button"
                            onClick={() => setSelectedResumeId(r._id)}
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
                              <span className="text-sm font-medium text-slate-800">📄 {r.fileName}</span>
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={applying || !selectedResumeId}
                      className="w-full bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {applying ? 'Applying...' : 'Apply now'}
                    </button>
                  </>
                )}
              </div>
            )}

            {message.text && (
              <p
                className={`mt-4 text-sm px-3 py-2 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default JobDetails;
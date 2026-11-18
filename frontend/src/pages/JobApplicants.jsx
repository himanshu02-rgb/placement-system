import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

// The stage the "Next round" button moves to. Selected and Rejected are final outcomes.
const NEXT_ROUND = { Applied: 'Shortlisted', Shortlisted: 'Interview' };

const STAGE_STYLES = {
  Applied: 'bg-sky-50 text-sky-700 ring-sky-200',
  Shortlisted: 'bg-amber-50 text-amber-700 ring-amber-200',
  Interview: 'bg-violet-50 text-violet-700 ring-violet-200',
  Selected: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
};

const JobApplicants = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [filter, setFilter] = useState('All');
  const [busyId, setBusyId] = useState('');
  const [rowErrors, setRowErrors] = useState({});

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get(`/jobs/${id}/applicants`);
        setJob(res.data.job);
        setApplications(res.data.applications);
      } catch (err) {
        setPageError(err.response?.data?.message || 'Could not load applicants');
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [id]);

  const counts = useMemo(() => {
    const result = {};
    STAGES.forEach((stage) => {
      result[stage] = applications.filter((a) => a.status === stage).length;
    });
    return result;
  }, [applications]);

  const visible =
    filter === 'All' ? applications : applications.filter((a) => a.status === filter);

  const updateStatus = async (appId, status) => {
    setBusyId(appId);
    setRowErrors((prev) => ({ ...prev, [appId]: '' }));
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status });
      // Keep the populated student and resume fields; only the status changes.
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: res.data.status } : a))
      );
    } catch (err) {
      setRowErrors((prev) => ({
        ...prev,
        [appId]: err.response?.data?.message || 'Could not update status',
      }));
    } finally {
      setBusyId('');
    }
  };

  // Opens the PDF through the authenticated API, so only the owner or the job's recruiter can see it.
  const openResume = async (resume) => {
    // Open the tab first, so the browser does not block it as a popup.
    const tab = window.open('', '_blank');
    try {
      const res = await api.get(`/resumes/${resume._id}/file`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      if (tab) {
        tab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (tab) tab.close();
      setPageError('Could not open this resume.');
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </PageShell>
    );
  }

  if (pageError && !job) {
    return (
      <PageShell>
        <div className="max-w-xl mx-auto text-center">
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{pageError}</p>
          <Link to="/my-jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to my jobs
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Recruiter"
          title={`Applicants: ${job?.title || ''}`}
          subtitle={job?.company}
          action={
            <Link
              to="/my-jobs"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-2"
            >
              ← Back to my jobs
            </Link>
          }
        />

        {pageError && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{pageError}</p>
        )}

        {/* Stage filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', ...STAGES].map((stage) => {
            const count = stage === 'All' ? applications.length : counts[stage];
            const active = filter === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setFilter(stage)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {stage} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No applicants yet"
            message="Students who apply to this job will show up here with their resume."
          />
        ) : visible.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No applicants in this stage.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((app) => {
              const isBusy = busyId === app._id;
              const nextStage = NEXT_ROUND[app.status];
              const isFinal = app.status === 'Selected' || app.status === 'Rejected';
              const studentName = app.userId?.name || 'Unknown student';

              return (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Candidate */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold">
                        {studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{studentName}</p>
                        <p className="text-sm text-slate-500 truncate">{app.userId?.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Resume and stage */}
                    <div className="flex flex-wrap items-center gap-3">
                      {app.resumeId ? (
                        <button
                          type="button"
                          onClick={() => openResume(app.resumeId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                        >
                          📄 <span className="max-w-[180px] truncate">{app.resumeId.fileName}</span>
                          <span className="text-xs font-medium text-indigo-600">View</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No resume attached</span>
                      )}

                      <span
                        className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-inset ${STAGE_STYLES[app.status]}`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                    {nextStage && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(app._id, nextStage)}
                        className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                      >
                        Move to {nextStage}
                      </button>
                    )}
                    {app.status !== 'Selected' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(app._id, 'Selected')}
                        className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                      >
                        Select
                      </button>
                    )}
                    {app.status !== 'Rejected' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(app._id, 'Rejected')}
                        className="bg-white border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-50 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    )}

                    {/* Any stage, for reopening or correcting a decision */}
                    <select
                      value={app.status}
                      disabled={isBusy}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className="ml-auto border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>

                    {isBusy && <span className="text-xs text-slate-500">Saving...</span>}
                  </div>

                  {rowErrors[app._id] && (
                    <p className="mt-3 text-xs text-rose-600">{rowErrors[app._id]}</p>
                  )}
                  {isFinal && !isBusy && !rowErrors[app._id] && null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default JobApplicants;
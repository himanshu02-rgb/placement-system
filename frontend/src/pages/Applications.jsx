import { useEffect, useState } from 'react';
import api from '../services/api';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

const STAGE_STYLES = {
  Applied: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', count: 'text-sky-700' },
  Shortlisted: { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500', count: 'text-amber-700' },
  Interview: { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500', count: 'text-violet-700' },
  Selected: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', count: 'text-emerald-700' },
  Rejected: { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', count: 'text-rose-700' },
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const counts = STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter((app) => app.status === stage).length;
    return acc;
  }, {});

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          eyebrow="Student"
          title="My applications"
          subtitle="Track every job you've applied to and its current stage."
        />

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        {/* Stage summary */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {STAGES.map((stage) => (
              <div key={stage} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stage}</p>
                <p className={`text-2xl font-bold mt-1 ${STAGE_STYLES[stage].count}`}>
                  {counts[stage]}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 && !error ? (
          <EmptyState
            icon="📭"
            title="No applications yet"
            message="Once you apply to a job, it will show up here with its stage."
            actionLabel="Browse jobs"
            actionTo="/jobs"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((app) => {
              const style = STAGE_STYLES[app.status] || STAGE_STYLES.Applied;
              const initial = app.jobId?.company?.charAt(0)?.toUpperCase() || '?';
              const subtitle = [app.jobId?.company, app.jobId?.location].filter(Boolean).join(' · ');

              return (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {app.jobId?.title || 'Job no longer available'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{subtitle || '—'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {app.createdAt && `Applied ${new Date(app.createdAt).toLocaleDateString()}`}
                        {app.resumeId?.fileName && ` · Resume: ${app.resumeId.fileName}`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ring-inset ${style.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Applications;
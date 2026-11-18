import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

const studentActions = [
  { to: '/jobs', icon: '💼', title: 'Browse jobs', desc: 'Find and apply to open roles.' },
  { to: '/resume', icon: '📄', title: 'Manage resume', desc: 'Upload and review your resumes.' },
  { to: '/job-matcher', icon: '🎯', title: 'Check job match', desc: 'See how well you fit a role.' },
  { to: '/ai-interview', icon: '🎤', title: 'Practice interview', desc: 'Get questions and feedback.' },
];

const adminActions = [
  { to: '/create-job', icon: '➕', title: 'Post a job', desc: 'Publish a new opening for students.' },
  { to: '/jobs', icon: '💼', title: 'View listings', desc: 'See how jobs appear to students.' },
];

const PipelineBar = ({ stats }) => {
  const parts = [
    { label: 'Applied', value: stats.applied, color: 'bg-sky-500' },
    { label: 'Shortlisted', value: stats.shortlisted, color: 'bg-amber-500' },
    { label: 'Selected', value: stats.selected, color: 'bg-emerald-500' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-rose-500' },
  ];
  const total = stats.total || 1;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-4 font-semibold text-slate-900">Application pipeline</p>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {parts.map((p) => (
          <div
            key={p.label}
            className={`${p.color} transition-all duration-500`}
            style={{ width: `${(p.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
        {parts.map((p) => (
          <span key={p.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
            {p.label} ({p.value})
          </span>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const firstName = user?.name?.split(' ')[0] ?? '';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(!isAdmin);
  const [error, setError] = useState('');

  useEffect(() => {
    // Admins don't have an application pipeline, so skip the stats request
    if (isAdmin) return;

    const fetchStats = async () => {
      try {
        const res = await api.get('/applications/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError('Could not load your application stats. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);

  const actions = isAdmin ? adminActions : studentActions;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${firstName}`}
        subtitle={
          isAdmin
            ? 'Manage job postings and see what students see.'
            : 'Track your applications and get ready for your next interview.'
        }
      />

      {/* Student: application overview */}
      {!isAdmin && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Application overview</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : stats && stats.total > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatCard icon="📋" label="Total" value={stats.total} tone="indigo" />
                <StatCard icon="📨" label="Applied" value={stats.applied} tone="sky" />
                <StatCard icon="⭐" label="Shortlisted" value={stats.shortlisted} tone="amber" />
                <StatCard icon="🎉" label="Selected" value={stats.selected} tone="emerald" />
                <StatCard icon="✖️" label="Rejected" value={stats.rejected} tone="rose" />
              </div>
              <PipelineBar stats={stats} />
            </>
          ) : stats ? (
            <EmptyState
              icon="🚀"
              title="No applications yet"
              message="Browse open roles and apply. Your progress will show up here."
              actionLabel="Browse jobs"
              actionTo="/jobs"
            />
          ) : null}
        </section>
      )}

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className={`grid gap-4 ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {actions.map((action) => (
            <Link
              key={action.to + action.title}
              to={action.to}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                {action.icon}
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{action.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Dashboard;
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs/mine');
        setJobs(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0);

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="Recruiter"
          title="My jobs"
          subtitle="Only the jobs you posted are shown here."
          action={
            <Link
              to="/create-job"
              className="inline-flex items-center bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Post a job
            </Link>
          }
        />

        {!loading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatCard icon="💼" label="Jobs posted" value={jobs.length} tone="indigo" />
            <StatCard icon="👥" label="Total applicants" value={totalApplicants} tone="emerald" />
          </div>
        )}

        {error && (
          <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-4">{error}</p>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 && !error ? (
          <EmptyState
            icon="🗂️"
            title="No jobs posted yet"
            message="Post your first job and applicants will show up here."
            actionLabel="Post a job"
            actionTo="/create-job"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{job.title}</h3>
                  <p className="text-sm text-slate-500 truncate">
                    {job.company} · {job.location}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                    {job.applicantCount} {job.applicantCount === 1 ? 'applicant' : 'applicants'}
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2"
                  >
                    View job
                  </Link>
                  <Link
                    to={`/my-jobs/${job._id}/applicants`}
                    className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default MyJobs;
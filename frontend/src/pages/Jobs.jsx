import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const Jobs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [applied, setApplied] = useState({ keyword: '', location: '' }); // filters currently shown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async (kw = keyword, loc = location) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (kw) params.keyword = kw;
      if (loc) params.location = loc;

      const res = await api.get('/jobs', { params });
      setJobs(res.data);
      setApplied({ keyword: kw, location: loc });
    } catch (err) {
      console.error(err);
      setError('Could not load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClear = () => {
    setKeyword('');
    setLocation('');
    fetchJobs('', '');
  };

  const searchActive = Boolean(applied.keyword || applied.location);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Opportunities"
        title="Browse jobs"
        subtitle="Find roles that match your skills and apply in one click."
        action={
          isAdmin && (
            <Link
              to="/create-job"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-center font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Post a job
            </Link>
          )
        }
      />

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by title or company"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Search
          </button>
          {(keyword || location) && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        searchActive ? (
          <EmptyState
            icon="🔍"
            title="No jobs match your search"
            message="Try a different keyword or location, or clear the filters to see everything."
          />
        ) : (
          <EmptyState
            icon="💼"
            title="No jobs posted yet"
            message="New opportunities will appear here once recruiters post them."
          />
        )
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {jobs.length} {jobs.length === 1 ? 'opening' : 'openings'}
            {searchActive && ' found'}
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
};

export default Jobs;
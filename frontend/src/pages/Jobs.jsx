import { useEffect, useState } from 'react';
import api from '../services/api';
import JobCard from '../components/JobCard';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (keyword) params.keyword = keyword;
      if (location) params.location = location;

      const res = await api.get('/jobs', { params });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Available Jobs</h2>
      <p className="text-slate-500 text-sm mb-6">Browse and apply to open opportunities</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <input
          type="text"
          placeholder="Search by title/company..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border border-slate-300 p-2.5 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border border-slate-300 p-2.5 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button className="bg-indigo-600 text-white px-5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500 text-center py-10">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-slate-500 text-center py-10">No jobs found.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
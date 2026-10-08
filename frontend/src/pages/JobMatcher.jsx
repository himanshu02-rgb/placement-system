import { useState, useEffect } from 'react';
import api from '../services/api';

const JobMatcher = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await api.get('/jobs');
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  const handleMatch = async () => {
    if (!selectedJob) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/job-match', { jobId: selectedJob });
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    result?.matchScore >= 75 ? 'text-green-600' : result?.matchScore >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">AI Job Matcher</h2>
      <p className="text-slate-500 text-sm mb-6">See how well your resume fits a specific job</p>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="border border-slate-300 p-2.5 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a job</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} — {job.company}
            </option>
          ))}
        </select>

        <button
          onClick={handleMatch}
          disabled={loading || !selectedJob}
          className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors w-full"
        >
          {loading ? 'Matching... this may take a few seconds' : 'Check Match'}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-center mb-5">
            <span className={`text-4xl font-bold ${scoreColor}`}>{result.matchScore}%</span>
            <span className="block text-sm text-slate-500 mt-1">Match Score</span>
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-2">Matching Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills?.map((s, i) => (
                  <span key={i} className="bg-green-50 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm mb-2">Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills?.map((s, i) => (
                  <span key={i} className="bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full">
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
  );
};

export default JobMatcher;
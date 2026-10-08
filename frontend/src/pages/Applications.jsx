import { useEffect, useState } from 'react';
import api from '../services/api';

const statusColors = {
  Applied: 'bg-blue-50 text-blue-600',
  Shortlisted: 'bg-amber-50 text-amber-600',
  Selected: 'bg-green-50 text-green-600',
  Rejected: 'bg-red-50 text-red-600',
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">My Applications</h2>
      <p className="text-slate-500 text-sm mb-6">Track the status of jobs you've applied to</p>

      {loading ? (
        <p className="text-slate-500 text-center py-10">Loading...</p>
      ) : applications.length === 0 ? (
        <p className="text-slate-500 text-center py-10">You haven't applied to any jobs yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm"
            >
              <div>
                <p className="font-semibold text-slate-800">{app.jobId?.title}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {app.jobId?.company} · {app.jobId?.location}
                </p>
              </div>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[app.status]}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
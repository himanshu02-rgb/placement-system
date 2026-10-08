import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setMessage('');
    try {
      await api.post(`/jobs/${id}/apply`);
      setMessage('✅ Applied successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (!job) return <p className="text-center mt-10 text-slate-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">{job.title}</h2>
        <p className="text-slate-500 mt-1">{job.company} · {job.location}</p>

        <p className="mt-5 text-slate-600 leading-relaxed">{job.description}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {job.skills?.map((s, i) => (
            <span key={i} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>

        <p className="mt-5 font-semibold text-slate-800 text-lg">{job.salary}</p>

        {(!user || user.role !== 'admin') && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="mt-6 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {applying ? 'Applying...' : 'Apply Now'}
          </button>
        )}

        {message && (
          <p className={`mt-4 text-sm px-3 py-2 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
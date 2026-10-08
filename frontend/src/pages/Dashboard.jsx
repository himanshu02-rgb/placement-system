import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/applications/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.name} 👋</h2>
        <p className="text-slate-500 mt-1">{user?.email}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.total} accent="text-slate-700" />
          <StatCard label="Applied" value={stats.applied} accent="text-blue-600" />
          <StatCard label="Shortlisted" value={stats.shortlisted} accent="text-amber-600" />
          <StatCard label="Selected" value={stats.selected} accent="text-green-600" />
          <StatCard label="Rejected" value={stats.rejected} accent="text-red-600" />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
    <p className={`text-3xl font-bold ${accent}`}>{value}</p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
  </div>
);

export default Dashboard;
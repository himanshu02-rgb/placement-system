import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    skills: '',
    salary: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.post('/jobs', payload);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="max-w-xl mx-auto mt-10 p-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Post a New Job</h1>
        <p className="text-slate-500 text-sm mb-6">Fill in the details to publish a job opening</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="company"
            placeholder="Company"
            value={formData.company}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className={inputClass}
          />
          <input
            name="skills"
            placeholder="Skills (comma separated, e.g. React, Node.js)"
            value={formData.skills}
            onChange={handleChange}
            required
            className={inputClass}
          />
          <input
            name="salary"
            placeholder="Salary (e.g. 6 LPA)"
            value={formData.salary}
            onChange={handleChange}
            className={inputClass}
          />
          {error && (
            <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
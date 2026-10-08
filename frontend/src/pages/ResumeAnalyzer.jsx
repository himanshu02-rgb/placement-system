import { useState } from 'react';
import api from '../services/api';

const ResumeAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/resume-analysis');
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">AI Resume Analyzer</h2>
      <p className="text-slate-500 text-sm mb-6">Get AI-powered feedback on your uploaded resume</p>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Analyzing... this may take a few seconds' : 'Analyze My Resume'}
      </button>

      {error && (
        <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mt-4">{error}</p>
      )}

      {analysis && (
        <div className="mt-6 flex flex-col gap-4">
          <Section title="Skills" items={analysis.skills} color="indigo" />
          <Section title="Strengths" items={analysis.strengths} color="green" />
          <Section title="Missing Skills" items={analysis.missingSkills} color="red" />
          <Section title="Suggestions" items={analysis.suggestions} color="amber" />
        </div>
      )}
    </div>
  );
};

const dotColors = {
  indigo: 'bg-indigo-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
};

const Section = ({ title, items, color }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
    <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
    <ul className="flex flex-col gap-2">
      {items?.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColors[color]}`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default ResumeAnalyzer;
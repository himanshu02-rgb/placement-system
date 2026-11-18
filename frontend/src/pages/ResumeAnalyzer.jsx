import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const tones = {
  indigo: { dot: 'bg-indigo-500', ring: 'border-t-indigo-500' },
  emerald: { dot: 'bg-emerald-500', ring: 'border-t-emerald-500' },
  rose: { dot: 'bg-rose-500', ring: 'border-t-rose-500' },
  amber: { dot: 'bg-amber-500', ring: 'border-t-amber-500' },
};

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
      setError(err.response?.data?.message || 'Could not analyze your resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <PageHeader
        eyebrow="Resume"
        title="AI Resume Analyzer"
        subtitle="Get AI-powered feedback on your uploaded resume"
        action={
          <Link to="/resume" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Manage resumes →
          </Link>
        }
      />

      {/* Action */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-slate-500">
          {analysis
            ? 'Analysis complete. Run it again after you update your resume.'
            : 'Find your skills, strengths, gaps, and ways to improve.'}
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {loading ? 'Analyzing...' : analysis ? 'Analyze again' : 'Analyze my resume'}
        </button>
      </div>
      {loading && (
        <p className="text-xs text-slate-400 mt-2">This can take up to 30 seconds.</p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Loading placeholders */}
      {loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && analysis && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Section title="Skills" items={analysis.skills} tone="indigo" />
          <Section title="Strengths" items={analysis.strengths} tone="emerald" />
          <Section title="Missing Skills" items={analysis.missingSkills} tone="rose" />
          <Section title="Suggestions" items={analysis.suggestions} tone="amber" />
        </div>
      )}
    </div>
  );
};

const Section = ({ title, items, tone }) => {
  const style = tones[tone];
  return (
    <div className={`bg-white border border-slate-200 border-t-4 ${style.ring} rounded-xl p-5 shadow-sm`}>
      <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
      {items?.length ? (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${style.dot}`} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">None listed.</p>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageShell from '../components/PageShell';
import PageHeader from '../components/PageHeader';

const inputClass =
  'w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

const Field = ({ label, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

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
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [importedFrom, setImportedFrom] = useState('');

  const skillList = formData.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sends the chosen PDF to the backend and puts the extracted text into the JD field.
  const handleJdUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again later
    if (!file) return;

    if (
      formData.description.trim() &&
      !window.confirm('Replace the current job description with the text from this PDF?')
    ) {
      return;
    }

    setParseError('');
    setParsing(true);
    try {
      const data = new FormData();
      data.append('jd', file);
      const res = await api.post('/jobs/parse-jd', data);
      setFormData((prev) => ({ ...prev, description: res.data.text }));
      setImportedFrom(file.name);
    } catch (err) {
      setParseError(err.response?.data?.message || 'Could not read this PDF');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skills: skillList,
      };
      await api.post('/jobs', payload);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto">
        <PageHeader
          eyebrow="Recruiter"
          title="Post a new job"
          subtitle="Publish an opening. Students can view it and match their resume against it."
          action={
            <Link
              to="/jobs"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-2"
            >
              ← Back to jobs
            </Link>
          }
        />

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col gap-6"
        >
          {/* Basics */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Job title">
                <input
                  name="title"
                  placeholder="e.g. Frontend Developer Intern"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Company">
              <input
                name="company"
                placeholder="e.g. Acme Corp"
                value={formData.company}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                name="location"
                placeholder="e.g. Bengaluru / Remote"
                value={formData.location}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </Field>
            <Field label="Salary" hint="Optional, e.g. 6 LPA">
              <input
                name="salary"
                placeholder="e.g. 6 LPA"
                value={formData.salary}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </section>

          {/* Job description and skills */}
          <section className="flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Job description (JD)
                </label>
                <label
                  htmlFor="jd-pdf"
                  className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors ${
                    parsing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  {parsing ? 'Reading PDF...' : 'Upload PDF'}
                </label>
                <input
                  id="jd-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handleJdUpload}
                  disabled={parsing}
                  className="hidden"
                />
              </div>

              <textarea
                id="description"
                name="description"
                placeholder="Paste the full job description, or upload a PDF above."
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                className={`${inputClass} resize-y`}
              />

              <p className="text-xs text-slate-400">
                {formData.description.length} characters. Students see this, and the AI uses it when matching resumes.
              </p>
              {importedFrom && !parseError && (
                <p className="text-xs text-emerald-600">
                  Filled from {importedFrom}. You can edit the text before posting.
                </p>
              )}
              {parseError && <p className="text-xs text-rose-600">{parseError}</p>}
            </div>

            <Field label="Required skills" hint="Separate skills with commas, e.g. React, Node.js, MongoDB">
              <input
                name="skills"
                placeholder="React, Node.js, MongoDB"
                value={formData.skills}
                onChange={handleChange}
                required
                className={inputClass}
              />
              {skillList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {skillList.map((skill, i) => (
                    <span
                      key={`${skill}-${i}`}
                      className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </section>

          {error && (
            <p className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white font-medium rounded-lg px-5 py-2.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Posting...' : 'Post job'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default CreateJob;
import { useState } from 'react';
import api from '../services/api';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setFile(null);
      setError('Please select a PDF file');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    setError('');
    try {
      const response = await api.post('/resumes/upload', formData);
      onUploadSuccess(response.data);
      setFile(null);
      event.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <label
        htmlFor="resume-file"
        className="inline-block cursor-pointer rounded-lg bg-slate-100 text-slate-700 text-sm font-medium px-4 py-2.5 hover:bg-slate-200 transition-colors"
      >
        Choose PDF
      </label>

      <input
        id="resume-file"
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="mt-3 text-sm text-slate-500">
        {file ? `Selected: ${file.name}` : 'No file selected'}
      </p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="mt-4 w-full bg-indigo-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </form>
  );
};

export default ResumeUpload;
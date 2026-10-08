import { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload';

const Resume = () => {
  const [resume, setResume] = useState(null);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">My Resume</h2>
      <p className="text-slate-500 text-sm mb-6">Upload your resume to unlock AI analysis and job matching</p>

      <ResumeUpload onUploadSuccess={setResume} />

      {resume && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-slate-800">📄 {resume.fileName}</p>
          <p className="text-sm text-slate-500 mt-1">
            Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default Resume;
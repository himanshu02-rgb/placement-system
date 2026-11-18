import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Resume from './pages/Resume';
import JobMatcher from './pages/JobMatcher';
import AIInterview from './pages/AIInterview';
import CreateJob from './pages/CreateJob';
import MyJobs from './pages/MyJobs';
import JobApplicants from './pages/JobApplicants';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          }
        />
        {/* Old page, now part of /resume. Keeps existing links working. */}
        <Route path="/resume-analyzer" element={<Navigate to="/resume" replace />} />
        <Route
          path="/job-matcher"
          element={
            <ProtectedRoute>
              <JobMatcher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-interview"
          element={
            <ProtectedRoute>
              <AIInterview />
            </ProtectedRoute>
          }
        />

        {/* Recruiter-only routes */}
        <Route
          path="/create-job"
          element={
            <AdminRoute>
              <CreateJob />
            </AdminRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <AdminRoute>
              <MyJobs />
            </AdminRoute>
          }
        />
        <Route
          path="/my-jobs/:id/applicants"
          element={
            <AdminRoute>
              <JobApplicants />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
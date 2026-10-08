import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Resume from './pages/Resume';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import AIInterview from './pages/AIInterview';
import CreateJob from './pages/CreateJob';
import AdminRoute from './components/AdminRoute';


function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Jobs />} />
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
        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
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
        <Route
            path="/create-job"
            element={
              <AdminRoute>
                <CreateJob />
              </AdminRoute>
            }
        />
      </Routes>
    </div>
  );
}

export default App;
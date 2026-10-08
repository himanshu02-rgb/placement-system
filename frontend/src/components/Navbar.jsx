import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = 'text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors';

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <Link to="/" className="font-bold text-xl text-indigo-600 tracking-tight">
        PlacementHub
      </Link>
      <div className="flex gap-6 items-center">
        <Link to="/jobs" className={linkClass}>Jobs</Link>
        {user && (
          <>
            <Link to="/dashboard" className={linkClass}>Dashboard</Link>
            {user.role !== 'admin' && (
              <Link to="/applications" className={linkClass}>My Applications</Link>
            )}
            <Link to="/resume" className={linkClass}>Resume</Link>
            <Link to="/job-matcher" className={linkClass}>Job Matcher</Link>
            <Link to="/ai-interview" className={linkClass}>Mock Interview</Link>
            {user.role === 'admin' && (
              <Link to="/create-job" className={linkClass}>Add Job</Link>
            )}
          </>
        )}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <span className="text-sm text-slate-500">
              Hi, <span className="font-semibold text-slate-800">{user.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <Link to="/login" className={linkClass}>Login</Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
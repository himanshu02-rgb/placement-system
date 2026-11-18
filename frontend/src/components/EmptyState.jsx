import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, message, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl py-14 px-6">
    {icon && <div className="text-4xl mb-3">{icon}</div>}
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    {message && <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>}
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="mt-5 inline-flex items-center bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
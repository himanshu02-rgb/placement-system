import { Link } from 'react-router-dom';

const MAX_SKILLS = 4;

const JobCard = ({ job }) => {
  const skills = job.skills || [];
  const visibleSkills = skills.slice(0, MAX_SKILLS);
  const extraCount = skills.length - visibleSkills.length;
  const initial = job.company?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="group flex flex-col bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-semibold">
          {initial}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-slate-500 truncate">
            {job.company} · {job.location}
          </p>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {visibleSkills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full">
              +{extraCount} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-4 mt-4 border-t border-slate-100">
        {job.salary ? (
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            {job.salary}
          </span>
        ) : (
          <span className="text-sm text-slate-400">Salary not disclosed</span>
        )}
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
import { Link } from 'react-router-dom';

const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
      <h3 className="text-lg font-semibold text-slate-800">{job.title}</h3>
      <p className="text-slate-500 text-sm mt-0.5">{job.company} · {job.location}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {job.skills?.map((skill, i) => (
          <span
            key={i}
            className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-600">{job.salary}</p>
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
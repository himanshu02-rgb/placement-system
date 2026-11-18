const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  sky: 'bg-sky-50 text-sky-600',
};

const StatCard = ({ icon, label, value, tone = 'indigo' }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
    <div className={`h-11 w-11 shrink-0 rounded-lg flex items-center justify-center text-xl ${TONES[tone] || TONES.indigo}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
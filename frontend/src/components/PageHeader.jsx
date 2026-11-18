const PageHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
    <div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
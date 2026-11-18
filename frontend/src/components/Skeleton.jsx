const Skeleton = ({ className = 'h-24 w-full' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export default Skeleton;
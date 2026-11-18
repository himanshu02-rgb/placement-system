import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: '📄',
    title: 'AI Resume Analyzer',
    desc: 'Upload your resume and get structured feedback on strengths, skills, and gaps.',
  },
  {
    icon: '🎯',
    title: 'Smart Job Matching',
    desc: 'Compare your resume against any job description and see how well you fit.',
  },
  {
    icon: '🎤',
    title: 'AI Mock Interviews',
    desc: 'Practice role-specific questions and get a score and feedback on every answer.',
  },
  {
    icon: '💼',
    title: 'Placement Job Board',
    desc: 'Browse, search, and filter opportunities posted by recruiters and placement cells.',
  },
  {
    icon: '📊',
    title: 'Application Tracking',
    desc: 'Follow every application and its status from one personal dashboard.',
  },
  {
    icon: '🔐',
    title: 'Secure by Design',
    desc: 'JWT authentication in httpOnly cookies, with role-based access enforced on the server.',
  },
];

const steps = [
  { number: '01', title: 'Create your account', desc: 'Sign up as a student or recruiter in under a minute.' },
  { number: '02', title: 'Upload your resume', desc: 'Add your PDF once and reuse it across every AI tool.' },
  { number: '03', title: 'Apply and improve', desc: 'Apply to roles, match your profile, and practice interviews.' },
];

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Logged-in users skip the landing page
  if (user) {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <span className="inline-block mb-6 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-indigo-50 ring-1 ring-white/20">
            ✨ Powered by Google Gemini AI
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your placement journey,
            <br className="hidden md:block" />
            <span className="text-indigo-200"> powered by AI</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-indigo-100">
            Find opportunities, see how your resume stacks up against any job,
            and practice interviews with instant feedback. All in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="rounded-xl bg-white px-7 py-3 font-semibold text-indigo-700 shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 transition"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/30 bg-white/10 px-7 py-3 font-semibold text-white hover:bg-white/20 transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Features</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Everything you need to get placed
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            From your first application to your final interview, every tool is built around one goal.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">How it works</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">Three simple steps</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="relative rounded-2xl bg-slate-50 p-8 ring-1 ring-slate-200">
                <span className="text-5xl font-extrabold text-indigo-100">{s.number}</span>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-14 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to stand out?</h2>
          <p className="mt-4 text-indigo-100 max-w-xl mx-auto">
            Create your account and run your first resume analysis in minutes.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 transition"
          >
            Create free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} AI-Powered Job & Placement Management System
        </div>
      </footer>
    </div>
  );
};

export default Home;
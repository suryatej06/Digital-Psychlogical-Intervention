// frontend/src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  {
    icon: '🧠',
    step: '01',
    title: 'Take a 5-min screening',
    desc: 'Clinically validated PHQ-9 and GAD-7 assessments to understand where you\'re at.',
  },
  {
    icon: '📚',
    step: '02',
    title: 'Get personalised resources',
    desc: 'Articles, videos, and exercises curated to your results — not a generic list.',
  },
  {
    icon: '💬',
    step: '03',
    title: 'Talk to someone',
    desc: 'Chat with our AI assistant anytime, or book a session with a real counsellor.',
  },
];

const FEATURES = [
  { icon: '🧠', title: 'Mental health screenings', desc: 'PHQ-9 and GAD-7 assessments to track your wellbeing over time.', color: 'from-indigo-400 to-purple-500' },
  { icon: '💬', title: 'AI chatbot support', desc: 'Empathetic, 24/7 support for difficult moments.', color: 'from-purple-400 to-pink-500' },
  { icon: '📚', title: 'Smart resource hub', desc: 'Resources personalised to your latest assessment results.', color: 'from-pink-400 to-rose-500' },
  { icon: '👥', title: 'Community forum', desc: 'Anonymous peer support — share and be heard.', color: 'from-indigo-400 to-blue-500' },
  { icon: '🗓️', title: 'Counselling bookings', desc: 'Schedule one-on-one sessions at times that work for you.', color: 'from-violet-400 to-indigo-500' },
  { icon: '🔒', title: 'Private & secure', desc: 'Your data stays within your college. JWT-secured, always.', color: 'from-teal-400 to-indigo-400' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">


        {/* ── Hero ── */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            You don't have to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              go through it alone
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            A safe, supportive space built for students. Track your wellbeing,
            access personalised resources, and connect with counsellors and peers.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Get started — it's free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-indigo-700 text-lg font-bold shadow-sm hover:bg-white transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="inline-block px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Go to dashboard →
            </Link>
          )}
        </div>

        {/* ── How it works ── */}
        <div className="mb-20">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase text-center mb-10">
            How it works
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.step} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-md">
                  {s.icon}
                </div>
                <p className="text-indigo-400 text-xs font-bold tracking-widest mb-2">{s.step}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <div className="mb-20">
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase text-center mb-10">
            Everything you need
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div
                key={f.title}
                className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>


        {/* ── Bottom CTA ── */}
        {!isAuthenticated && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-xl p-10 text-center">
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
              Ready to start?
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Your wellbeing matters.
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
              Join your college's mental health platform, take a 5-minute screening,
              and get personalised support tailored to where you're at.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Create your account
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-indigo-700 text-lg font-bold shadow-sm hover:bg-white transition-all duration-200"
              >
                Already have an account
              </Link>
            </div>
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-center text-xs text-gray-400 mt-12 leading-relaxed">
          This platform is not a substitute for professional mental health care.<br />
          If you are in crisis, please contact a helpline immediately.
        </p>

      </div>
    </div>
  );
}
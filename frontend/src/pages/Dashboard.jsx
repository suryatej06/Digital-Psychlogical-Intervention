// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const SEVERITY_COLOR = {
  'Minimal depression': 'text-emerald-700 bg-emerald-100',
  'Mild depression': 'text-blue-700 bg-blue-100',
  'Moderate depression': 'text-amber-700 bg-amber-100',
  'Moderately severe depression': 'text-orange-700 bg-orange-100',
  'Severe depression': 'text-red-700 bg-red-100',
  'Minimal anxiety': 'text-emerald-700 bg-emerald-100',
  'Mild anxiety': 'text-blue-700 bg-blue-100',
  'Moderate anxiety': 'text-amber-700 bg-amber-100',
  'Severe anxiety': 'text-red-700 bg-red-100',
};

// ── Nav cards — same tall style as the original ────────────────────────────────

const STUDENT_CARDS = [
  { to: '/assessment', icon: '🧠', title: 'Screenings', desc: 'Take PHQ-9 or GAD-7 assessments', color: 'from-indigo-400 to-purple-500' },
  { to: '/resources', icon: '📚', title: 'Resources', desc: 'Personalised articles & exercises', color: 'from-purple-400 to-pink-500' },
  { to: '/community', icon: '👥', title: 'Community', desc: 'Connect with peers anonymously', color: 'from-pink-400 to-rose-500' },
  { to: '/chatbot', icon: '💬', title: 'AI support', desc: 'Chat with your 24/7 assistant', color: 'from-indigo-400 to-blue-500' },
  { to: '/bookings', icon: '🗓️', title: 'Bookings', desc: 'Schedule a counselling session', color: 'from-violet-400 to-indigo-500' },
  { to: '/results', icon: '📈', title: 'My results', desc: 'View your assessment history', color: 'from-teal-400 to-indigo-400' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();

  const [results, setResults] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);

  useEffect(() => {
    if (user?.role !== 'student') { setLoadingRes(false); return; }
    assessmentAPI.getMyResults()
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoadingRes(false));
  }, [user]);

  const latestPhq9 = results.find(r => r.questionnaireType === 'phq9') ?? null;
  const latestGad7 = results.find(r => r.questionnaireType === 'gad7') ?? null;
  const latestAny = results[0] ?? null;
  const daysSinceCheck = latestAny ? daysSince(latestAny.createdAt) : null;
  const showNudge = !loadingRes && (daysSinceCheck === null || daysSinceCheck >= 7);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header with avatar ── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg flex-shrink-0 select-none">
            {initials(user?.name)}
          </div>
          <div>
            <p className="text-indigo-500 text-xs font-bold tracking-widest uppercase mb-0.5">
              {user?.college?.name || 'Mental health platform'}
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              {greeting()},{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0]}
              </span>
            </h1>
          </div>
        </div>

        {/* ══ STUDENT VIEW ══════════════════════════════════════════════════ */}
        {user?.role === 'student' && (
          <>
            {/* Nudge banner */}
            {showNudge && (
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/60 rounded-3xl p-5 mb-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🧠
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-indigo-800 text-sm mb-0.5">
                    {daysSinceCheck === null ? 'Start with a screening' : 'Time for your check-in'}
                  </p>
                  <p className="text-indigo-500 text-xs leading-relaxed">
                    {daysSinceCheck === null
                      ? "You haven't taken a screening yet. It only takes 5 minutes."
                      : `Your last screening was ${daysSinceCheck} days ago.`}
                  </p>
                </div>
                <Link
                  to="/assessment"
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  {daysSinceCheck === null ? 'Start →' : 'Take it →'}
                </Link>
              </div>
            )}

            {/* Stats row — only shown once results are loaded */}
            {!loadingRes && results.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 text-center shadow-sm">
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {results.length}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Screenings taken</p>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 text-center shadow-sm flex flex-col items-center justify-center">
                  {latestPhq9 ? (
                    <>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${SEVERITY_COLOR[latestPhq9.severityTag] ?? 'text-gray-700 bg-gray-100'}`}>
                        {latestPhq9.severityTag?.replace(' depression', '') ?? '—'}
                      </span>
                      <p className="text-xs text-gray-400 font-medium mt-2">Latest PHQ-9</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-gray-200">—</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">No PHQ-9 yet</p>
                    </>
                  )}
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 text-center shadow-sm flex flex-col items-center justify-center">
                  {latestGad7 ? (
                    <>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${SEVERITY_COLOR[latestGad7.severityTag] ?? 'text-gray-700 bg-gray-100'}`}>
                        {latestGad7.severityTag?.replace(' anxiety', '') ?? '—'}
                      </span>
                      <p className="text-xs text-gray-400 font-medium mt-2">Latest GAD-7</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-gray-200">—</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">No GAD-7 yet</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Section label */}
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
              {results.length > 0 ? 'Quick access' : "Here's everything available to you today"}
            </p>

            {/* Original tall card grid — unchanged style */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {STUDENT_CARDS.map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ══ COUNSELOR VIEW ════════════════════════════════════════════════ */}
        {user?.role === 'counselor' && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-2xl mb-6 shadow-md">
              🗓️
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Counselor dashboard</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md">
              Review incoming booking requests, set your availability, and manage your upcoming sessions.
            </p>
            <Link
              to="/bookings"
              className="inline-block px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              View my bookings →
            </Link>
          </div>
        )}

        {/* ══ ADMIN VIEW ════════════════════════════════════════════════════ */}
        {user?.role === 'admin' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl mb-6 shadow-md">
                ⚙️
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Admin panel</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Manage users, resources, and monitor flagged content across the platform.
              </p>
              <Link
                to="/admin"
                className="inline-block px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Open admin panel →
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-2xl mb-6 shadow-md">
                📚
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Resource hub</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Add, edit, or remove resources from the student-facing library.
              </p>
              <Link
                to="/resources"
                className="inline-block px-6 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-indigo-700 font-bold shadow-sm hover:bg-white transition-all duration-200"
              >
                Manage resources →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
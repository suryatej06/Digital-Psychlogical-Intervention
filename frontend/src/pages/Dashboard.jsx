// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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

// ── SVG Icons — replaces emoji to avoid OS-dependent rendering issues ─────────

const Icons = {
  CheckIn: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Resources: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Community: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Bookings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Progress: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-indigo-600">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Gear: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

// ── Nav cards ─────────────────────────────────────────────────────────────────

const STUDENT_CARDS = [
  { to: '/check-in', Icon: Icons.CheckIn, title: 'Check-In', desc: 'Quick wellbeing check — mood, sleep & stress', color: 'from-indigo-400 to-purple-500' },
  { to: '/resources', Icon: Icons.Resources, title: 'Resources', desc: 'Personalised articles & exercises', color: 'from-purple-400 to-pink-500' },
  { to: '/community', Icon: Icons.Community, title: 'Community', desc: 'Connect with peers anonymously', color: 'from-pink-400 to-rose-500' },
  { to: '/chatbot', Icon: Icons.Chat, title: 'AI Support', desc: 'Chat with your 24/7 assistant', color: 'from-indigo-400 to-blue-500' },
  { to: '/connect', Icon: Icons.Bookings, title: 'Connect', desc: 'Secure video session with a counsellor', color: 'from-violet-400 to-indigo-500' },
  { to: '/video/join', Icon: Icons.Video, title: 'Join Video', desc: 'Join a virtual session', color: 'from-blue-400 to-cyan-500' },
  { to: '/progress', Icon: Icons.Progress, title: 'My Progress', desc: 'Track your wellbeing over time', color: 'from-teal-400 to-indigo-400' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loadingRes, setLoadingRes] = useState(true);

  useEffect(() => {
    if (user?.role !== 'student') { setLoadingRes(false); return; }
    assessmentAPI.getMyResults()
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoadingRes(false));
  }, [user]);

  const latestFlow = results.find(r =>
    r.questionnaireType === 'wellbeing-flow' ||
    r.questionnaireType === 'phq9' ||
    r.questionnaireType === 'gad7'
  ) ?? null;
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
                {/* FIX: replaced emoji with SVG icon for consistent rendering */}
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icons.Brain />
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
                  to="/check-in"
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  {daysSinceCheck === null ? 'Start →' : 'Take it →'}
                </Link>
              </div>
            )}

            {/* FIX: Stats row — all three cards use the same explicit height via `h-full`
                and `items-center justify-center` to prevent unequal card heights */}
            {!loadingRes && results.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Stat 1 */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[96px]">
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {results.length}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Screenings taken</p>
                </div>

                {/* Stat 2 */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[96px]">
                  {latestFlow ? (
                    <>
                      <p className="text-3xl font-extrabold text-indigo-600">
                        {latestFlow.phq9Score ?? latestFlow.totalScore ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1">Latest Mood Score</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-gray-200">—</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">No check-in yet</p>
                    </>
                  )}
                </div>

                {/* Stat 3 */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center min-h-[96px]">
                  {latestFlow ? (
                    <>
                      <p className="text-3xl font-extrabold text-purple-600">
                        {latestFlow.gad7Score ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1">Latest Stress Score</p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-gray-200">—</p>
                      <p className="text-xs text-gray-400 font-medium mt-1">No check-in yet</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Section label */}
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-4">
              {results.length > 0 ? 'Quick access' : "Here's everything available to you today"}
            </p>

            {/* FIX: Cards use SVG icons + `h-full flex flex-col` so all cards
                stretch to the same height regardless of content length */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {STUDENT_CARDS.map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col h-full"
                >
                  {/* FIX: icon wrapper uses SVG Icon component, not emoji string */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                    <card.Icon />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.title}</h3>
                  {/* FIX: flex-1 makes the description fill remaining space so
                      card height stays uniform across rows */}
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{card.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ══ COUNSELOR VIEW ════════════════════════════════════════════════ */}
        {user?.role === 'counselor' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center mb-6 shadow-md">
                <Icons.Bookings />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Network & Schedule</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm flex-1">
                Review incoming booking requests, set your availability, and manage your upcoming sessions.
              </p>
              <Link
                to="/bookings"
                className="inline-block px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                View my bookings →
              </Link>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center mb-6 shadow-md">
                <Icons.Video />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Video Sessions</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm flex-1">
                Start a secure video counseling session with a student.
              </p>
              <button
                onClick={() => navigate('/video/join')}
                className="inline-block px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Open video lobby →
              </button>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-6 shadow-md">
                <Icons.Resources />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Resource Management</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm flex-1">
                Upload new articles, videos, and exercises to the Smart Resource Hub for students to read.
              </p>
              <Link
                to="/manage-resources"
                className="inline-block px-8 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 text-indigo-700 font-bold shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                Manage resources →
              </Link>
            </div>
          </div>
        )}

        {/* ══ ADMIN VIEW ════════════════════════════════════════════════════ */}
        {user?.role === 'admin' && (
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 shadow-md">
                <Icons.Gear />
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
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-6 shadow-md">
                <Icons.Resources />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">Resource hub</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Add, edit, or remove resources from the student-facing library.
              </p>
              <Link
                to="/manage-resources"
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

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { assessmentAPI } from '../services/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl p-3 shadow-xl text-sm">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Progress() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    assessmentAPI.getMyResults()
      .then(data => setResults(Array.isArray(data) ? data.reverse() : []))
      .catch(() => setError('Could not load your progress. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this check-in result?')) return;
    try {
      await assessmentAPI.deleteResult(id);
      setResults(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert('Failed to delete result.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <p className="text-red-500 font-medium text-lg">{error}</p>
      </div>
    );
  }

  // Build chart data from wellbeing-flow results
  const flowResults = results.filter(r => r.questionnaireType === 'wellbeing-flow');
  const chartData = flowResults.map(r => ({
    date: formatDate(r.createdAt),
    'Mood (PHQ-9)': r.phq9Score ?? r.totalScore,
    'Anxiety (GAD-7)': r.gad7Score ?? 0,
    'Stress (PSS)': r.pssScore ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="inline-block bg-white/60 backdrop-blur-md border border-indigo-200 text-indigo-700 rounded-full px-4 py-1 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            Wellbeing Tracker
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-3">
            My Progress
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            Your mental wellbeing journey over time.
          </p>
        </div>

        {flowResults.length === 0 ? (
          /* Empty state */
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-14 text-center shadow-xl mb-8">
            <div className="text-6xl mb-5">🌱</div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Your journey starts here.</h2>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
              Take your first Check-In to start tracking your wellbeing and see your trends over time.
            </p>
            <Link
              to="/check-in"
              className="inline-block px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
            >
              Start a Check-In →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Check-Ins', value: flowResults.length, color: 'from-indigo-500 to-purple-600' },
                { label: 'Latest Mood', value: flowResults[flowResults.length - 1]?.phq9Score ?? '—', color: 'from-purple-400 to-pink-500' },
                { label: 'Latest Anxiety', value: flowResults[flowResults.length - 1]?.gad7Score ?? '—', color: 'from-pink-400 to-rose-500' },
                { label: 'Latest Stress', value: flowResults[flowResults.length - 1]?.pssScore ?? '—', color: 'from-amber-400 to-orange-500' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 text-center shadow-md">
                  <p className={`text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Mood & Anxiety Chart */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl mb-6">
              <h3 className="text-lg font-extrabold text-gray-800 mb-1">Mood & Anxiety</h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">Lower is better · PHQ-9 (max 27) · GAD-7 (max 21)</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradAnxiety" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Mood (PHQ-9)" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradMood)" dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="Anxiety (GAD-7)" stroke="#a855f7" strokeWidth={2.5} fill="url(#gradAnxiety)" dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stress Chart */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl mb-8">
              <h3 className="text-lg font-extrabold text-gray-800 mb-1">Stress Levels</h3>
              <p className="text-xs text-gray-400 mb-6 font-medium">PSS score · Lower is better</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Stress (PSS)" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradStress)" dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* All check-in history */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Full History</h3>
            {[...results].reverse().map(r => (
              <div key={r._id} className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    {r.questionnaireType === 'wellbeing-flow' ? '🩺 Wellbeing Check-In' : `📋 ${r.questionnaireType.toUpperCase()}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)} · Score: {r.totalScore}</p>
                  {r.severityTag && (
                    <p className="text-xs text-indigo-500 font-medium mt-0.5">{r.severityTag}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/check-in"
          className="mt-8 w-full flex justify-center py-4 rounded-2xl border-2 border-indigo-100 bg-white/40 text-indigo-700 font-bold hover:bg-white hover:border-indigo-300 transition-all shadow-sm"
        >
          Take another Check-In →
        </Link>
      </div>
    </div>
  );
}

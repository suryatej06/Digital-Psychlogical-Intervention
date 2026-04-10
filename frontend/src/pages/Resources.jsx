import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { BreathingExercise, GroundingExercise } from '../components/ExerciseWidgets';
import { CRISIS_LINES } from '../constants/crisisLines';

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Sleep', 'Stress', 'Mindfulness', 'Self-care', 'Crisis'];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'exercise', label: 'Exercises' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'az', label: 'A – Z' },
  { value: 'za', label: 'Z – A' },
];

const TYPE_META = {
  article: { label: 'Article', icon: '📄', color: 'text-emerald-700 bg-emerald-100 border-emerald-300', action: 'Read' },
  video: { label: 'Video', icon: '▶', color: 'text-indigo-700 bg-indigo-100 border-indigo-300', action: 'Watch' },
  audio: { label: 'Audio', icon: '🎧', color: 'text-amber-700 bg-amber-100 border-amber-300', action: 'Listen' },
  exercise: { label: 'Exercise', icon: '✦', color: 'text-rose-700 bg-rose-100 border-rose-300', action: 'Open' },
};

// ─── Resource card ─────────────────────────────────────────────────────────────
function ResourceCard({ resource }) {
  const meta = TYPE_META[resource.type] || TYPE_META.article;
  // Make the badge highly selective: requires at least 2 matching tags 
  // so it doesn't just recommend everything loosely related
  const isRecommended = resource._score >= 2;

  return (
    <div className="group bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative">
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Recommended
        </div>
      )}

      <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {resource.thumbnail ? (
          <>
            <img src={resource.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
            <span className="text-5xl opacity-50">{meta.icon}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-10 bg-white/40">
        <div className="flex gap-2 mb-3">
          <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-md border ${meta.color}`}>
            {meta.label}
          </span>
          <span className="inline-block text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
            {resource.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">{resource.title}</h3>
        <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3 leading-relaxed">{resource.description}</p>

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-semibold transition-all hover:bg-indigo-600 hover:text-white"
        >
          {meta.action} <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('recommended');

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ ranked: 'true' });
      if (activeCategory !== 'All') params.append('category', activeCategory);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await api.get(`/resources?${params}`);
      const raw = res.data?.data ?? res.data ?? [];
      setResources(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Failed to load resources. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, typeFilter]);

  const fetchTip = useCallback(async () => {
    try {
      setTipLoading(true);
      const res = await api.get('/resources/tip');
      setTip(res.tip ?? res.data?.tip ?? null);
    } catch {
      setTip(null);
    } finally {
      setTipLoading(false);
    }
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);
  useEffect(() => { fetchTip(); }, [fetchTip]);

  const displayed = resources
    .filter(r => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === 'recommended') return (b._score || 0) - (a._score || 0); // Rely primarily on backend ranking but enforce
      if (sort === 'az') return a.title.localeCompare(b.title);
      if (sort === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

  const crisisResources = displayed.filter(r => r.category === 'Crisis');
  const mainResources = displayed.filter(r => r.category !== 'Crisis');
  const showBreathing = ['All', 'Anxiety', 'Stress', 'Mindfulness'].includes(activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2">
              Smart Resource Hub
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl font-medium">
              Curated tools, exercises, and articles personalized to your emotional wellbeing.
            </p>
          </div>
          <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-white/50 text-indigo-800 font-semibold text-sm">
            {resources.length} Available Resources
          </div>
        </div>

        {/* AI Tip Banner */}
        {(tip || tipLoading) && (
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl text-white transform transition-all hover:scale-[1.01] flex gap-4 items-start relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-purple-900 opacity-20 rounded-full blur-xl"></div>

            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-inner relative z-10">
              <span className="text-2xl">✨</span>
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-bold text-indigo-100 flex items-center gap-2 mb-1">
                Personalized Insight
                {tipLoading && <span className="flex space-x-1"><span className="animate-bounce inline-block w-1 h-1 bg-white rounded-full"></span><span className="animate-bounce animation-delay-100 inline-block w-1 h-1 bg-white rounded-full"></span><span className="animate-bounce animation-delay-200 inline-block w-1 h-1 bg-white rounded-full"></span></span>}
              </h3>
              <p className="text-white text-lg font-medium leading-relaxed">
                {tipLoading ? 'Analyzing your recent screening results...' : tip}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-8 font-medium">
            {error}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-3xl p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search for articles, videos, exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="py-3 px-4 bg-white/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="py-3 px-4 bg-white/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-indigo-300 -translate-y-0.5'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Built-in exercises — collapsible cards on the hub */}
        {showBreathing && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <BreathingExercise collapsible defaultExpanded={false} />
            <GroundingExercise collapsible defaultExpanded={false} />
          </div>
        )}

        {/* Main Resource Grid */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-white/40 rounded-3xl animate-pulse border border-white/50"></div>
              ))}
            </div>
          ) : mainResources.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center shadow-sm">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No resources found</h3>
              <p className="text-gray-500 mb-6 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
              <button
                onClick={() => { setActiveCategory('All'); setTypeFilter('all'); setSearch(''); }}
                className="px-6 py-2.5 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainResources.map(r => <ResourceCard key={r._id} resource={r} />)}
            </div>
          )}
        </div>

        {/* Crisis DB resources */}
        {crisisResources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-rose-800 mb-6 flex items-center gap-2">
              <span className="text-rose-500">❤️‍🩹</span> Crisis Support Materials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {crisisResources.map(r => <ResourceCard key={r._id} resource={r} />)}
            </div>
          </div>
        )}

        {/* Helplines — always pinned when All or Crisis tab active */}
        {(activeCategory === 'All' || activeCategory === 'Crisis') && (
          <div className="bg-rose-50/80 backdrop-blur-xl border border-rose-200 rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-rose-800 mb-6">Immediate Helplines</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CRISIS_LINES.map(line => (
                <a
                  key={line.name}
                  href={line.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all group flex flex-col items-center text-center"
                >
                  <span className="text-gray-500 text-sm font-medium mb-1 group-hover:text-rose-700 transition-colors">{line.name}</span>
                  <span className="text-2xl font-black text-rose-600 tracking-tight">{line.number}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
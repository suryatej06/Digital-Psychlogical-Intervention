import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import { onboardingFlow } from '../data/onboardingFlow';

const CATEGORY_ICONS = {
  'Rest & Routine': '🌙',
  'Physical Wellbeing': '💪',
  'Focus & Daily Life': '🎯',
  'Mood & Joy': '🌈',
  'Stress & Nervous System': '🧘',
  'Deep Check-In': '💛',
};

export default function CheckIn() {
  const navigate = useNavigate();

  const [step, setStep] = useState('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const question = onboardingFlow[currentIndex];
  const total = onboardingFlow.length;
  const pct = step === 'intro' ? 0 : ((currentIndex) / total) * 100;

  function handleSelect(weight) {
    setSelected(weight);
  }

  async function handleNext() {
    if (selected === null) return;

    const newAnswers = [...answers, { clinicalMap: question.clinicalMap, weight: selected }];

    if (currentIndex + 1 < total) {
      setAnswers(newAnswers);
      setCurrentIndex(i => i + 1);
      setSelected(null);
    } else {
      setStep('submitting');
      try {
        const res = await assessmentAPI.submitFlow(newAnswers, false);
        setResult(res);
        setStep('done');
      } catch (err) {
        console.error('Check-in submit failed:', err);
        setStep('done');
      }
    }
  }

  // ── Intro screen ──
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            🩺
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Mental Health Check-In
          </h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed mb-8">
            Let's take a moment to see how you're feeling today.
          </p>
          <p className="text-gray-400 text-sm mb-8 font-medium">
            15 quick questions · ~3 minutes · Your answers are always private.
          </p>
          <button
            onClick={() => setStep('quiz')}
            className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            Start Check-In →
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full mt-3 py-3 rounded-2xl text-gray-500 font-semibold hover:bg-white/60 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Submitting ──
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-indigo-600 font-bold text-lg animate-pulse">Analyzing your responses…</p>
        </div>
      </div>
    );
  }

  // ── Results screen ──
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            📊
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Check-In Complete</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed mb-4">
            Here's a snapshot of where you are today.
          </p>

          {result && (
            <>
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                  <p className="text-2xl font-black text-indigo-600">{result.phq9Score ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Mood (PHQ-9)</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                  <p className="text-2xl font-black text-purple-600">{result.gad7Score ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Anxiety (GAD-7)</p>
                </div>
                <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                  <p className="text-2xl font-black text-pink-600">{result.pssScore ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Stress (PSS)</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-2xl font-black text-amber-600">{result.promisScore ?? 0}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">Physical</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 font-medium mb-6">{result.severityTag}</p>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/progress')}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-md"
            >
              View Progress
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-xl border border-gray-200 bg-white/50 text-gray-700 font-bold hover:bg-white transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──
  const categoryIcon = CATEGORY_ICONS[question.category] || '💬';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl flex flex-col">

        {/* Progress */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">{categoryIcon}</span>
          <span className="text-xs font-bold tracking-widest uppercase text-purple-500">
            {question.category}
          </span>
          <span className="ml-auto text-xs font-bold text-gray-400">
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {question.options.map((opt) => {
            const isSelected = selected === opt.weight;
            return (
              <button
                key={opt.weight}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-medium ${isSelected
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm scale-[1.02]'
                  : 'border-white bg-white/60 text-gray-700 hover:border-purple-200 hover:bg-white'
                }`}
                onClick={() => handleSelect(opt.weight)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <button
          disabled={selected === null}
          onClick={handleNext}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all ${selected === null
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
          }`}
        >
          {currentIndex + 1 === total ? 'See Results →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

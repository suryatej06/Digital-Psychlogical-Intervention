import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import DisclaimerModal from '../components/DisclaimerModal';

// ── Severity helpers ──────────────────────────────────────────────────────────

const PHQ9_SEVERITY = [
  { max: 4, label: 'Minimal depression', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
  { max: 9, label: 'Mild depression', color: 'text-blue-700 bg-blue-100 border-blue-300' },
  { max: 14, label: 'Moderate depression', color: 'text-amber-700 bg-amber-100 border-amber-300' },
  { max: 19, label: 'Moderately severe depression', color: 'text-orange-700 bg-orange-100 border-orange-300' },
  { max: 27, label: 'Severe depression', color: 'text-red-700 bg-red-100 border-red-300' },
];

const GAD7_SEVERITY = [
  { max: 4, label: 'Minimal anxiety', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' },
  { max: 9, label: 'Mild anxiety', color: 'text-blue-700 bg-blue-100 border-blue-300' },
  { max: 14, label: 'Moderate anxiety', color: 'text-amber-700 bg-amber-100 border-amber-300' },
  { max: 21, label: 'Severe anxiety', color: 'text-red-700 bg-red-100 border-red-300' },
];

const MAX_SCORE = { phq9: 27, gad7: 21 };

function getSeverityScale(type) {
  return type === 'gad7' ? GAD7_SEVERITY : PHQ9_SEVERITY;
}

function getSeverityStyle(score, type) {
  const scale = getSeverityScale(type);
  const entry = scale.find((s) => score <= s.max) ?? scale[scale.length - 1];
  return { label: entry.label, colorClass: entry.color };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Assessment() {
  const { type } = useParams();
  const navigate = useNavigate();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);

  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [saveWarning, setSaveWarning] = useState(false);

  const maxScore = MAX_SCORE[type] ?? 27;

  // Disclaimer — acknowledged either in-session or by this component
  const [disclaimerDone, setDisclaimerDone] = useState(
    () => sessionStorage.getItem('disclaimerAcknowledged') === 'true'
  );

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    setQuestionnaire(null);
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);

    assessmentAPI
      .fetchQuestionnaire(type)
      .then((data) => setQuestionnaire(data))
      .catch(() => setFetchError('Could not load questionnaire. Please try again.'))
      .finally(() => setLoading(false));
  }, [type]);

  function handleNext() {
    if (selected === null) return;

    const newAnswers = [...answers, selected];
    const questions = questionnaire.questions;

    if (currentIndex + 1 < questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    } else {
      const score = newAnswers.reduce((sum, sc) => sum + sc, 0);
      setTotalScore(score);
      setShowResults(true);

      const { label } = getSeverityStyle(score, type);
      assessmentAPI
        .submitResult({ questionnaireType: type, totalScore: score, severityTag: label })
        .catch(() => setSaveWarning(true));
    }
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);
    setSaveWarning(false);
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <p className="text-indigo-600 font-medium animate-pulse text-lg">Loading questionnaire…</p>
      </div>
    );
  }

  if (fetchError || !questionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <p className="text-red-500 font-medium mb-6 text-lg">{fetchError ?? 'Something went wrong.'}</p>
          <button
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            onClick={() => navigate('/assessment')}
          >
            ← Back to assessments
          </button>
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────

  if (showResults) {
    const { label, colorClass } = getSeverityStyle(totalScore, type);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-lg w-full text-center shadow-xl">
          <p className="text-gray-500 text-sm font-bold tracking-widest uppercase mb-6">
            {questionnaire.title} — Result
          </p>

          <div className={`mx-auto w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-6 shadow-inner ${colorClass}`}>
            <span className="text-4xl font-extrabold leading-none">{totalScore}</span>
            <span className="text-sm font-medium opacity-70 mt-1">/ {maxScore}</span>
          </div>

          <div className="mb-8">
            <span className={`inline-block px-5 py-2 rounded-full border font-bold text-sm shadow-sm ${colorClass}`}>
              {label}
            </span>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
            Your score has been securely saved to your history. These results are for personal
            awareness and are not a clinical diagnosis.
          </p>

          {saveWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium mb-6 text-left">
              ⚠ Your result could not be saved to the server this time. Your score is{' '}
              {totalScore}/{maxScore}.
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <button
              className="flex-1 py-3 rounded-xl border border-gray-300 bg-white/50 text-gray-700 font-bold hover:bg-white transition shadow-sm"
              onClick={handleRetake}
            >
              Retake
            </button>
            <button
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              onClick={() => navigate('/results')}
            >
              View history
            </button>
          </div>

          <button
            className="w-full py-3 rounded-xl text-indigo-600 font-semibold hover:bg-indigo-50 transition"
            onClick={() => navigate('/assessment')}
          >
            ← All assessments
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────────────────

  const questions = questionnaire.questions;
  const question = questions[currentIndex];
  const pct = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      {!disclaimerDone && (
        <DisclaimerModal
          onAcknowledge={() => setDisclaimerDone(true)}
          onBack={() => navigate('/assessment')}
        />
      )}

      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl flex flex-col">
        <button
          className="text-gray-500 hover:text-indigo-600 font-medium text-sm self-start mb-6 transition"
          onClick={() => navigate('/assessment')}
        >
          ← All assessments
        </button>

        <p className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4">
          {questionnaire.title}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-indigo-600 font-bold text-xs tracking-widest uppercase mb-4">
          Question {currentIndex + 1} of {questions.length}
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-8">
          {question.text}
        </h2>

        <div className="space-y-3 mb-8">
          {question.answers.map((ans) => {
            const isSelected = selected === ans.score;
            return (
              <button
                key={ans.score}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-medium ${isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-white bg-white/60 text-gray-700 hover:border-indigo-200 hover:bg-white'
                  }`}
                onClick={() => setSelected(ans.score)}
              >
                {ans.text}
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
          {currentIndex + 1 === questions.length ? 'Submit Result →' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}
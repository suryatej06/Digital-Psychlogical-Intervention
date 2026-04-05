import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentAPI } from '../services/api';
import DisclaimerModal from '../components/DisclaimerModal';

// ── Severity helpers ──────────────────────────────────────────────────────────

const PHQ9_SEVERITY = [
  { max: 4,  label: 'Minimal depression',          color: '#22c55e' },
  { max: 9,  label: 'Mild depression',              color: '#3b82f6' },
  { max: 14, label: 'Moderate depression',          color: '#eab308' },
  { max: 19, label: 'Moderately severe depression', color: '#f97316' },
  { max: 27, label: 'Severe depression',            color: '#ef4444' },
];

const GAD7_SEVERITY = [
  { max: 4,  label: 'Minimal anxiety',  color: '#22c55e' },
  { max: 9,  label: 'Mild anxiety',     color: '#3b82f6' },
  { max: 14, label: 'Moderate anxiety', color: '#eab308' },
  { max: 21, label: 'Severe anxiety',   color: '#ef4444' },
];

const MAX_SCORE = { phq9: 27, gad7: 21 };

function getSeverityScale(type) {
  return type === 'gad7' ? GAD7_SEVERITY : PHQ9_SEVERITY;
}

function getSeverityStyle(score, type) {
  const scale = getSeverityScale(type);
  const entry = scale.find((s) => score <= s.max) ?? scale[scale.length - 1];
  return { label: entry.label, color: entry.color };
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  card: {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '600px',
  },
  progressTrack: {
    height: '6px',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '999px',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #818cf8, #6366f1)',
    borderRadius: '999px',
    transition: 'width 0.35s ease',
  }),
  questionCount: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  questionText: {
    fontSize: '1.15rem',
    fontWeight: '500',
    color: '#ffffff',
    lineHeight: '1.55',
    marginBottom: '1.75rem',
  },
  answerBtn: (selected) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: selected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
    border: selected
      ? '1px solid rgba(99,102,241,0.7)'
      : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: selected ? '#c7d2fe' : 'rgba(255,255,255,0.75)',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginBottom: '10px',
    transition: 'all 0.15s ease',
  }),
  nextBtn: (disabled) => ({
    marginTop: '1.25rem',
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: disabled ? 'rgba(99,102,241,0.3)' : '#6366f1',
    color: disabled ? 'rgba(255,255,255,0.35)' : '#ffffff',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s ease',
  }),
  // Results screen
  scoreCircle: (color) => ({
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    border: `3px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    background: `${color}18`,
  }),
  scoreNum: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1,
  },
  scoreMax: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.45)',
  },
  severityBadge: (color) => ({
    display: 'inline-block',
    padding: '5px 18px',
    borderRadius: '999px',
    border: `1px solid ${color}`,
    color: color,
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    background: `${color}14`,
  }),
  actionRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '1.5rem',
  },
  outlineBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  primaryBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '10px',
    border: 'none',
    background: '#6366f1',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  warningBanner: {
    background: 'rgba(234,179,8,0.12)',
    border: '1px solid rgba(234,179,8,0.35)',
    borderRadius: '10px',
    color: '#fde68a',
    fontSize: '0.85rem',
    padding: '10px 14px',
    marginTop: '1rem',
  },
  backLink: {
    marginBottom: '1.25rem',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    padding: 0,
    alignSelf: 'flex-start',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
  },
  errorText: {
    color: '#f87171',
    fontSize: '1rem',
  },
};

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
      <div style={s.page}>
        <p style={s.loadingText}>Loading questionnaire…</p>
      </div>
    );
  }

  if (fetchError || !questionnaire) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <p style={s.errorText}>{fetchError ?? 'Something went wrong.'}</p>
          <button style={s.primaryBtn} onClick={() => navigate('/assessment')}>
            ← Back to assessments
          </button>
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────

  if (showResults) {
    const { label, color } = getSeverityStyle(totalScore, type);
    return (
      <div style={s.page}>
        <div className="assessment-card-compact" style={{ ...s.card, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {questionnaire.title} — Result
          </p>

          <div style={s.scoreCircle(color)}>
            <span style={s.scoreNum}>{totalScore}</span>
            <span style={s.scoreMax}>/ {maxScore}</span>
          </div>

          <div>
            <span style={s.severityBadge(color)}>{label}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: '1.6' }}>
            Your score has been saved to your history. These results are for personal
            awareness and are not a clinical diagnosis.
          </p>

          {saveWarning && (
            <div style={s.warningBanner}>
              ⚠ Your result could not be saved to the server this time. Your score is{' '}
              {totalScore}/{maxScore}.
            </div>
          )}

          <div style={s.actionRow}>
            <button style={s.outlineBtn} onClick={handleRetake}>
              Retake
            </button>
            <button style={s.primaryBtn} onClick={() => navigate('/results')}>
              View history
            </button>
          </div>

          <button
            style={{ ...s.outlineBtn, width: '100%', marginTop: '10px' }}
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
    <div style={s.page}>
      {!disclaimerDone && (
        <DisclaimerModal
          onAcknowledge={() => setDisclaimerDone(true)}
          onBack={() => navigate('/assessment')}
        />
      )}
      <div className="assessment-card-compact" style={{ ...s.card, display: 'flex', flexDirection: 'column' }}>
        <button style={s.backLink} onClick={() => navigate('/assessment')}>
          ← All assessments
        </button>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          {questionnaire.title}
        </p>

        <div style={s.progressTrack}>
          <div style={s.progressFill(pct)} />
        </div>

        <p style={s.questionCount}>
          Question {currentIndex + 1} of {questions.length}
        </p>

        <p style={s.questionText}>{question.text}</p>

        <div>
          {question.answers.map((ans) => (
            <button
              key={ans.score}
              style={s.answerBtn(selected === ans.score)}
              onClick={() => setSelected(ans.score)}
            >
              {ans.text}
            </button>
          ))}
        </div>

        <button
          style={s.nextBtn(selected === null)}
          disabled={selected === null}
          onClick={handleNext}
        >
          {currentIndex + 1 === questions.length ? 'Submit' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
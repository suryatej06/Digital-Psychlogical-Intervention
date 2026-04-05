import { useState, useEffect } from 'react';
import { assessmentAPI } from '../services/api';

// ── Severity helper ──────────────────────────────────────────────────────────
function getSeverity(score) {
  if (score <= 4)  return { tag: 'Minimal depression',           color: '#22c55e' };
  if (score <= 9)  return { tag: 'Mild depression',              color: '#3b82f6' };
  if (score <= 14) return { tag: 'Moderate depression',          color: '#eab308' };
  if (score <= 19) return { tag: 'Moderately severe depression', color: '#f97316' };
  return             { tag: 'Severe depression',                 color: '#ef4444' };
}

// ── Inline styles (your original UI preserved) ───────────────────────────────
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '1.5rem',
    padding: '2.5rem',
    maxWidth: '680px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    color: '#fff',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: '#e0e7ff',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.25rem',
  },
  progressTrack: {
    height: '6px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '999px',
    margin: '1.5rem 0',
    overflow: 'hidden',
  },
  progressBar: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    borderRadius: '999px',
    transition: 'width 0.4s ease',
  }),
  questionText: {
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: '1.5rem',
    lineHeight: 1.6,
    color: '#e0e7ff',
  },
  answerLabel: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    marginBottom: '0.6rem',
    cursor: 'pointer',
    background: selected ? 'rgba(129,140,248,0.3)' : 'rgba(255,255,255,0.05)',
    border: selected ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.2s',
    fontSize: '0.95rem',
    color: '#e0e7ff',
  }),
  radio: {
    width: '18px',
    height: '18px',
    accentColor: '#818cf8',
    flexShrink: 0,
  },
  nextBtn: (disabled) => ({
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: disabled
      ? 'rgba(129,140,248,0.3)'
      : 'linear-gradient(135deg, #818cf8, #c084fc)',
    color: disabled ? 'rgba(255,255,255,0.4)' : '#fff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    width: '100%',
  }),
  scoreCircle: (color) => ({
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: `4px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '1.5rem auto',
    boxShadow: `0 0 30px ${color}55`,
  }),
  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '0.25rem',
  },
  severityBadge: (color) => ({
    display: 'inline-block',
    padding: '0.4rem 1.2rem',
    borderRadius: '999px',
    background: `${color}22`,
    border: `1px solid ${color}`,
    color: color,
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
  }),
  retakeBtn: {
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#e0e7ff',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  warningBanner: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    background: 'rgba(251,191,36,0.15)',
    border: '1px solid rgba(251,191,36,0.4)',
    color: '#fbbf24',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  centered: {
    textAlign: 'center',
  },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function Assessment() {
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const [currentIndex, setCurrentIndex]   = useState(0);
  const [answers, setAnswers]             = useState([]);
  const [selected, setSelected]           = useState(null);

  const [result, setResult]               = useState(null);  // { score, severity }
  const [saveWarning, setSaveWarning]     = useState(false);

  // Fetch questionnaire on mount
  useEffect(() => {
    assessmentAPI.fetchQuestionnaire('phq9')
      .then((res) => setQuestionnaire(res.data))
      .catch(() => setError('Failed to load assessment. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────
  function handleNext() {
    const updated = [...answers, selected];
    setAnswers(updated);
    setSelected(null);

    if (currentIndex + 1 < questionnaire.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All questions answered — calculate result
      const totalScore = updated.reduce((sum, s) => sum + s, 0);
      const severity   = getSeverity(totalScore);
      setResult({ score: totalScore, severity });

      // Save silently
      assessmentAPI.submitResult({
        questionnaireType: 'phq9',
        totalScore,
        severityTag: severity.tag,
      }).catch(() => setSaveWarning(true));
    }
  }

  function handleRetake() {
    setCurrentIndex(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
    setSaveWarning(false);
  }

  // ── Render: loading / error ─────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            Loading assessment…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={{ color: '#ef4444', textAlign: 'center' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Render: results screen ──────────────────────────────────────
  if (result) {
    const { score, severity } = result;
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={{ ...styles.title, ...styles.centered }}>Your Results</h2>
          <p style={{ ...styles.subtitle, ...styles.centered }}>
            PHQ-9 · Patient Health Questionnaire
          </p>

          <div style={styles.scoreCircle(severity.color)}>
            <span style={styles.scoreNumber}>{score}</span>
            <span style={styles.scoreLabel}>/ 27</span>
          </div>

          <div style={styles.centered}>
            <span style={styles.severityBadge(severity.color)}>{severity.tag}</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '0.9rem' }}>
            This screening tool is not a clinical diagnosis. Please speak with a
            mental health professional if you have concerns.
          </p>

          <button style={styles.retakeBtn} onClick={handleRetake}>
            Retake Assessment
          </button>

          {saveWarning && (
            <div style={styles.warningBanner}>
              ⚠️ Your result could not be saved this time. Your score is still shown above.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: quiz screen ─────────────────────────────────────────
  const question  = questionnaire.questions[currentIndex];
  const total     = questionnaire.questions.length;
  const progress  = ((currentIndex) / total) * 100;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>{questionnaire.title}</h2>
        <p style={styles.subtitle}>
          Question {currentIndex + 1} of {total}
        </p>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={styles.progressBar(progress)} />
        </div>

        <p style={styles.questionText}>{question.text}</p>

        {/* Answer options */}
        {question.answers.map((answer, i) => (
          <label key={i} style={styles.answerLabel(selected === answer.score)}>
            <input
              type="radio"
              name="answer"
              style={styles.radio}
              checked={selected === answer.score}
              onChange={() => setSelected(answer.score)}
            />
            {answer.text}
          </label>
        ))}

        <button
          style={styles.nextBtn(selected === null)}
          disabled={selected === null}
          onClick={handleNext}
        >
          {currentIndex + 1 === total ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
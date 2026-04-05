import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const MAX_SCORE = { phq9: 27, gad7: 21 };

function getMaxScore(type) {
  return MAX_SCORE[type] ?? 27;
}

function getSeverityStyle(score, type) {
  if (type === 'gad7') {
    if (score <= 4)  return { label: 'Minimal anxiety',  color: '#22c55e' };
    if (score <= 9)  return { label: 'Mild anxiety',     color: '#3b82f6' };
    if (score <= 14) return { label: 'Moderate anxiety', color: '#eab308' };
    return                  { label: 'Severe anxiety',   color: '#ef4444' };
  }
  // Default: PHQ-9
  if (score <= 4)  return { label: 'Minimal depression',          color: '#22c55e' };
  if (score <= 9)  return { label: 'Mild depression',              color: '#3b82f6' };
  if (score <= 14) return { label: 'Moderate depression',          color: '#eab308' };
  if (score <= 19) return { label: 'Moderately severe depression', color: '#f97316' };
  return                  { label: 'Severe depression',            color: '#ef4444' };
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function typeLabel(type) {
  if (type === 'gad7') return 'GAD-7 Anxiety';
  if (type === 'phq9') return 'PHQ-9 Depression';
  return type.toUpperCase();
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
    padding: '3rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: '700px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.5rem',
  },
  subheading: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '2rem',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  metricCard: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.25rem 1rem',
    textAlign: 'center',
  },
  metricValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#ffffff',
    display: 'block',
  },
  metricLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginTop: '4px',
    display: 'block',
  },
  resultCard: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  resultTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  resultTypeBadge: (color) => ({
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: color,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    borderRadius: '999px',
    padding: '3px 10px',
  }),
  resultScore: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  resultScoreMax: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
  },
  severityBadge: (color) => ({
    fontSize: '12px',
    fontWeight: '500',
    color: color,
    border: `1px solid ${color}`,
    borderRadius: '999px',
    padding: '3px 12px',
    display: 'inline-block',
    marginBottom: '0.75rem',
  }),
  barTrack: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  barFill: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    background: color,
    borderRadius: '999px',
    transition: 'width 0.5s ease',
  }),
  resultMeta: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  ctaBtn: {
    padding: '12px 28px',
    borderRadius: '10px',
    border: 'none',
    background: '#6366f1',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  bottomBtn: {
    marginTop: '1.5rem',
    padding: '12px 28px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  loadingText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingTop: '4rem' },
  errorText: { color: '#f87171', textAlign: 'center', paddingTop: '4rem' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultsHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    assessmentAPI
      .getMyResults()
      .then((data) => setResults(data))
      .catch(() => setError('Could not load your results. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.page}><p style={s.loadingText}>Loading your results…</p></div>;
  if (error) return <div style={s.page}><p style={s.errorText}>{error}</p></div>;

  // Metrics
  const total = results.length;
  const avgScore = total > 0 ? Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / total) : 0;
  const bestScore = total > 0 ? Math.min(...results.map((r) => r.totalScore)) : 0;

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <h1 style={s.heading}>Assessment History</h1>
        <p style={s.subheading}>All your completed mental health screenings</p>

        {/* Metric cards */}
        <div style={s.metricsRow}>
          <div style={s.metricCard}>
            <span style={s.metricValue}>{total}</span>
            <span style={s.metricLabel}>Total attempts</span>
          </div>
          <div style={s.metricCard}>
            <span style={s.metricValue}>{total > 0 ? avgScore : '—'}</span>
            <span style={s.metricLabel}>Average score</span>
          </div>
          <div style={s.metricCard}>
            <span style={s.metricValue}>{total > 0 ? bestScore : '—'}</span>
            <span style={s.metricLabel}>Best score</span>
          </div>
        </div>

        {/* Results list */}
        {total === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📋</div>
            <p style={s.emptyTitle}>No assessments yet</p>
            <p style={s.emptyDesc}>Take your first screening to see your results here.</p>
            <button style={s.ctaBtn} onClick={() => navigate('/assessment')}>
              Take an assessment
            </button>
          </div>
        ) : (
          results.map((result) => {
            const { label, color } = getSeverityStyle(result.totalScore, result.questionnaireType);
            const max = getMaxScore(result.questionnaireType);
            const pct = Math.round((result.totalScore / max) * 100);

            return (
              <div key={result._id} style={s.resultCard}>
                <div style={s.resultTop}>
                  <div>
                    <span style={s.resultTypeBadge(color)}>
                      {typeLabel(result.questionnaireType)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={s.resultScore}>{result.totalScore}</span>
                    <span style={s.resultScoreMax}> / {max}</span>
                  </div>
                </div>

                <span style={s.severityBadge(color)}>{label}</span>

                <div style={s.barTrack}>
                  <div style={s.barFill(pct, color)} />
                </div>

                <p style={s.resultMeta}>
                  {formatDate(result.createdAt)} · {formatTime(result.createdAt)}
                </p>
              </div>
            );
          })
        )}

        <button style={s.bottomBtn} onClick={() => navigate('/assessment')}>
          ← Take another assessment
        </button>
      </div>
    </div>
  );
}
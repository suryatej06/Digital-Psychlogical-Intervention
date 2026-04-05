import { useNavigate } from 'react-router-dom';

const assessments = [
  {
    type: 'phq9',
    label: 'PHQ-9',
    name: 'Depression Screening',
    description:
      'The Patient Health Questionnaire measures the severity of depressive symptoms over the past two weeks. Used widely by clinicians worldwide.',
    questions: 9,
    minutes: 3,
    scaleLabel: 'Minimal → Severe',
    accentColor: '#818cf8',
  },
  {
    type: 'gad7',
    label: 'GAD-7',
    name: 'Anxiety Screening',
    description:
      'The Generalised Anxiety Disorder scale measures anxiety symptoms over the past two weeks. A validated tool for identifying anxiety disorders.',
    questions: 7,
    minutes: 2,
    scaleLabel: 'Minimal → Severe',
    accentColor: '#34d399',
  },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 1.5rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
    maxWidth: '560px',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(129, 140, 248, 0.15)',
    border: '1px solid rgba(129, 140, 248, 0.35)',
    color: '#a5b4fc',
    borderRadius: '999px',
    padding: '4px 14px',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 0.75rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
    lineHeight: '1.6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '720px',
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '2rem',
    cursor: 'pointer',
    transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardLabelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  cardName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.6',
    margin: 0,
    flexGrow: 1,
  },
  meta: {
    display: 'flex',
    gap: '1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '1rem',
    marginTop: '0.25rem',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  metaValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  metaKey: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  startBtn: {
    marginTop: '0.25rem',
    padding: '10px 0',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.15s ease',
  },
  footer: {
    marginTop: '2.5rem',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.8rem',
    textAlign: 'center',
    maxWidth: '480px',
    lineHeight: '1.6',
  },
};

export default function AssessmentHome() {
  const navigate = useNavigate();

  function handleCardHover(e, accent, entering) {
    e.currentTarget.style.transform = entering ? 'translateY(-4px)' : 'translateY(0)';
    e.currentTarget.style.background = entering
      ? `rgba(255,255,255,0.09)`
      : 'rgba(255,255,255,0.06)';
    e.currentTarget.style.borderColor = entering
      ? accent + '66'
      : 'rgba(255,255,255,0.12)';
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.badge}>Mental Health Screening</span>
        <h1 style={styles.title}>Choose an Assessment</h1>
        <p style={styles.subtitle}>
          These validated clinical tools help you understand your mental wellbeing. Each
          takes just a few minutes and results are saved to your history.
        </p>
      </div>

      <div style={styles.grid}>
        {assessments.map((a) => (
          <div
            key={a.type}
            style={styles.card}
            onMouseEnter={(e) => handleCardHover(e, a.accentColor, true)}
            onMouseLeave={(e) => handleCardHover(e, a.accentColor, false)}
            onClick={() => navigate(`/assessment/${a.type}`)}
          >
            <div style={styles.cardLabelRow}>
              <span style={{ ...styles.cardLabel, color: a.accentColor }}>{a.label}</span>
            </div>

            <p style={styles.cardName}>{a.name}</p>
            <p style={styles.cardDesc}>{a.description}</p>

            <div style={styles.meta}>
              <div style={styles.metaItem}>
                <span style={styles.metaValue}>{a.questions}</span>
                <span style={styles.metaKey}>Questions</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaValue}>~{a.minutes} min</span>
                <span style={styles.metaKey}>Duration</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaValue}>{a.scaleLabel}</span>
                <span style={styles.metaKey}>Scale</span>
              </div>
            </div>

            <button
              style={{
                ...styles.startBtn,
                background: a.accentColor,
                color: a.type === 'phq9' ? '#1e1b4b' : '#064e3b',
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/assessment/${a.type}`);
              }}
            >
              Start {a.label} →
            </button>
          </div>
        ))}
      </div>

      <p style={styles.footer}>
        These screenings are not a clinical diagnosis. If you are struggling, please
        reach out to a counsellor or mental health professional.
      </p>
    </div>
  );
}
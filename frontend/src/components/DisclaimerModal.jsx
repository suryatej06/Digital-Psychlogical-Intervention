const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const card = {
  background: 'rgba(30, 27, 75, 0.97)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: '20px',
  padding: '2.25rem',
  width: '100%',
  maxWidth: '480px',
};

const iconStyle = {
  fontSize: '2rem',
  marginBottom: '1rem',
  textAlign: 'center',
};

const titleStyle = {
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#ffffff',
  marginBottom: '1rem',
  textAlign: 'center',
};

const bodyStyle = {
  fontSize: '0.9rem',
  color: 'rgba(255,255,255,0.65)',
  lineHeight: '1.7',
  marginBottom: '0.75rem',
};

const crisisBox = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px',
  padding: '10px 14px',
  marginBottom: '1.5rem',
  color: '#fca5a5',
  fontSize: '0.85rem',
  lineHeight: '1.6',
};

const btnRow = {
  display: 'flex',
  gap: '10px',
  flexDirection: 'column',
};

const primaryBtn = {
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  background: '#6366f1',
  color: '#ffffff',
  fontWeight: '600',
  fontSize: '0.95rem',
  cursor: 'pointer',
  width: '100%',
};

const outlineBtn = {
  padding: '11px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'transparent',
  color: 'rgba(255,255,255,0.65)',
  fontWeight: '500',
  fontSize: '0.9rem',
  cursor: 'pointer',
  width: '100%',
};

const STORAGE_KEY = 'disclaimerAcknowledged';

/**
 * DisclaimerModal
 * Shows once per browser session (sessionStorage).
 * Props:
 *   onAcknowledge  () => void  — called when user clicks "I Understand"
 *   onBack         () => void  — called when user clicks "Go Back"
 */
export default function DisclaimerModal({ onAcknowledge, onBack }) {
  // Already acknowledged this session — render nothing
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    return null;
  }

  function handleAcknowledge() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onAcknowledge();
  }

  return (
    <div style={overlay}>
      <div style={card} role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
        <div style={iconStyle}>📋</div>
        <h2 id="disclaimer-title" style={titleStyle}>Important Notice</h2>

        <p style={bodyStyle}>
          These questionnaires are <strong style={{ color: '#c7d2fe' }}>validated clinical screening tools</strong>,
          but they are <strong style={{ color: '#c7d2fe' }}>not a substitute for professional diagnosis</strong>
          or medical advice. Results are for personal awareness only and are not used to diagnose any condition.
        </p>

        <p style={bodyStyle}>
          Your responses are stored securely and are only visible to you and authorised counsellors at your institution.
        </p>

        <div style={crisisBox}>
          🚨 <strong>If you are in crisis or immediate danger</strong>, please stop and contact:
          <br />• National Crisis Line: <strong>988</strong> (call or text, 24/7)
          <br />• Emergency Services: <strong>911</strong>
          <br />• Crisis Text Line: text <strong>HOME</strong> to 741741
        </div>

        <div style={btnRow}>
          <button id="disclaimer-continue-btn" style={primaryBtn} onClick={handleAcknowledge}>
            I Understand — Continue
          </button>
          <button id="disclaimer-back-btn" style={outlineBtn} onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

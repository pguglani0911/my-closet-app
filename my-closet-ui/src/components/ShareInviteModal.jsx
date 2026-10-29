// my-closet-ui/src/components/ShareInviteModal.jsx
import { useState, useEffect } from 'react';
import authApi from '../api/authApi';
import configApi from '../api/configApi';

function ShareInviteModal({ onClose }) {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [defaultDays, setDefaultDays] = useState(null);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '8px', 
    border: '2px solid #e1c2eb', 
    marginBottom: '12px', 
    boxSizing: 'border-box', 
    fontSize: '14px' 
  };

  useEffect(() => {
    configApi.getSetting('invite_expiration_days')
      .then(res => {
        setDefaultDays(res.data.settingValue);
      })
      .catch(() => {
        setDefaultDays('7'); // Fallback display if request fails
      });
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const res = await authApi.createInvite({ invitedEmail });
      setInvite(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create invite.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        <h3 style={{ color: '#26192b', margin: '0 0 15px 0' }}>Share an Invite</h3>

        {!invite ? (
          <>
            <label style={{ fontSize: '12px', color: '#51588c' }}>Invitee's Email</label>
            <input
              style={inputStyle}
              placeholder="friend@email.com"
              value={invitedEmail}
              onChange={(e) => setInvitedEmail(e.target.value)}
            />

            {defaultDays && (
              <p style={{ fontSize: '12px', color: '#7a7082', marginTop: '-4px', marginBottom: '16px' }}>
                Invites automatically expire in <strong>{defaultDays} days</strong>.
              </p>
            )}

            {error && <p style={{ color: '#c0392b', fontSize: '13px' }}>{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={submitting || !invitedEmail}
              style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Generating...' : 'Generate Invite'}
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#51588c', margin: '0 0 5px 0' }}>
              Share this code with <strong>{invite.invitedEmail}</strong>:
            </p>
            <div style={{ background: '#f0e5f5', padding: '14px', borderRadius: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', margin: '10px 0', color: '#26192b' }}>
              {invite.inviteCode}
            </div>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              Expires: {new Date(invite.expiresAt).toLocaleDateString()}
            </p>
          </>
        )}

        <button
          onClick={onClose}
          style={{ marginTop: '15px', width: '100%', padding: '10px', background: 'none', border: '2px solid #26192b', color: '#26192b', borderRadius: '8px', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ShareInviteModal;
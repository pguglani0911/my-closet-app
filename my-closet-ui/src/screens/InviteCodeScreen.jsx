// my-closet-ui/src/screens/InviteCodeScreen.jsx
import { useState } from 'react';
import authApi from '../api/authApi';

function InviteCodeScreen({ onValid }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleContinue = async () => {
    setError(null);
    setChecking(true);
    try {
      const res = await authApi.validateInvite(code.trim());
      if (res.data.valid) {
        onValid(code.trim());
      } else {
        setError('That invite code is invalid or already used.');
      }
    } catch {
      setError('Could not verify that code. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 10px 0' }}>Wardrobe Manager</h2>
        <p style={{ color: '#51588c', fontSize: '14px', margin: '0 0 30px 0' }}>Please enter your invite code:</p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Invite code"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e1c2eb', marginBottom: '15px', boxSizing: 'border-box', fontSize: '14px' }}
        />

        {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '0 0 15px 0' }}>{error}</p>}

        <button
          onClick={handleContinue}
          disabled={checking || !code.trim()}
          style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: checking ? 'default' : 'pointer', opacity: checking ? 0.6 : 1 }}
        >
          {checking ? 'Checking...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}

export default InviteCodeScreen;
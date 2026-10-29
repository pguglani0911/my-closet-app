import { useState } from 'react';
import authApi from '../api/authApi';

function LoginScreen({ onLoginSuccess, onCreateAccount }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e1c2eb', marginBottom: '15px', boxSizing: 'border-box', fontSize: '14px' };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await authApi.login({ username, password });
      onLoginSuccess(res.data); // { username, role }
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setError(`Account not yet active (${err.response.data.status?.toLowerCase() || 'pending'}).`);
      } else {
        setError('Invalid username or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 10px 0' }}>Wardrobe Manager</h2>
        <p style={{ color: '#51588c', fontSize: '14px', margin: '0 0 25px 0' }}>
          Access is restricted to invited members only. Please log in or use the invite link.
        </p>

        <form onSubmit={handleLogin}>
          <input
            style={inputStyle}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '0 0 15px 0' }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting || !username || !password}
            style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1, marginBottom: '15px' }}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button
          onClick={onCreateAccount}
          style={{ background: 'none', border: 'none', color: '#c46fb2', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          New? Create an account
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
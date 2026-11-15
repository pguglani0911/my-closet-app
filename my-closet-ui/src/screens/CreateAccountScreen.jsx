// my-closet-ui/src/screens/CreateAccountScreen.jsx
import { useState } from 'react';
import authApi from '../api/authApi';

function CreateAccountScreen({ inviteCode, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

  const [streetAddress, setStreetAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e1c2eb', marginBottom: '12px', boxSizing: 'border-box', fontSize: '14px' };

  const goToStepTwo = () => {
    setError(null);
    if (password !== verifyPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!username || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await authApi.signup({
        inviteCode,
        username,
        email,
        password,
        verifyPassword,
        streetAddress,
        zipCode,
        country,
        state,
      });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 10px 0' }}>Wardrobe Manager</h2>
        <p style={{ color: '#51588c', fontSize: '14px', margin: '0 0 25px 0' }}>Create an Account</p>

        {step === 1 && (
          <>
            <input style={inputStyle} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input style={inputStyle} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Verify Password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} />

            {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '0 0 12px 0' }}>{error}</p>}

            <button
              onClick={goToStepTwo}
              style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input style={inputStyle} placeholder="Home Address" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
            <input style={inputStyle} placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            <input style={inputStyle} placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <input style={inputStyle} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />

            {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '0 0 12px 0' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '12px', background: '#fff', color: '#26192b', border: '2px solid #26192b', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 1, padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting...' : 'Continue'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateAccountScreen;
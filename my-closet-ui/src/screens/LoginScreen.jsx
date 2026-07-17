function LoginScreen({ currentUser, setCurrentUser, onEnter }) {
  const profileButtonStyle = (value) => ({
    padding: '14px',
    borderRadius: '8px',
    border: currentUser === value ? '3px solid #c46fb2' : '2px solid #e1c2eb',
    backgroundColor: currentUser === value ? '#faf2fc' : '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 10px 0' }}>Wardrobe Ecosystem</h2>
        <p style={{ color: '#51588c', fontSize: '14px', margin: '0 0 30px 0' }}>Choose a profile to demo sorting, listing segmentation, and personalized marketplace feeds.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
          <button onClick={() => setCurrentUser('user 372')} style={profileButtonStyle('user 372')}>
            <div style={{ color: '#26192b' }}>👤 User 372 (Primary Profile)</div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates managing your core capsule wardrobe system.</div>
          </button>

          <button onClick={() => setCurrentUser('user_877')} style={profileButtonStyle('user_877')}>
            <div style={{ color: '#26192b' }}>👤 User_877 (Neighbor Profile)</div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates a community neighbor viewing items for sale.</div>
          </button>

          <button onClick={() => setCurrentUser('user 222')} style={profileButtonStyle('user 222')}>
            <div style={{ color: '#26192b' }}>👤 User 222 (Third Profile)</div>
            <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates a second distinct neighborhood buyer or seller.</div>
          </button>
        </div>

        <button
          onClick={onEnter}
          style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Enter Sandbox Environment
        </button>
      </div>
    </div>
  );
}

export default LoginScreen;
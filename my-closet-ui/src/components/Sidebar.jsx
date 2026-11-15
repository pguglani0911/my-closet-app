import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/users';

function Sidebar({ 
  currentUser, 
  currentScreen, 
  setCurrentScreen, 
  conversationCount, 
  onOpenRecentlyWorn, 
  onLogout 
}) {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [addressForm, setAddressForm] = useState({ streetAddress: '', zipCode: '', state: '', country: '' });

  // Always fetch user data on mount if currentUser exists so role-based features (like Admin link) display immediately
  useEffect(() => {
    if (currentUser) {
      axios.get(`${API_BASE}/${currentUser}`)
        .then((res) => {
          setUserData(res.data);
          setAddressForm({
            streetAddress: res.data.streetAddress || '',
            zipCode: res.data.zipCode || '',
            state: res.data.state || '',
            country: res.data.country || '',
          });
        })
        .catch(() => setStatusMessage('Error fetching account data'));
    }
  }, [currentUser]);

  const handlePasswordResetRequest = async () => {
    try {
      await axios.post(`${API_BASE}/${currentUser}/request-password-reset`);
      setStatusMessage('Password reset token sent to your email!');
    } catch (err) {
      setStatusMessage('Failed to request reset.');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_BASE}/${currentUser}/settings`, addressForm);
      setUserData(res.data);
      setStatusMessage('Settings saved successfully!');
      setIsEditingSettings(false);
    } catch (err) {
      setStatusMessage('Failed to save settings.');
    }
  };

  const sidebarStyle = {
    width: '240px',
    backgroundColor: '#26192b',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    boxSizing: 'border-box',
    position: 'relative',
    gap: '15px'
  };

  const navButtonStyle = (screen) => ({
    padding: '10px 12px',
    background: currentScreen === screen ? '#c46fb2' : 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: currentScreen === screen ? 'bold' : 'normal',
    borderRadius: '8px',
    fontSize: '14px',
    textDecoration: 'none',
  });

  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '20px', margin: '0', color: '#e1c2eb', letterSpacing: '0.5px' }}>Wardrobe Manager</h2>
      </div>

      {/* Navigation Sections */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '4px 0 2px 0' }}>Personal Capsule</div>
        <button onClick={() => setCurrentScreen('closet')} style={navButtonStyle('closet')}>👗 Closet</button>
        <button onClick={() => setCurrentScreen('stats')} style={navButtonStyle('stats')}>📊 My Stats</button>
        <button onClick={onOpenRecentlyWorn} style={navButtonStyle('recentlyWorn')}>🕒 Recently Worn</button>

        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '10px 0 2px 0' }}>Marketplace Feed</div>
        <button onClick={() => setCurrentScreen('garageSale')} style={navButtonStyle('garageSale')}>🏷️ Garage Sale Feed</button>
        <button onClick={() => setCurrentScreen('myListings')} style={navButtonStyle('myListings')}>📦 My Listings</button>
        <button onClick={() => setCurrentScreen('neighborhood')} style={navButtonStyle('neighborhood')}>🏘️ Neighborhood</button>
        <button onClick={() => setCurrentScreen('conversations')} style={{ ...navButtonStyle('conversations'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>💬 Conversations</span>
          {conversationCount > 0 && (
            <span style={{ background: '#ff7675', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', color: 'white' }}>
              {conversationCount}
            </span>
          )}
        </button>

        {/* Admin Controls - Visible only if user role is ADMIN */}
        {userData?.role === 'ADMIN' && (
          <>
            <div style={{ fontSize: '11px', color: '#e1c2eb', textTransform: 'uppercase', fontWeight: 'bold', margin: '14px 0 2px 0' }}>Admin Panel</div>
            <button 
              onClick={() => setCurrentScreen('admin')} 
              style={{
                ...navButtonStyle('admin'),
                backgroundColor: currentScreen === 'admin' ? '#e1c2eb' : 'rgba(225, 194, 235, 0.15)',
                color: currentScreen === 'admin' ? '#26192b' : '#e1c2eb',
                border: '1px solid #e1c2eb',
                fontWeight: 'bold'
              }}
            >
              🛡️ Admin Review
            </button>
          </>
        )}
      </nav>

      {/* Account Settings & Modal Footer */}
      {currentUser && (
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          <button 
            onClick={() => setShowAccountModal(!showAccountModal)}
            style={{
              background: '#3d2845',
              color: 'white',
              border: '1px solid #c46fb2',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}
          >
            <span>👤 {currentUser}</span>
            <span>⚙️</span>
          </button>

          {showAccountModal && (
            <div style={{
              position: 'absolute',
              bottom: '50px',
              left: '0',
              width: '240px',
              backgroundColor: '#35213d',
              borderRadius: '12px',
              border: '1px solid #51588c',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              padding: '12px',
              zIndex: 100,
              boxSizing: 'border-box',
            }}>
              <h4 style={{ margin: '0 0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', fontSize: '14px' }}>Account Settings</h4>

              {statusMessage && (
                <div style={{ fontSize: '11px', color: '#6febc4', marginBottom: '6px' }}>{statusMessage}</div>
              )}

              {loading ? (
                <div style={{ fontSize: '12px', color: '#ccc' }}>Loading details...</div>
              ) : userData ? (
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  <div><strong>Username:</strong> {userData.username}</div>
                  <div><strong>Email:</strong> {userData.email}</div>
                  <div><strong>Role:</strong> {userData.role}</div>

                  <div>
                    <strong>Password:</strong> ••••••••{' '}
                    <span onClick={handlePasswordResetRequest} style={{ color: '#c46fb2', cursor: 'pointer', fontSize: '11px' }}>(Reset)</span>
                  </div>

                  {isEditingSettings ? (
                    <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <input type="text" placeholder="Street Address" value={addressForm.streetAddress} onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })} style={{ padding: '4px', fontSize: '11px' }} />
                      <input type="text" placeholder="Zip Code" value={addressForm.zipCode} onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })} style={{ padding: '4px', fontSize: '11px' }} />
                      <input type="text" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} style={{ padding: '4px', fontSize: '11px' }} />
                      <input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} style={{ padding: '4px', fontSize: '11px' }} />
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <button type="submit" style={{ background: '#4cd137', border: 'none', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Save</button>
                        <button type="button" onClick={() => setIsEditingSettings(false)} style={{ background: '#ff7675', border: 'none', color: 'white', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <button onClick={() => setIsEditingSettings(true)} style={{ background: 'transparent', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '11px', padding: '2px 0' }}>⚙️ Edit Address Settings</button>
                  )}
                </div>
              ) : null}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button 
                  onClick={() => setStatusMessage(`Your Invite Code: ${userData?.inviteCode || 'None'}`)} 
                  style={{ background: 'transparent', color: '#6febc4', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '11px', padding: '2px 0' }}
                >
                  🎟️ View Invite Code
                </button>
              </div>

              {onLogout && (
                <>
                  <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
                  <button 
                    onClick={() => { setShowAccountModal(false); onLogout(); }}
                    style={{
                      background: '#ff7675',
                      color: 'white',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%',
                      fontSize: '11px',
                    }}
                  >
                    🚪 Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;

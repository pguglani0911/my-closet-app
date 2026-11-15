// my-closet-ui/src/screens/AdminReviewScreen.jsx
import { useState, useEffect } from 'react';
import authApi from '../api/authApi';

function AdminReviewScreen() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await authApi.listPending();
      setPendingUsers(res.data);
    } catch {
      setError('Could not load pending users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (username) => {
    await authApi.approve(username);
    fetchPending();
  };

  const handleDeny = async (username) => {
    await authApi.deny(username, null);
    fetchPending();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '40px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 20px 0' }}>Wardrobe Manager — Admin</h2>

        {error && <p style={{ color: '#c0392b', fontSize: '13px' }}>{error}</p>}
        {loading ? (
          <p style={{ color: '#51588c' }}>Loading...</p>
        ) : pendingUsers.length === 0 ? (
          <p style={{ color: '#51588c' }}>No pending users right now.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e1c2eb' }}>
                <th style={{ padding: '10px', color: '#26192b' }}>Username</th>
                <th style={{ padding: '10px', color: '#26192b' }}>Email</th>
                <th style={{ padding: '10px', color: '#26192b' }}>Status</th>
                <th style={{ padding: '10px', color: '#26192b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.username} style={{ borderBottom: '1px solid #f0e5f5' }}>
                  <td style={{ padding: '10px' }}>{u.username}</td>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>{u.accountStatus}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(u.username)}
                      style={{ padding: '6px 14px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDeny(u.username)}
                      style={{ padding: '6px 14px', background: '#fff', color: '#c0392b', border: '2px solid #c0392b', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminReviewScreen;
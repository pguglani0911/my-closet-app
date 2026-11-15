// my-closet-ui/src/screens/PendingApprovalScreen.jsx
function PendingApprovalScreen() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#26192b', margin: '0 0 15px 0' }}>Wardrobe Manager</h2>
        <p style={{ color: '#51588c', fontSize: '14px', margin: 0 }}>
          You have been placed on a waiting list. An email will be sent with a change in status.
        </p>
      </div>
    </div>
  );
}

export default PendingApprovalScreen;
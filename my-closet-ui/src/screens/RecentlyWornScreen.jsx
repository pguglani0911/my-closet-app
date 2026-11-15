function RecentlyWornScreen({ currentUser, recentlyWornItems }) {
  return (
    <div>
      <h1 style={{ color: '#26192b', marginBottom: '30px' }}>Recently Worn Usage Logs ({currentUser})</h1>
      {recentlyWornItems.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#51588c' }}>No wear logging updates registered for this user.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {recentlyWornItems.map(item => (
            <div key={item.id} style={{ border: '1px solid #26192b', padding: '20px', borderRadius: '12px', backgroundColor: '#26192b', color: 'white' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#e1c2eb' }}>{item.itemName}</h3>
              <p><strong>Log Tracking Checkpoint:</strong> {item.lastWorn}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentlyWornScreen;
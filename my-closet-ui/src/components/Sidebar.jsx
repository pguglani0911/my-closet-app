function Sidebar({ currentUser, setCurrentUser, currentScreen, setCurrentScreen, conversationCount, onExit, onOpenRecentlyWorn }) {
  const navButtonStyle = (screen) => ({
    padding: '10px',
    background: currentScreen === screen ? '#c46fb2' : 'transparent',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 'bold',
    borderRadius: '6px',
  });

  return (
    <div style={{ width: '240px', backgroundColor: '#26192b', color: 'white', padding: '30px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '20px', margin: '0 0 5px 0', color: '#e1c2eb', letterSpacing: '0.5px' }}>Wardrobe Manager</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '5px' }}>
          <label style={{ fontSize: '11px', color: '#bac7fb' }}>
            Acting As:
            <select
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
              style={{ marginLeft: '5px', background: '#3d2944', color: 'white', border: '1px solid #e1c2eb', borderRadius: '4px', padding: '2px 4px', fontSize: '11px', cursor: 'pointer' }}
            >
              <option value="user 372">User 372</option>
              <option value="user_877">User_877</option>
              <option value="user 222">User 222</option>
            </select>
          </label>
          <button onClick={onExit} style={{ background: 'none', border: 'none', color: '#ff7675', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline', textAlign: 'left' }}>Exit Sandbox</button>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '10px 0 4px 0' }}>Personal Capsule</div>
        <button onClick={() => setCurrentScreen('closet')} style={navButtonStyle('closet')}>My Closet</button>
        <button onClick={() => setCurrentScreen('stats')} style={navButtonStyle('stats')}>My Stats</button>
        <button onClick={onOpenRecentlyWorn} style={navButtonStyle('recentlyWorn')}>Recently Worn</button>

        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '15px 0 4px 0' }}>Marketplace Feed</div>
        <button onClick={() => setCurrentScreen('garageSale')} style={navButtonStyle('garageSale')}>Garage Sale Feed</button>
        <button onClick={() => setCurrentScreen('myListings')} style={navButtonStyle('myListings')}>My Listings</button>
        <button onClick={() => setCurrentScreen('neighborhood')} style={navButtonStyle('neighborhood')}>My Neighborhood</button>
        <button onClick={() => setCurrentScreen('conversations')} style={{ ...navButtonStyle('conversations'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Conversations</span>
          <span style={{ background: '#ff7675', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', color: 'white' }}>
            {conversationCount}
          </span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;
import ItemCard from '../components/ItemCard';

function NeighborhoodScreen({ items, currentUser, onContactSeller }) {
  const neighborItems = items.filter(item => item.forSale && item.user !== currentUser);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#26192b', margin: 0 }}>My Neighborhood Closet Feed</h1>
        <p style={{ color: '#51588c', marginTop: '3px' }}>Items available exclusively from neighboring residents, excluding your own listings.</p>
      </div>
      {neighborItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
          <h3 style={{ color: '#26192b' }}>No active neighbor listings found.</h3>
          <p style={{ color: '#51588c' }}>Try swapping profiles via the sidebar dropdown to add clothing elements from another context!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {neighborItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              variant="neighborhood"
              currentUser={currentUser}
              onContactSeller={onContactSeller}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NeighborhoodScreen;
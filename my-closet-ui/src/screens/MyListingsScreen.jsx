import ItemCard from '../components/ItemCard';

function MyListingsScreen({ items, currentUser, onToggleSale }) {
  const myListings = items.filter(item => item.forSale && item.user === currentUser);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#26192b', margin: 0 }}>My Active Marketplace Listings</h1>
        <p style={{ color: '#51588c', marginTop: '3px' }}>Items that you ({currentUser}) have listed for sale.</p>
      </div>
      {myListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
          <h3 style={{ color: '#26192b' }}>You aren't selling anything right now.</h3>
          <p style={{ color: '#51588c' }}>Head back to "My Closet", hover over an item, and click the "🏷️ Sell" button to create a public listing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {myListings.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              variant="myListings"
              currentUser={currentUser}
              onToggleSale={onToggleSale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListingsScreen;
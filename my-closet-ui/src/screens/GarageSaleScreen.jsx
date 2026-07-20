import ItemCard from '../components/ItemCard';

function GarageSaleScreen({ items, currentUser, onToggleSale, onContactSeller }) {
  const forSaleItems = items.filter(item => item.forSale);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#26192b', margin: 0 }}>Community Garage Sale</h1>
        <p style={{ color: '#51588c', marginTop: '3px' }}>Bargains straight out of neighborhood closets.</p>
      </div>
      {forSaleItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
          <h3 style={{ color: '#26192b' }}>The feed is currently empty!</h3>
          <p style={{ color: '#51588c' }}>Go to "My Closet", hover over an item, and click "🏷️ Sell" to list something.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {forSaleItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              variant="garageSale"
              currentUser={currentUser}
              onToggleSale={onToggleSale}
              onContactSeller={onContactSeller}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default GarageSaleScreen;
import { useState } from 'react';

/**
 * Reusable clothing item card.
 *
 * variant controls which action buttons/details render:
 *  - "closet": hover-to-reveal actions (wear, sell/delist, delete, mark-to-go)
 *  - "garageSale": public feed, shows "Remove My Listing" or "Contact Seller"
 *  - "myListings": owner-only feed, shows "Cancel Listing & Delist"
 *  - "neighborhood": other users' listings, shows "Send Offer / Chat"
 */
function ItemCard({
  item,
  variant,
  currentUser,
  onWear,
  onToggleMarkToGo,
  onDelete,
  onToggleSale,
  onContactSeller,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    border: '1px solid #51588c',
    borderRadius: '12px',
    backgroundColor: variant === 'closet' ? (item.toGo ? '#51588c' : '#c46fb2') : '#ffffff',
    color: variant === 'closet' ? (item.toGo ? 'white' : '#26192b') : '#26192b',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    minHeight: variant === 'garageSale' ? '320px' : '280px',
    boxShadow: variant === 'garageSale' ? '0 4px 10px rgba(0,0,0,0.05)' : undefined,
  };

  const showSizeBadge = variant === 'garageSale' || variant === 'neighborhood';

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showSizeBadge && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#26192b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>
          Size: {item.size || 'M'}
        </div>
      )}

      {item.image ? (
        <div style={{ width: '100%', height: variant === 'closet' ? '180px' : '160px', backgroundColor: '#fff' }}>
          <img src={item.image} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: variant === 'closet' ? '180px' : '160px', backgroundColor: '#eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
          No Photo
        </div>
      )}

      {variant === 'closet' && isHovered && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
          <button onClick={(e) => onWear(e, item)} style={{ background: '#26192b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>＋ Wear</button>
          <button onClick={(e) => onToggleSale(e, item)} style={{ background: item.forSale ? '#e84118' : '#4cd137', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            {item.forSale ? '🏷️ Delist' : '🏷️ Sell'}
          </button>
          <button onClick={(e) => onDelete(e, item.id)} style={{ background: '#ff7675', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>✕ Delete</button>
        </div>
      )}

      <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: variant === 'closet' ? undefined : 'left' }}>
        <div>
          {variant === 'closet' ? (
            <>
              <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize', fontSize: '18px', borderBottom: isHovered ? '1px dashed rgba(38,25,43,0.2)' : 'none', paddingBottom: '4px' }}>{item.itemName}</h4>
              {isHovered ? (
                <div style={{ transition: 'opacity 0.2s' }}>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Type:</strong> {item.clothingType}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Material:</strong> {item.material}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Cost:</strong> ${item.cost}</p>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Wear Count:</strong> {item.wearFrequency || 0}</p>
                  {item.forSale && <p style={{ margin: '4px 0', fontSize: '13px', color: '#6febc4' }}><strong>Listed For Sale:</strong> (${item.sellingPrice})</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {item.tags.map((tag, idx) => (
                        <span key={idx} style={{ background: '#bac7fb', color: '#26192b', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>#{tag.tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: item.toGo ? 'rgba(255,255,255,0.6)' : 'rgba(38,25,43,0.5)', fontSize: '12px', fontStyle: 'italic', marginTop: '10px' }}>Hover to view details...</p>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize', fontSize: variant === 'garageSale' ? '18px' : '17px', fontWeight: 'bold' }}>{item.itemName}</h4>
                <span style={{ color: '#c46fb2', fontWeight: 'bold', fontSize: variant === 'garageSale' ? '18px' : undefined }}>${item.sellingPrice?.toFixed(2) || '0.00'}</span>
              </div>
              {variant === 'garageSale' && (
                <>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}><strong>Material:</strong> {item.material}</p>
                  <p style={{ margin: '2px 0', fontSize: '11px', color: '#999' }}>Listed by: {item.user === currentUser ? 'You' : item.user || 'Unknown'}</p>
                </>
              )}
              {variant === 'myListings' && (
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Size: {item.size || 'M'} | Material: {item.material}</p>
              )}
              {variant === 'neighborhood' && (
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Owner Account: {item.user || 'Neighbor'}</p>
              )}
            </>
          )}
        </div>

        {variant === 'closet' && isHovered && (
          <button onClick={(e) => onToggleMarkToGo(e, item)} style={{ marginTop: '12px', padding: '6px', background: item.toGo ? '#c46fb2' : '#26192b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>
            {item.toGo ? 'Return to Closet' : 'Marked to Go'}
          </button>
        )}

        {variant === 'garageSale' && (
          item.user === currentUser ? (
            <button onClick={(e) => onToggleSale(e, item)} style={{ marginTop: '12px', padding: '8px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Remove My Listing</button>
          ) : (
            <button onClick={() => onContactSeller(item)} style={{ marginTop: '12px', padding: '8px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Contact Seller</button>
          )
        )}

        {variant === 'myListings' && (
          <button onClick={(e) => onToggleSale(e, item)} style={{ marginTop: '12px', padding: '8px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Cancel Listing & Delist</button>
        )}

        {variant === 'neighborhood' && (
          <button onClick={() => onContactSeller(item)} style={{ marginTop: '12px', padding: '8px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Send Offer / Chat</button>
        )}
      </div>
    </div>
  );
}

export default ItemCard;
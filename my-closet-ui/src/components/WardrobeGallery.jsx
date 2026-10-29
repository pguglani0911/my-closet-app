import React from 'react';

export default function WardrobeGallery({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
      {items.map((item) => (
        <div key={item.sqlId || item.couchDocId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
          {/* Display image directly from CouchDB public URL */}
          <img 
            src={item.imageUrl} 
            alt={item.itemName} 
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} 
            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found'; }}
          />
          <h4>{item.itemName}</h4>
          <p>Doc ID: <code>{item.couchDocId}</code></p>
        </div>
      ))}
    </div>
  );
}
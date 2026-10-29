import React, { useState } from 'react';

export default function AddItemForm({ onItemAdded }) {
  const [itemName, setItemName] = useState('');
  const [size, setSize] = useState('M');
  const [cost, setCost] = useState('0.00');
  const [isForSale, setIsForSale] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image!");

    setLoading(true);
    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('size', size);
    formData.append('cost', cost);
    formData.append('isForSale', isForSale);
    formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:8080/api/items', {
        method: 'POST',
        body: formData, // Browser automatically sets 'multipart/form-data' header
      });

      if (!response.ok) throw new Error('Failed to save item');

      const data = await response.json();
      alert('Item added successfully!');
      
      // Reset form
      setItemName('');
      setImageFile(null);
      if (onItemAdded) onItemAdded(data);
    } catch (err) {
      console.error(err);
      alert('Error uploading item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <h3>Add New Clothing Item</h3>
      <input 
        type="text" 
        placeholder="Item Name (e.g. Denim Jacket)" 
        value={itemName} 
        onChange={(e) => setItemName(e.target.value)} 
        required 
      />
      <input 
        type="text" 
        placeholder="Size" 
        value={size} 
        onChange={(e) => setSize(e.target.value)} 
      />
      <input 
        type="number" 
        step="0.01" 
        placeholder="Cost" 
        value={cost} 
        onChange={(e) => setCost(e.target.value)} 
      />
      <label>
        <input 
          type="checkbox" 
          checked={isForSale} 
          onChange={(e) => setIsForSale(e.target.checked)} 
        />
        For Sale
      </label>
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setImageFile(e.target.files[0])} 
        required 
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Save Item'}
      </button>
    </form>
  );
}
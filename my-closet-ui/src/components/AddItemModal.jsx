function AddItemModal({
  onClose,
  onSubmit,
  itemName, setItemName,
  clothingType, setClothingType,
  material, setMaterial,
  cost, setCost,
  isForSale, setIsForSale,
  sellingPrice, setSellingPrice,
  size, setSize,
  onImageChange,
  tagsInput, setTagsInput,
}) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(38, 25, 43, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#26192b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '450px', position: 'relative' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#bac7fb', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        <h3 style={{ marginTop: '0', marginBottom: '20px', color: '#e1c2eb' }}>Add New Wardrobe Item</h3>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <input type="text" placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <select value={clothingType} onChange={e => setClothingType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box', height: '40px' }}>
              <option value="Shirt">Shirt</option>
              <option value="Pants">Pants</option>
              <option value="Dresses">Dresses</option>
              <option value="Accessory">Accessory</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input type="text" placeholder="Material" value={material} onChange={e => setMaterial(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input type="number" step="0.01" placeholder="Cost ($)" value={cost} onChange={e => setCost(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '14px', border: '1px dashed #e1c2eb', padding: '10px', borderRadius: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e1c2eb', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="checkbox" checked={isForSale} onChange={e => setIsForSale(e.target.checked)} /> List directly on the Garage Sale Feed?
            </label>
            {isForSale && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <input type="number" step="0.01" placeholder="Price ($)" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required style={{ flex: 1, padding: '8px', borderRadius: '4px', backgroundColor: '#fff' }} />
                <input type="text" placeholder="Size (e.g. M)" value={size} onChange={e => setSize(e.target.value)} required style={{ width: '100px', padding: '8px', borderRadius: '4px', backgroundColor: '#fff' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#e1c2eb', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Upload Item Photo:</label>
            <input type="file" accept="image/*" onChange={onImageChange} style={{ width: '100%', color: '#e1c2eb', fontSize: '13px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input type="text" placeholder="Tags (comma separated)" value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 15px', background: '#51588c', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 20px', background: '#c46fb2', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add to Closet</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
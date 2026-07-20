import ItemCard from '../components/ItemCard';

function ClosetScreen({
  currentUser,
  items,
  sortByOption,
  onSortRadioClick,
  tagSearchInput,
  setTagSearchInput,
  onOpenModal,
  onWear,
  onToggleMarkToGo,
  onDelete,
  onToggleSale,
}) {
  const getProcessedClosetItems = () => {
    let processed = items.filter(item => !item.user || item.user === currentUser);

    if (tagSearchInput.trim() !== '') {
      processed = processed.filter(item =>
        item.tags && item.tags.some(t => t.tag.toLowerCase().includes(tagSearchInput.toLowerCase().trim()))
      );
    }

    if (sortByOption === 'cost') {
      processed.sort((a, b) => (parseFloat(a.cost) || 0) - (parseFloat(b.cost) || 0));
    } else if (sortByOption === 'frequency') {
      processed.sort((a, b) => (b.wearFrequency || 0) - (a.wearFrequency || 0));
    } else if (sortByOption === 'material') {
      processed.sort((a, b) => (a.material || '').localeCompare(b.material || ''));
    } else if (sortByOption === 'toGo') {
      processed.sort((a, b) => (b.toGo === a.toGo) ? 0 : b.toGo ? -1 : 1);
    }
    return processed;
  };

  const processedItems = getProcessedClosetItems();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#26192b', margin: 0 }}>My Closet Setup ({currentUser})</h1>
        <button onClick={onOpenModal} style={{ padding: '10px 20px', background: '#26192b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px' }}>+ Add Item</button>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ width: '230px', backgroundColor: '#ffffff', border: '3px solid #26192b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: '0 0 5px 0', fontFamily: 'monospace', fontSize: '22px' }}>Sort by</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'cost'} onClick={() => onSortRadioClick('cost')} onChange={() => {}} /> cost</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'frequency'} onClick={() => onSortRadioClick('frequency')} onChange={() => {}} /> frequency</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'material'} onClick={() => onSortRadioClick('material')} onChange={() => {}} /> material</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'toGo'} onClick={() => onSortRadioClick('toGo')} onChange={() => {}} /> Marked to Go</label>

          <div style={{ marginTop: '10px', borderTop: '2px dashed #e1c2eb', paddingTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Filter by Tag:</label>
            <input type="text" placeholder="User input tag..." value={tagSearchInput} onChange={(e) => setTagSearchInput(e.target.value)} style={{ width: '100%', padding: '6px', border: '2px solid #26192b', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {processedItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
              <h3 style={{ color: '#26192b' }}>This user's capsule is empty!</h3>
              <p style={{ color: '#51588c' }}>Click "+ Add Item" at the top right to populate pieces into this specific profile.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {processedItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  variant="closet"
                  currentUser={currentUser}
                  onWear={onWear}
                  onToggleMarkToGo={onToggleMarkToGo}
                  onDelete={onDelete}
                  onToggleSale={onToggleSale}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClosetScreen;
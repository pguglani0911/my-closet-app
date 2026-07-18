function StatsScreen({ items, currentUser }) {
  const getStatsAnalytics = () => {
    const scopedItems = items.filter(item => !item.user || item.user === currentUser);
    if (scopedItems.length === 0) return null;

    const sortedByWear = [...scopedItems].sort((a, b) => (b.wearFrequency || 0) - (a.wearFrequency || 0));
    const sortedByValue = [...scopedItems].sort((a, b) => {
      const valA = (a.cost || 0) / Math.max(a.wearFrequency || 0, 1);
      const valB = (b.cost || 0) / Math.max(b.wearFrequency || 0, 1);
      return valA - valB;
    });

    return {
      mostWorn: sortedByWear[0],
      leastWorn: sortedByWear[sortedByWear.length - 1],
      bestValue: sortedByValue[0],
      worstValue: sortedByValue[sortedByValue.length - 1],
    };
  };

  const analytics = getStatsAnalytics();

  return (
    <div>
      <h1 style={{ color: '#26192b', marginBottom: '10px' }}>My Performance Statistics ({currentUser})</h1>
      <p style={{ color: '#51588c', marginBottom: '30px' }}>Real-time values computed specifically across your capsule parameters.</p>
      {!analytics ? (
        <p style={{ fontStyle: 'italic', color: '#51588c' }}>Add items to populate analytics for this user profile.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #26192b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#51588c' }}>Most Worn</h3>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{analytics.mostWorn.itemName}</p>
            <span style={{ fontSize: '14px', color: '#888' }}>{analytics.mostWorn.wearFrequency} wear counts</span>
          </div>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #26192b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#51588c' }}>Least Worn</h3>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{analytics.leastWorn.itemName}</p>
            <span style={{ fontSize: '14px', color: '#888' }}>{analytics.leastWorn.wearFrequency} wear counts</span>
          </div>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #26192b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c46fb2' }}>Best Value Metric</h3>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{analytics.bestValue.itemName}</p>
            <span style={{ fontSize: '14px', color: '#26192b', fontWeight: 'bold' }}>${((analytics.bestValue.cost || 0) / Math.max(analytics.bestValue.wearFrequency || 0, 1)).toFixed(2)} / wear</span>
          </div>
          <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '2px solid #26192b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ff7675' }}>Worst Value Metric</h3>
            <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{analytics.worstValue.itemName}</p>
            <span style={{ fontSize: '14px', color: '#ff7675', fontWeight: 'bold' }}>${((analytics.worstValue.cost || 0) / Math.max(analytics.worstValue.wearFrequency || 0, 1)).toFixed(2)} / wear</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatsScreen;
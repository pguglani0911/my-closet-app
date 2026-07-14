import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Demo Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('user 372'); 

  // Core App Navigation & Sync State
  const [currentScreen, setCurrentScreen] = useState('closet'); 
  const [items, setItems] = useState([]);
  const [recentlyWornItems, setRecentlyWornItems] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Hover tracker for single card details or quick actions
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Form input states
  const [itemName, setItemName] = useState('');
  const [clothingType, setClothingType] = useState('Shirt'); 
  const [material, setMaterial] = useState('');
  const [cost, setCost] = useState('');
  const [tagsInput, setTagsInput] = useState(''); 
  const [imageString, setImageString] = useState(''); 

  // Sidebar Filtering & Sorting control states
  const [sortByOption, setSortByOption] = useState(''); 
  const [tagSearchInput, setTagSearchInput] = useState(''); 

  const [isForSale, setIsForSale] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [size, setSize] = useState('');

  // --- CLEAN CHAT INBOX STATE (NO HARDCODED DATA) ---
  const [conversations, setConversations] = useState(() => {
    const savedChats = localStorage.getItem('wardrobe_conversations');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Automatically updates localStorage whenever a message is added or a thread is deleted
  useEffect(() => {
    localStorage.setItem('wardrobe_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  const fetchItems = () => {
    axios.get('http://localhost:8080/api/wardrobe')
      .then(response => setItems(response.data))
      .catch(err => setError('Failed to fetch wardrobe items. Ensure your backend is running.'));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageString(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawTags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const tagsObjectArray = rawTags.map(tagName => ({ tag: tagName }));

    const newItem = {
      itemName,
      clothingType,
      material,
      cost: parseFloat(cost) || 0.0,
      tags: tagsObjectArray,
      image: imageString,
      forSale: isForSale,
      user: currentUser, 
      sellingPrice: isForSale ? parseFloat(sellingPrice) || 0.0 : 0.0,
      size: isForSale ? size : ''
    };

    axios.post('http://localhost:8080/api/wardrobe', newItem)
      .then(response => {
        setItems([...items, response.data]);
        setItemName(''); setClothingType('Shirt'); setMaterial(''); setCost(''); setTagsInput(''); setImageString('');
        setIsModalOpen(false); 
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to save new clothing item.'));
  };

  const handleIncrementFrequency = (e, item) => {
    e.stopPropagation(); 
    axios.put(`http://localhost:8080/api/wardrobe/${item.id}/wear`)
      .then(response => {
        setItems(prev => prev.map(i => i.id === item.id ? response.data : i));
      })
      .catch(err => setError('Could not update wear logs.'));
  };

  const handleToggleMarkToGo = (e, item) => {
    e.stopPropagation();
    const endpointPath = item.toGo ? 'markNotToGo' : 'markToGo';
    axios.put(`http://localhost:8080/api/wardrobe/${item.id}/${endpointPath}`)
      .then(response => {
        setItems(prevItems => prevItems.map(i => i.id === item.id ? response.data : i));
      })
      .catch(err => setError(`Failed to update item status.`));
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation(); 
    if (window.confirm("Are you sure you want to delete this piece from your wardrobe registry?")) {
      axios.delete(`http://localhost:8080/api/wardrobe/${id}`)
        .then(() => {
          setItems(prev => prev.filter(item => item.id !== id));
        })
        .catch(err => setError('Could not successfully delete requested component.'));
    }
  };

  const handleSortRadioClick = (value) => {
    setSortByOption(sortByOption === value ? '' : value);
  };

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
      worstValue: sortedByValue[sortedByValue.length - 1]
    };
  };
  
  const analytics = getStatsAnalytics();

  const handleToggleListingForSale = (e, item) => {
    e.stopPropagation();
    const targetSaleState = !item.forSale;
    
    let targetPrice = item.sellingPrice || 0.0;
    let targetSize = item.size || 'M';

    if (targetSaleState) {
      const priceInput = window.prompt("Enter selling price ($):", "15.00");
      const sizeInput = window.prompt("Enter clothing size (e.g., S, M, L):", "M");
      if (priceInput === null || sizeInput === null) return; 
      targetPrice = parseFloat(priceInput) || 0.0;
      targetSize = sizeInput;
    }

    axios.put(`http://localhost:8080/api/wardrobe/${item.id}/toggleSale?price=${targetPrice}&size=${targetSize}&user=${currentUser}`)
      .then(response => {
        setItems(prev => prev.map(i => i.id === item.id ? response.data : i));
      })
      .catch(err => setError('Could not update marketplace listing registry target.'));
  };

  // --- INITIALIZES UNIQUE INQUIRY CAPTURING BOTH PARTICIPANTS ---
  const handleContactSeller = (item) => {
    const existingChat = conversations.find(c => c.id === item.id);
    
    if (!existingChat) {
      const newChatThread = {
        id: item.id,
        item: item.itemName,
        itemPrice: item.sellingPrice || 0.0,
        buyer: currentUser,            // The person clicking contact
        seller: item.user || 'Unknown Neighbor', // The person who listed the item
        fromUser: currentUser,          // Kept for backward compatibility with your rendering
        messages: [], 
        date: "Today"
      };
      setConversations([newChatThread, ...conversations]);
    }
    
    setActiveChatId(item.id);
    setCurrentScreen('conversations');
  };

  const handleSendMockReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setConversations(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, { sender: currentUser, text: replyText, time: "Just Now" }]
        };
      }
      return chat;
    }));
    setReplyText('');
  };

  const handleDeleteConversation = (e, chatId) => {
    e.stopPropagation(); // Prevents clicking the delete button from selecting the chat
    if (window.confirm("Are you sure you want to delete this conversation history?")) {
      setConversations(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    }
  };

  const activeChat = conversations.find(c => c.id === activeChatId);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#26192b', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: '#26192b', margin: '0 0 10px 0' }}>Wardrobe Ecosystem</h2>
          <p style={{ color: '#51588c', fontSize: '14px', margin: '0 0 30px 0' }}>Choose a profile to demo sorting, listing segmentation, and personalized marketplace feeds.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
            <button 
              onClick={() => setCurrentUser('user 372')}
              style={{ padding: '14px', borderRadius: '8px', border: currentUser === 'user 372' ? '3px solid #c46fb2' : '2px solid #e1c2eb', backgroundColor: currentUser === 'user 372' ? '#faf2fc' : '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              <div style={{ color: '#26192b' }}>👤 User 372 (Primary Profile)</div>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates managing your core capsule wardrobe system.</div>
            </button>

            <button 
              onClick={() => setCurrentUser('user_877')}
              style={{ padding: '14px', borderRadius: '8px', border: currentUser === 'user_877' ? '3px solid #c46fb2' : '2px solid #e1c2eb', backgroundColor: currentUser === 'user_877' ? '#faf2fc' : '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              <div style={{ color: '#26192b' }}>👤 User_877 (Neighbor Profile)</div>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates a community neighbor viewing items for sale.</div>
            </button>

            {/* --- ADDED USER 222 OPTION --- */}
            <button 
              onClick={() => setCurrentUser('user 222')}
              style={{ padding: '14px', borderRadius: '8px', border: currentUser === 'user 222' ? '3px solid #c46fb2' : '2px solid #e1c2eb', backgroundColor: currentUser === 'user 222' ? '#faf2fc' : '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              <div style={{ color: '#26192b' }}>👤 User 222 (Third Profile)</div>
              <div style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginTop: '3px' }}>Simulates a second distinct neighborhood buyer or seller.</div>
            </button>
          </div>

          <button 
            onClick={() => setIsAuthenticated(true)}
            style={{ width: '100%', padding: '12px', background: '#26192b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Enter Sandbox Environment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#e1c2eb' }}>
      
      {/* SIDEBAR NAVIGATION */}
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
            <button onClick={() => { setIsAuthenticated(false); setCurrentScreen('closet'); }} style={{ background: 'none', border: 'none', color: '#ff7675', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline', textAlign: 'left' }}>Exit Sandbox</button>
          </div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '10px 0 4px 0' }}>Personal Capsule</div>
          <button onClick={() => setCurrentScreen('closet')} style={{ padding: '10px', background: currentScreen === 'closet' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>My Closet</button>
          <button onClick={() => setCurrentScreen('stats')} style={{ padding: '10px', background: currentScreen === 'stats' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>My Stats</button>
          <button onClick={() => { 
            const filteredLog = items.filter(item => item.lastWorn && (!item.user || item.user === currentUser));
            setRecentlyWornItems(filteredLog);
            setCurrentScreen('recentlyWorn');
          }} style={{ padding: '10px', background: currentScreen === 'recentlyWorn' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>Recently Worn</button>

          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 'bold', margin: '15px 0 4px 0' }}>Marketplace Feed</div>
          <button onClick={() => setCurrentScreen('garageSale')} style={{ padding: '10px', background: currentScreen === 'garageSale' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>Garage Sale Feed</button>
          <button onClick={() => setCurrentScreen('myListings')} style={{ padding: '10px', background: currentScreen === 'myListings' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>My Listings</button>
          <button onClick={() => setCurrentScreen('neighborhood')} style={{ padding: '10px', background: currentScreen === 'neighborhood' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px' }}>My Neighborhood</button>
          <button onClick={() => setCurrentScreen('conversations')} style={{ padding: '10px', background: currentScreen === 'conversations' ? '#c46fb2' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Conversations</span>
            <span style={{ background: '#ff7675', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', color: 'white' }}>
              {conversations.filter(chat => chat.buyer === currentUser || chat.seller === currentUser).length}
            </span>
          </button>
        </nav>
      </div>

      {/* MAIN VIEW */}
      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        {error && <div style={{ background: '#ff7675', color: 'white', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>{error}</div>}

        {/* --- MY CLOSET VIEW --- */}
        {currentScreen === 'closet' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1 style={{ color: '#26192b', margin: 0 }}>My Closet Setup ({currentUser})</h1>
              <button onClick={() => setIsModalOpen(true)} style={{ padding: '10px 20px', background: '#26192b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '6px' }}>+ Add Item</button>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              <div style={{ width: '230px', backgroundColor: '#ffffff', border: '3px solid #26192b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontFamily: 'monospace', fontSize: '22px' }}>Sort by</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'cost'} onClick={() => handleSortRadioClick('cost')} onChange={()=>{}} /> cost</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'frequency'} onClick={() => handleSortRadioClick('frequency')} onChange={()=>{}} /> frequency</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'material'} onClick={() => handleSortRadioClick('material')} onChange={()=>{}} /> material</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', cursor: 'pointer' }}><input type="radio" checked={sortByOption === 'toGo'} onClick={() => handleSortRadioClick('toGo')} onChange={()=>{}} /> Marked to Go</label>

                <div style={{ marginTop: '10px', borderTop: '2px dashed #e1c2eb', paddingTop: '15px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Filter by Tag:</label>
                  <input type="text" placeholder="User input tag..." value={tagSearchInput} onChange={(e) => setTagSearchInput(e.target.value)} style={{ width: '100%', padding: '6px', border: '2px solid #26192b', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {getProcessedClosetItems().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
                    <h3 style={{ color: '#26192b' }}>This user's capsule is empty!</h3>
                    <p style={{ color: '#51588c' }}>Click "+ Add Item" at the top right to populate pieces into this specific profile.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    {getProcessedClosetItems().map(item => {
                      const isHovered = hoveredItemId === item.id;
                      return (
                        <div 
                          key={item.id} 
                          onMouseEnter={() => setHoveredItemId(item.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          style={{ border: '1px solid #51588c', borderRadius: '12px', backgroundColor: item.toGo ? '#51588c' : '#c46fb2', color: item.toGo ? 'white' : '#26192b', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '280px' }}
                        >
                          {item.image ? (
                            <div style={{ width: '100%', height: '180px', backgroundColor: '#fff' }}>
                              <img src={item.image} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '100%', height: '180px', backgroundColor: '#eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>No Photo</div>
                          )}

                          {isHovered && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
                              <button onClick={(e) => handleIncrementFrequency(e, item)} style={{ background: '#26192b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>＋ Wear</button>
                              <button onClick={(e) => handleToggleListingForSale(e, item)} style={{ background: item.forSale ? '#e84118' : '#4cd137', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                {item.forSale ? '🏷️ Delist' : '🏷️ Sell'}
                              </button>
                              <button onClick={(e) => handleDeleteItem(e, item.id)} style={{ background: '#ff7675', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>✕ Delete</button>
                            </div>
                          )}

                          <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
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
                            </div>
                            {isHovered && (
                              <button onClick={(e) => handleToggleMarkToGo(e, item)} style={{ marginTop: '12px', padding: '6px', background: item.toGo ? '#c46fb2' : '#26192b', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>
                                {item.toGo ? "Return to Closet" : "Marked to Go"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- GARAGE SALE FEED VIEW (ALL PUBLIC LISTINGS) --- */}
        {currentScreen === 'garageSale' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ color: '#26192b', margin: 0 }}>Community Garage Sale</h1>
              <p style={{ color: '#51588c', marginTop: '3px' }}>Bargains straight out of neighborhood closets.</p>
            </div>
            {items.filter(item => item.forSale).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
                <h3 style={{ color: '#26192b' }}>The feed is currently empty!</h3>
                <p style={{ color: '#51588c' }}>Go to "My Closet", hover over an item, and click "🏷️ Sell" to list something.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {items.filter(item => item.forSale).map(item => (
                  <div key={item.id} style={{ border: '1px solid #51588c', borderRadius: '12px', backgroundColor: '#ffffff', color: '#26192b', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#26192b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>Size: {item.size || 'M'}</div>
                    {item.image ? (
                      <div style={{ width: '100%', height: '180px', backgroundColor: '#fff' }}><img src={item.image} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    ) : (
                      <div style={{ width: '100%', height: '180px', backgroundColor: '#eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>No Photo</div>
                    )}
                    <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize', fontSize: '18px', fontWeight: 'bold' }}>{item.itemName}</h4>
                          <span style={{ color: '#c46fb2', fontWeight: 'bold', fontSize: '18px' }}>${item.sellingPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                        <p style={{ margin: '2px 0', fontSize: '13px', color: '#666' }}><strong>Material:</strong> {item.material}</p>
                        <p style={{ margin: '2px 0', fontSize: '11px', color: '#999' }}>Listed by: {item.user === currentUser ? 'You' : item.user || 'Unknown'}</p>
                      </div>
                      {item.user === currentUser ? (
                        <button onClick={(e) => handleToggleListingForSale(e, item)} style={{ marginTop: '12px', padding: '8px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Remove My Listing</button>
                      ) : (
                        <button onClick={() => handleContactSeller(item)} style={{ marginTop: '12px', padding: '8px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Contact Seller</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- MY LISTINGS VIEW --- */}
        {currentScreen === 'myListings' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ color: '#26192b', margin: 0 }}>My Active Marketplace Listings</h1>
              <p style={{ color: '#51588c', marginTop: '3px' }}>Items that you ({currentUser}) have listed for sale.</p>
            </div>
            {items.filter(item => item.forSale && item.user === currentUser).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
                <h3 style={{ color: '#26192b' }}>You aren't selling anything right now.</h3>
                <p style={{ color: '#51588c' }}>Head back to "My Closet", hover over an item, and click the "🏷️ Sell" button to create a public listing.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {items.filter(item => item.forSale && item.user === currentUser).map(item => (
                  <div key={item.id} style={{ border: '1px solid #51588c', borderRadius: '12px', backgroundColor: '#ffffff', color: '#26192b', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '280px' }}>
                    {item.image ? (
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#fff' }}><img src={item.image} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    ) : (
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>No Photo</div>
                    )}
                    <div style={{ padding: '15px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize', fontSize: '18px' }}>{item.itemName}</h4>
                        <p style={{ margin: '2px 0', fontSize: '14px', color: '#c46fb2', fontWeight: 'bold' }}>Listed Price: ${item.sellingPrice?.toFixed(2)}</p>
                        <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Size: {item.size || 'M'} | Material: {item.material}</p>
                      </div>
                      <button onClick={(e) => handleToggleListingForSale(e, item)} style={{ marginTop: '12px', padding: '8px', background: '#ff7675', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Cancel Listing & Delist</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- MY NEIGHBORHOOD VIEW --- */}
        {currentScreen === 'neighborhood' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ color: '#26192b', margin: 0 }}>My Neighborhood Closet Feed</h1>
              <p style={{ color: '#51588c', marginTop: '3px' }}>Items available exclusively from neighboring residents, excluding your own listings.</p>
            </div>
            {items.filter(item => item.forSale && item.user !== currentUser).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '12px' }}>
                <h3 style={{ color: '#26192b' }}>No active neighbor listings found.</h3>
                <p style={{ color: '#51588c' }}>Try swapping profiles via the sidebar dropdown to add clothing elements from another context!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {items.filter(item => item.forSale && item.user !== currentUser).map(item => (
                  <div key={item.id} style={{ border: '1px solid #51588c', borderRadius: '12px', backgroundColor: '#ffffff', color: '#26192b', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#26192b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 10 }}>Size: {item.size || 'M'}</div>
                    {item.image ? (
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#fff' }}><img src={item.image} alt={item.itemName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    ) : (
                      <div style={{ width: '100%', height: '160px', backgroundColor: '#eaeaea', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>No Photo</div>
                    )}
                    <div style={{ padding: '15px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h4 style={{ margin: '0 0 4px 0', textTransform: 'capitalize', fontSize: '17px', fontWeight: 'bold' }}>{item.itemName}</h4>
                          <span style={{ color: '#c46fb2', fontWeight: 'bold' }}>${item.sellingPrice?.toFixed(2)}</span>
                        </div>
                        <p style={{ margin: '2px 0', fontSize: '12px', color: '#666' }}>Owner Account: {item.user || 'Neighbor'}</p>
                      </div>
                      <button onClick={() => handleContactSeller(item)} style={{ marginTop: '12px', padding: '8px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', width: '100%' }}>Send Offer / Chat</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* --- CONVERSATIONS VIEW --- */}
        {currentScreen === 'conversations' && (
          <div>
            <h1 style={{ color: '#26192b', marginBottom: '10px' }}>Offers & Conversations Inbox</h1>
            <p style={{ color: '#51588c', marginBottom: '30px' }}>Negotiate pricing and arrange pickups with other neighborhood users.</p>
            
            <div style={{ display: 'flex', background: '#ffffff', borderRadius: '12px', border: '2px solid #26192b', minHeight: '400px', overflow: 'hidden' }}>
              <div style={{ width: '300px', borderRight: '2px solid #26192b', backgroundColor: '#faf8fc', display: 'flex', flexDirection: 'column' }}>
                {/* --- FILTERS SO USERS ONLY SEE CHATS THEY ARE INVOLVED IN --- */}
                {conversations.filter(chat => chat.buyer === currentUser || chat.seller === currentUser).length === 0 ? (
                  <div style={{ padding: '20px', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>No active chat history.</div>
                ) : (
                  conversations
                    .filter(chat => chat.buyer === currentUser || chat.seller === currentUser)
                    .map(chat => (
                      <div 
                        key={chat.id} 
                        onClick={() => setActiveChatId(chat.id)}
                        style={{ padding: '15px', borderBottom: '1px solid #e1c2eb', cursor: 'pointer', backgroundColor: activeChatId === chat.id ? '#e1c2eb' : 'transparent', transition: 'background 0.2s', textAlign: 'left', position: 'relative' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: '25px' }}>
                          {/* Shows the counterpart user's name in the sidebar title */}
                          <strong style={{ color: '#26192b' }}>
                            {chat.buyer === currentUser ? `To: ${chat.seller}` : `From: ${chat.buyer}`}
                          </strong>
                          <span style={{ fontSize: '11px', color: '#888' }}>{chat.date}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#51588c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '25px' }}>
                          Item: <strong>{chat.item}</strong> (${chat.itemPrice?.toFixed(2)})
                        </p>
                        
                        <button 
                          onClick={(e) => handleDeleteConversation(e, chat.id)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ff7675', fontSize: '16px', cursor: 'pointer', padding: '4px', fontWeight: 'bold' }}
                          title="Delete thread"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                {activeChat ? (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px' }}>
                    <div style={{ borderBottom: '2px dashed #e1c2eb', paddingBottom: '10px', marginBottom: '15px', textAlign: 'left' }}>
                      <h3 style={{ margin: 0, color: '#26192b' }}>Inquiry: {activeChat.item} — ${activeChat.itemPrice?.toFixed(2)}</h3>
                      <span style={{ fontSize: '13px', color: '#51588c' }}>Logged in as: <strong>{currentUser}</strong></span>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', marginBottom: '20px' }}>
                      {activeChat.messages.length === 0 ? (
                        <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>No messages sent yet. Start the conversation below!</div>
                      ) : (
                        activeChat.messages.map((msg, index) => {
                          const isMe = msg.sender === currentUser;
                          return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                              <div style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '500', maxWidth: '70%', backgroundColor: isMe ? '#c46fb2' : '#26192b', color: 'white', border: '1px solid #26192b', textAlign: 'left' }}>
                                {msg.text}
                              </div>
                              <span style={{ fontSize: '10px', color: '#999', marginTop: '3px' }}>{msg.sender} • {msg.time}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMockReply} style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder={`Type response message...`} value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '2px solid #26192b', outline: 'none' }} />
                      <button type="submit" style={{ padding: '0 20px', background: '#26192b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Send</button>
                    </form>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: '#888', fontStyle: 'italic' }}>
                    Select an active conversation item from the sidebar column to view details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- STATS VIEW --- */}
        {currentScreen === 'stats' && (
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
        )}

        {/* --- RECENT LOGS --- */}
        {currentScreen === 'recentlyWorn' && (
          <div>
            <h1 style={{ color: '#26192b', marginBottom: '30px' }}>Recently Worn Usage Logs ({currentUser})</h1>
            {recentlyWornItems.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#51588c' }}>No wear logging updates registered for this user.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {recentlyWornItems.map(item => (
                  <div key={item.id} style={{ border: '1px solid #26192b', padding: '20px', borderRadius: '12px', backgroundColor: '#26192b', color: 'white' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#e1c2eb' }}>{item.itemName}</h3>
                    <p><strong>Log Tracking Checkpoint:</strong> {item.lastWorn}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(38, 25, 43, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#26192b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#bac7fb', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            <h3 style={{ marginTop: '0', marginBottom: '20px', color: '#e1c2eb' }}>Add New Wardrobe Item</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}><input type="text" placeholder="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '12px' }}>
                <select value={clothingType} onChange={e => setClothingType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box', height: '40px' }}>
                  <option value="Shirt">Shirt</option><option value="Pants">Pants</option><option value="Dresses">Dresses</option><option value="Accessory">Accessory</option><option value="Outerwear">Outerwear</option><option value="Misc">Misc</option>
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}><input type="text" placeholder="Material" value={material} onChange={e => setMaterial(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} /></div>
              <div style={{ marginBottom: '12px' }}><input type="number" step="0.01" placeholder="Cost ($)" value={cost} onChange={e => setCost(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} /></div>
              
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
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', color: '#e1c2eb', fontSize: '13px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}><input type="text" placeholder="Tags (comma separated)" value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: '#e1c2eb', boxSizing: 'border-box' }} /></div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 15px', background: '#51588c', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#c46fb2', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Add to Closet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
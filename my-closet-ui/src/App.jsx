import { useState, useEffect } from 'react';
import wardrobeApi from './api/wardrobeApi';
import Sidebar from './components/Sidebar';
import AddItemModal from './components/AddItemModal';
import LoginScreen from './screens/LoginScreen';
import InviteCodeScreen from './screens/InviteCodeScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import AdminReviewScreen from './screens/AdminReviewScreen';
import ClosetScreen from './screens/ClosetScreen';
import GarageSaleScreen from './screens/GarageSaleScreen';
import MyListingsScreen from './screens/MyListingsScreen';
import NeighborhoodScreen from './screens/NeighborhoodScreen';
import ConversationsScreen from './screens/ConversationsScreen';
import StatsScreen from './screens/StatsScreen';
import RecentlyWornScreen from './screens/RecentlyWornScreen';
import ShareInviteModal from './components/ShareInviteModal';

function App() {
  // --- Auth flow state with Session Persistence ---
  const [loggedInUser, setLoggedInUser] = useState(() => {
    const savedUser = localStorage.getItem('wardrobe_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authStage, setAuthStage] = useState(() => {
    const savedUser = localStorage.getItem('wardrobe_user');
    return savedUser ? 'app' : 'login';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('wardrobe_user');
    return savedUser ? JSON.parse(savedUser).username : 'jyoti';
  });

  const [pendingInviteCode, setPendingInviteCode] = useState('');

  // Core App Navigation & Sync State
  const [currentScreen, setCurrentScreen] = useState('closet');
  const [items, setItems] = useState([]);
  const [recentlyWornItems, setRecentlyWornItems] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form input states
  const [itemName, setItemName] = useState('');
  const [clothingType, setClothingType] = useState('Shirt');
  const [material, setMaterial] = useState('');
  const [cost, setCost] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Sidebar Filtering & Sorting control states
  const [sortByOption, setSortByOption] = useState('');
  const [tagSearchInput, setTagSearchInput] = useState('');

  const [isForSale, setIsForSale] = useState(false);
  const [sellingPrice, setSellingPrice] = useState('');
  const [size, setSize] = useState('');

  // Conversations / chat inbox state
  const [conversations, setConversations] = useState(() => {
    const savedChats = localStorage.getItem('wardrobe_conversations');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync auth state to localStorage
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('wardrobe_user', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('wardrobe_user');
    }
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('wardrobe_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (authStage === 'app') {
      fetchItems();
    }
  }, [authStage]);

  const fetchItems = () => {
    wardrobeApi.getAll()
      .then(response => setItems(response.data))
      .catch(() => setError('Failed to fetch wardrobe items. Ensure your backend is running.'));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image file for the clothing item.');
      return;
    }

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('clothingType', clothingType);
    formData.append('material', material);
    formData.append('cost', cost ? parseFloat(cost) : 0.0);
    formData.append('isForSale', isForSale);
    formData.append('sellingPrice', isForSale && sellingPrice ? parseFloat(sellingPrice) : 0.0);
    formData.append('size', size);
    formData.append('user', currentUser);
    formData.append('image', selectedFile);

    if (tagsInput) {
      formData.append('tags', tagsInput);
    }

    wardrobeApi.addItemWithPhoto(formData)
      .then(response => {
        setItems(prev => [...prev, response.data]);
        setItemName(''); setClothingType('Shirt'); setMaterial(''); setCost(''); setTagsInput('');
        setSelectedFile(null);
        setIsForSale(false); setSellingPrice(''); setSize('');
        setIsModalOpen(false);
        setError(null);
        fetchItems();
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to save new clothing item.');
      });
  };

  const handleIncrementFrequency = (e, item) => {
    e.stopPropagation();
    wardrobeApi.wearItem(item.id)
      .then(response => {
        setItems(prev => prev.map(i => i.id === item.id ? response.data : i));
      })
      .catch(() => setError('Could not update wear logs.'));
  };

  const handleToggleMarkToGo = (e, item) => {
    e.stopPropagation();
    const request = item.toGo ? wardrobeApi.markNotToGo(item.id) : wardrobeApi.markToGo(item.id);
    request
      .then(response => {
        setItems(prev => prev.map(i => i.id === item.id ? response.data : i));
      })
      .catch(() => setError('Failed to update item status.'));
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this piece from your wardrobe registry?')) {
      wardrobeApi.deleteItem(id)
        .then(() => {
          setItems(prev => prev.filter(item => item.id !== id));
        })
        .catch(() => setError('Could not successfully delete requested component.'));
    }
  };

  const handleSortRadioClick = (value) => {
    setSortByOption(sortByOption === value ? '' : value);
  };

  const handleToggleListingForSale = (e, item) => {
    e.stopPropagation();
    const targetSaleState = !item.forSale;

    let targetPrice = item.sellingPrice || 0.0;
    let targetSize = item.size || 'M';

    if (targetSaleState) {
      const priceInput = window.prompt('Enter selling price ($):', '15.00');
      const sizeInput = window.prompt('Enter clothing size (e.g., S, M, L):', 'M');
      if (priceInput === null || sizeInput === null) return;
      targetPrice = parseFloat(priceInput) || 0.0;
      targetSize = sizeInput;
    }

    wardrobeApi.toggleSale(item.id, { price: targetPrice, size: targetSize, user: currentUser })
      .then(response => {
        setItems(prev => prev.map(i => i.id === item.id ? response.data : i));
      })
      .catch(() => setError('Could not update marketplace listing registry target.'));
  };

  const handleContactSeller = (item) => {
    const threadId = `${item.id}_${currentUser}`;
    const existingChat = conversations.find(c => c.id === threadId);

    if (!existingChat) {
      const newChatThread = {
        id: threadId,
        itemId: item.id,
        item: item.itemName,
        itemPrice: item.sellingPrice || 0.0,
        buyer: currentUser,
        seller: item.user || 'Unknown Neighbor',
        fromUser: currentUser,
        messages: [],
        date: 'Today',
      };

      setConversations(prev => [newChatThread, ...prev]);
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
          messages: [...chat.messages, { sender: currentUser, text: replyText, time: 'Just Now' }],
        };
      }
      return chat;
    }));
    setReplyText('');
  };

  const handleDeleteConversation = (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation history?')) {
      setConversations(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    }
  };

  const handleOpenRecentlyWorn = () => {
    const filteredLog = items.filter(item => item.lastWorn && (!item.user || item.user === currentUser));
    setRecentlyWornItems(filteredLog);
    setCurrentScreen('recentlyWorn');
  };

  const handleExit = () => {
    localStorage.removeItem('wardrobe_user');
    setLoggedInUser(null);
    setAuthStage('login');
    setCurrentScreen('closet');
  };

  const handleLogout = () => {
    // 1. Purge stored session
    localStorage.removeItem('wardrobe_user');
    
    // 2. Clear state variables
    setLoggedInUser(null);
    setCurrentUser('');
    setAuthStage('login');
    setCurrentScreen('closet');
  };


  const conversationCount = conversations.filter(chat => chat.buyer === currentUser || chat.seller === currentUser).length;

  // --- Auth stage routing ---
  if (authStage === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setLoggedInUser(user);
          setCurrentUser(user.username);
          setAuthStage('app');
        }}
        onCreateAccount={() => setAuthStage('invite')}
      />
    );
  }

  if (authStage === 'invite') {
    return (
      <InviteCodeScreen
        onValid={(code) => {
          setPendingInviteCode(code);
          setAuthStage('signup');
        }}
      />
    );
  }

  if (authStage === 'signup') {
    return (
      <CreateAccountScreen
        inviteCode={pendingInviteCode}
        onSubmitted={() => setAuthStage('pending')}
      />
    );
  }

  if (authStage === 'pending') {
    return <PendingApprovalScreen />;
  }

  if (authStage === 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#26192b' }}>
        <div style={{ padding: '20px 40px 0' }}>
          <button
            onClick={() => setAuthStage('app')}
            style={{ padding: '8px 16px', background: 'transparent', color: '#fff', border: '2px solid #fff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
          >
            ← Back to Wardrobe
          </button>
        </div>
        <AdminReviewScreen />
      </div>
    );
  }

  // authStage === 'app' — main wardrobe UI
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#e1c2eb' }}>
      <Sidebar
        currentUser={currentUser}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        conversationCount={conversationCount}
        onOpenRecentlyWorn={handleOpenRecentlyWorn}
        isAdmin={loggedInUser?.role === 'ADMIN'}
        onOpenAdmin={() => setAuthStage('admin')}
        onOpenShareInvite={() => setIsShareModalOpen(true)}
        onLogout={handleLogout}
        
      />

      <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        {error && <div style={{ background: '#ff7675', color: 'white', padding: '12px', marginBottom: '20px', borderRadius: '6px' }}>{error}</div>}

        {currentScreen === 'closet' && (
          <ClosetScreen
            currentUser={currentUser}
            items={items}
            sortByOption={sortByOption}
            onSortRadioClick={handleSortRadioClick}
            tagSearchInput={tagSearchInput}
            setTagSearchInput={setTagSearchInput}
            onOpenModal={() => setIsModalOpen(true)}
            onWear={handleIncrementFrequency}
            onToggleMarkToGo={handleToggleMarkToGo}
            onDelete={handleDeleteItem}
            onToggleSale={handleToggleListingForSale}
          />
        )}

        {currentScreen === 'garageSale' && (
          <GarageSaleScreen
            items={items}
            currentUser={currentUser}
            onToggleSale={handleToggleListingForSale}
            onContactSeller={handleContactSeller}
          />
        )}

        {currentScreen === 'myListings' && (
          <MyListingsScreen
            items={items}
            currentUser={currentUser}
            onToggleSale={handleToggleListingForSale}
          />
        )}

        {currentScreen === 'neighborhood' && (
          <NeighborhoodScreen
            items={items}
            currentUser={currentUser}
            onContactSeller={handleContactSeller}
          />
        )}

        {currentScreen === 'conversations' && (
          <ConversationsScreen
            currentUser={currentUser}
            conversations={conversations}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            onDeleteConversation={handleDeleteConversation}
            replyText={replyText}
            setReplyText={setReplyText}
            onSendReply={handleSendMockReply}
          />
        )}

        {currentScreen === 'stats' && (
          <StatsScreen items={items} currentUser={currentUser} />
        )}

        {currentScreen === 'recentlyWorn' && (
          <RecentlyWornScreen currentUser={currentUser} recentlyWornItems={recentlyWornItems} />
        )}
      

        {currentScreen === 'admin' && (
          loggedInUser?.role === 'ADMIN' ? (
            <AdminReviewScreen />
          ) : (
            <div style={{ color: '#ff7675' }}>Access Denied: Admin Privileges Required</div>
          )
        )}
      </div>

      {isModalOpen && (
        <AddItemModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          itemName={itemName} setItemName={setItemName}
          clothingType={clothingType} setClothingType={setClothingType}
          material={material} setMaterial={setMaterial}
          cost={cost} setCost={setCost}
          isForSale={isForSale} setIsForSale={setIsForSale}
          sellingPrice={sellingPrice} setSellingPrice={setSellingPrice}
          size={size} setSize={setSize}
          onImageChange={handleImageChange}
          tagsInput={tagsInput} setTagsInput={setTagsInput}
        />
      )}
      {isShareModalOpen && (
        <ShareInviteModal onClose={() => setIsShareModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
import { useState, useEffect } from 'react';
import wardrobeApi from './api/wardrobeApi';
import Sidebar from './components/Sidebar';
import AddItemModal from './components/AddItemModal';
import LoginScreen from './screens/LoginScreen';
import ClosetScreen from './screens/ClosetScreen';
import GarageSaleScreen from './screens/GarageSaleScreen';
import MyListingsScreen from './screens/MyListingsScreen';
import NeighborhoodScreen from './screens/NeighborhoodScreen';
import ConversationsScreen from './screens/ConversationsScreen';
import StatsScreen from './screens/StatsScreen';
import RecentlyWornScreen from './screens/RecentlyWornScreen';

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

  // Conversations / chat inbox state (persisted to localStorage — see known limitation
  // in the structural review: this doesn't sync across devices/users via the backend)
  const [conversations, setConversations] = useState(() => {
    const savedChats = localStorage.getItem('wardrobe_conversations');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    localStorage.setItem('wardrobe_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  const fetchItems = () => {
    wardrobeApi.getAll()
      .then(response => setItems(response.data))
      .catch(() => setError('Failed to fetch wardrobe items. Ensure your backend is running.'));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageString(reader.result);
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
      size: isForSale ? size : '',
    };

    wardrobeApi.addItem(newItem)
      .then(response => {
        setItems(prev => [...prev, response.data]);
        setItemName(''); setClothingType('Shirt'); setMaterial(''); setCost(''); setTagsInput(''); setImageString('');
        setIsForSale(false); setSellingPrice(''); setSize('');
        setIsModalOpen(false);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to save new clothing item.'));
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
    const existingChat = conversations.find(c => c.id === item.id);

    if (!existingChat) {
      const newChatThread = {
        id: item.id,
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

  const conversationCount = conversations.filter(chat => chat.buyer === currentUser || chat.seller === currentUser).length;

  if (!isAuthenticated) {
    return (
      <LoginScreen
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onEnter={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#e1c2eb' }}>
      <Sidebar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        conversationCount={conversationCount}
        onExit={() => { setIsAuthenticated(false); setCurrentScreen('closet'); }}
        onOpenRecentlyWorn={handleOpenRecentlyWorn}
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
    </div>
  );
}

export default App;
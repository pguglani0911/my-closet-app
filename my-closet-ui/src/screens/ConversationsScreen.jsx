function ConversationsScreen({
  currentUser,
  conversations,
  activeChatId,
  setActiveChatId,
  onDeleteConversation,
  replyText,
  setReplyText,
  onSendReply,
}) {
  const myConversations = conversations.filter(chat => chat.buyer === currentUser || chat.seller === currentUser);
  const activeChat = conversations.find(c => c.id === activeChatId);

  return (
    <div>
      <h1 style={{ color: '#26192b', marginBottom: '10px' }}>Offers & Conversations Inbox</h1>
      <p style={{ color: '#51588c', marginBottom: '30px' }}>Negotiate pricing and arrange pickups with other neighborhood users.</p>

      <div style={{ display: 'flex', background: '#ffffff', borderRadius: '12px', border: '2px solid #26192b', minHeight: '400px', overflow: 'hidden' }}>
        <div style={{ width: '300px', borderRight: '2px solid #26192b', backgroundColor: '#faf8fc', display: 'flex', flexDirection: 'column' }}>
          {myConversations.length === 0 ? (
            <div style={{ padding: '20px', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>No active chat history.</div>
          ) : (
            myConversations.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                style={{ padding: '15px', borderBottom: '1px solid #e1c2eb', cursor: 'pointer', backgroundColor: activeChatId === chat.id ? '#e1c2eb' : 'transparent', transition: 'background 0.2s', textAlign: 'left', position: 'relative' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingRight: '25px' }}>
                  <strong style={{ color: '#26192b' }}>
                    {chat.buyer === currentUser ? `To: ${chat.seller}` : `From: ${chat.buyer}`}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#888' }}>{chat.date}</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#51588c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '25px' }}>
                  Item: <strong>{chat.item}</strong> (${chat.itemPrice?.toFixed(2)})
                </p>

                <button
                  onClick={(e) => onDeleteConversation(e, chat.id)}
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

              <form onSubmit={onSendReply} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Type response message..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '2px solid #26192b', outline: 'none' }} />
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
  );
}

export default ConversationsScreen;
import { useState } from 'react';

const DirectMessageComponent = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const conversations = new Array(8).fill(null).map((_, idx) => ({
    id: idx,
    name: `User ${idx + 1}`,
    preview: 'This is a message preview...',
  }));

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '90%',
        minHeight: '85vh',
        margin: '0 auto',
        color: 'white',
      }}
    >
      <h2
        style={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          marginBottom: '20px',
        }}
      >
        Direct Messages
      </h2>

      <div style={{ display: 'flex', height: '100%' }}>
        {/* Left: Message list */}
        <div
          style={{
            width: '30%',
            borderRight: '1px solid #2c3e50',
            paddingRight: '10px',
            overflowY: 'auto',
          }}
        >
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              style={{
                padding: '12px',
                borderBottom: '1px solid #2c3e50',
                cursor: 'pointer',
                backgroundColor:
                  selectedChat === conv.id ? '#2c3e50' : 'transparent',
              }}
            >
              <strong>{conv.name}</strong>
              <p
                style={{ fontSize: '0.85rem', marginTop: '5px', color: '#ccc' }}
              >
                {conv.preview}
              </p>
            </div>
          ))}
        </div>

        {/* Right: Chat content */}
        <div style={{ width: '70%', padding: '0 15px' }}>
          {selectedChat !== null ? (
            <div>
              <h3 style={{ marginBottom: '10px' }}>
                Chat with {conversations[selectedChat].name}
              </h3>
              <div
                style={{
                  backgroundColor: '#2c3e50',
                  borderRadius: '8px',
                  padding: '20px',
                  minHeight: '60vh',
                }}
              >
                <p>This is where the full conversation would appear.</p>
              </div>
            </div>
          ) : (
            <div style={{ color: '#aaa', marginTop: '20px' }}>
              Select a conversation to view the chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessageComponent;

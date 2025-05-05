import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaSearch } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa6';
import { FaCircleMinus } from 'react-icons/fa6';
import { useAxios } from '../../hooks/useAxios';
import profilePicture from '../../assets/Profile-PNG.png';

const DirectMessageComponent = () => {
  interface SearchResult {
    profilePic: string;
    userId: string;
    username: string;
    onlineStatus: 'online' | 'offline';
  }

  interface Message {
    id: string;
    senderId: string;
    text: string;
    sentAt: string;
  }

  const userId = localStorage.getItem('userId');

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPartner, setChatPartner] = useState<SearchResult | null>(null);

  const [messageInput, setMessageInput] = useState('');
  const [existingChats, setExistingChats] = useState<SearchResult[]>([]);

  const [search, setSearch] = useState('');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const startChat = async (user1Id: string, user2Id: string) => {
    const response = await useAxios.post('/message/start-chat', {
      user1Id,
      user2Id,
    });
    return response.data.chatId;
  };

  const sendMessage = async (
    chatId: string,
    senderId: string,
    text: string
  ) => {
    await useAxios.post('/message/send-message', {
      chatId,
      senderId,
      text,
    });
  };

  const fetchMessages = async (chatId: string) => {
    const response = await useAxios.get(`/message/messages/${chatId}`);
    return response.data.data;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search.trim()) {
      toast.error('Please enter something to search!');
      setShowDropdown(false);
      return;
    }

    const searchType = 'username';
    const searchQuery = search.trim();

    try {
      const response = await useAxios.get(`search/${searchType}`, {
        params: { query: searchQuery },
      });

      const fetched = response.data.data;
      setSearchResults(fetched);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search!');
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      if (!chatId) return;
      try {
        const loadedMessages = await fetchMessages(chatId);
        setMessages(loadedMessages);
      } catch (err) {
        console.error('Failed to fetch messages', err);
        toast.error('Error loading messages');
      }
    };

    loadMessages();
  }, [chatId]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;

      try {
        const res = await useAxios.get(`/message/chats/${userId}`);
        setExistingChats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch chats', err);
      }
    };

    fetchChats();
  }, [userId]);

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

      <div className="align-items-center" style={{ position: 'relative' }}>
        <form
          onSubmit={handleSubmit}
          style={{ width: '30%', marginBottom: 10 }}
        >
          <div className="input-group">
            <span className="input-group-text bg-light border-0 ">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 bg-light"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {showDropdown && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '5px',
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              width: '30% ',
              zIndex: 1000,
              padding: '10px',
            }}
          >
            {searchResults.map((result) => (
              <span
                key={result.userId}
                onClick={async () => {
                  try {
                    if (!userId) {
                      toast.error('User not logged in');
                      return;
                    }

                    const newChatId = await startChat(userId, result.userId);
                    const loadedMessages = await fetchMessages(newChatId);

                    setChatId(newChatId);
                    setMessages(loadedMessages);
                    setChatPartner(result);
                    setShowDropdown(false);
                    setSearch('');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to start chat');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#333',
                  borderBottom: '1px solid #ccc',
                }}
              >
                <img
                  src={result.profilePic || profilePicture}
                  alt="Profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'black' }}>
                    {result.username}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: result.onlineStatus === 'online' ? 'green' : 'red',
                    }}
                  >
                    {result.onlineStatus}
                  </span>
                </div>
              </span>
            ))}
          </div>
        )}
      </div>

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
          {existingChats.map((partner, index) => (
            <div
              key={partner.userId}
              onClick={async () => {
                try {
                  const generatedChatId =
                    userId && userId < partner.userId
                      ? `${userId}_${partner.userId}`
                      : `${partner.userId}_${userId}`;

                  setChatId(generatedChatId);
                  setChatPartner(partner);
                  setSelectedChat(index);

                  const loadedMessages = await fetchMessages(generatedChatId);
                  setMessages(loadedMessages);
                } catch (err) {
                  toast.error('Failed to load chat');
                  console.error(err);
                }
              }}
              style={{
                padding: '12px',
                borderBottom: '1px solid #2c3e50',
                cursor: 'pointer',
                backgroundColor:
                  selectedChat === index ? '#2c3e50' : 'transparent',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <h2
                  style={{
                    color: 'white',
                    fontSize: '0.9rem',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {partner.username}
                  {partner.onlineStatus === 'online' ? (
                    <FaCircle
                      style={{ color: 'limegreen', fontSize: '0.6rem' }}
                    />
                  ) : (
                    <FaCircleMinus
                      style={{ color: 'red', fontSize: '0.65rem' }}
                    />
                  )}
                </h2>
              </div>
              <p
                style={{ fontSize: '0.85rem', marginTop: '5px', color: '#ccc' }}
              >
                Click to open chat
              </p>
            </div>
          ))}
        </div>

        {/* Right: Chat content */}
        <div style={{ width: '70%', padding: '0 15px' }}>
          <div>
            <h3 style={{ marginBottom: '10px' }}>
              Chat with {chatPartner?.username}
            </h3>
            <div
              style={{
                backgroundColor: '#2c3e50',
                borderRadius: '8px',
                padding: '20px',
                minHeight: '50vh',
                maxHeight: '50vh',
                overflowY: 'auto',
                marginBottom: '10px',
              }}
            >
              {messages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <strong>
                    {msg.senderId === userId ? 'You' : chatPartner?.username}:
                  </strong>{' '}
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!chatId || !userId || !messageInput.trim()) return;

                try {
                  await sendMessage(chatId, userId, messageInput.trim());
                  const updatedMessages = await fetchMessages(chatId);
                  setMessages(updatedMessages);
                  setMessageInput('');
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to send message');
                }
              }}
              style={{ display: 'flex', gap: '10px' }}
            >
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  color: 'black',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectMessageComponent;

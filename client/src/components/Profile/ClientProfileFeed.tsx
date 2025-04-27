import { useState, useEffect } from 'react';
import { useAxios } from '../../hooks/useAxios';
import profilePicture from '../../assets/Profile-PNG.png';
import { FaCircle, FaCircleMinus } from 'react-icons/fa6';
import { useFriend } from '../../context/PublicProfileContext';
import { useNavigate } from 'react-router-dom';

interface FriendsProps {
  userId: string;
  bio: string;
  username: string;
  profilePictureUrl: string;
  onlineStatus: 'online' | 'offline';
}

interface FriendReqProps {
  reqId: string;
  requestorId: string;
  requestorUsername: string;
  createdAt: { seconds: number; nanoseconds: number };
  status: string;
}

const ProfileFeed = () => {
  const userId = localStorage.getItem('userId');
  const friendContext = useFriend();
  const navigate = useNavigate();
  const profileImage = profilePicture;

  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');
  const [, setIsLoading] = useState(false);

  const [friends, setFriends] = useState<FriendsProps[]>([]);
  const [friendReq, setFriendReq] = useState<FriendReqProps[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        const response = await useAxios.get(`social/friends/${userId}`);
        const fetchInfo: FriendsProps[] = response.data.data;
        setFriends(fetchInfo);

        if (friendContext && fetchInfo.length > 0) {
          friendContext.setUserId(fetchInfo[0].userId);
          friendContext.setUsername(fetchInfo[0].username);
          friendContext.setUserBio(fetchInfo[0].bio);
          friendContext.setUserStatus(fetchInfo[0].onlineStatus);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFriendReq = async () => {
      try {
        setIsLoading(true);
        const response = await useAxios.get(`social/requests/${userId}`);
        const fetchInfo: FriendReqProps[] = response.data.data;
        setFriendReq(fetchInfo);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchFriends();
      fetchFriendReq();
    }
  }, [userId, friendContext]);

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '100%',
        minHeight: '65vh',
        margin: '0 auto',
      }}
    >
      {/* Header and Tab Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            margin: 0,
          }}
        >
          {activeTab === 'library' ? 'My Game Library' : 'Friends'}
        </h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              backgroundColor: activeTab === 'library' ? '#0076ff' : '#2c3e50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('library')}
          >
            My Game Library
          </button>
          <button
            style={{
              backgroundColor: activeTab === 'friends' ? '#0076ff' : '#2c3e50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginTop: '20px', color: 'white' }}>
        {activeTab === 'library' ? (
          <div>
            <p>My Game Library (content coming soon...)</p>
          </div>
        ) : (
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px',
              backgroundColor: '#1b2838',
              borderRadius: '10px',
            }}
          >
            <h3 style={{ marginTop: '30px', fontSize: '1.2rem' }}>
              Friend Requests
            </h3>
            {friendReq.length === 0 ? (
              <p>No pending requests.</p>
            ) : (
              friendReq.map((req) => (
                <div
                  key={req.reqId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: '1px solid #3a4a5a',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <img
                      src={profileImage}
                      alt="Avatar"
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {req.requestorUsername}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: 'lightgray',
                        }}
                      >
                        Requested on {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {friends.length === 0 ? (
              <p>No friends found.</p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    padding: '10px',
                    borderBottom: '1px solid #3a4a5a',
                  }}
                >
                  <img
                    src={profileImage}
                    alt="Avatar"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '20px',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <h3
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span
                        onClick={() =>
                          navigate('/user-profile', {
                            state: {
                              userId: friend.userId,
                              username: friend.username,
                              userBio: friend.bio,
                              userStatus: friend.onlineStatus,
                            },
                          })
                        }
                        style={{
                          color: 'white',
                          cursor: 'pointer',
                        }}
                      >
                        {friend.username}
                      </span>

                      {friend.onlineStatus === 'online' ? (
                        <FaCircle
                          style={{ color: 'limegreen', fontSize: '0.6rem' }}
                        />
                      ) : (
                        <FaCircleMinus
                          style={{ color: 'red', fontSize: '0.65rem' }}
                        />
                      )}
                    </h3>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFeed;

import { useState, useEffect } from 'react';
import { useAxios } from '../../hooks/useAxios';
import profilePicture from '../../assets/Profile-PNG.png';
import { FaCircle } from 'react-icons/fa6';
import { FaCircleMinus } from 'react-icons/fa6';
import { useFriend } from '../../context/PublicProfileContext';
import { Link } from 'react-router-dom';

interface FriendsProps {
  userId: string;
  bio: string;
  username: string;
  profilePictureUrl: string;
  onlineStatus: 'online' | 'offline';
}

const ProfileFeed = () => {
  const userId = localStorage.getItem('userId');
  const friendContext = useFriend();

  const profileImage = profilePicture;
  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');
  const [, setIsLoading] = useState(false);

  const [friends, setFriends] = useState<FriendsProps[]>([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        const response = await useAxios.get(`social/friends/${userId}`);
        const fetchInfo: FriendsProps[] = response.data.data;

        setFriends(fetchInfo);

        if (friendContext?.setUsername) {
          if (fetchInfo.length > 0) {
            friendContext.setUsername(fetchInfo[0].username);
          }
        }

        if (friendContext?.setUserBio) {
          if (fetchInfo.length > 0) {
            friendContext.setUserBio(fetchInfo[0].bio);
          }
        }

        if (friendContext?.setUserStatus) {
          if (fetchInfo.length > 0) {
            friendContext.setUserStatus(fetchInfo[0].onlineStatus);
          }
        }
      } catch (error: unknown) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchFriends();
    }
  });

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
      {/* Header and tab buttons */}
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
          {activeTab === 'library' ? <p>My Game Library</p> : <p>Friends</p>}
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

      {/* Content area */}
      <div style={{ marginTop: '20px', color: 'white' }}>
        {activeTab === 'library' ? (
          <p>My Game Library (content coming soon...)</p>
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
            {friends.length === 0 ? (
              <p style={{ color: 'white' }}>No friends found.</p>
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
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
                        <Link
                          to="/user-profile"
                          className="hover-link"
                          onClick={() => {
                            if (friendContext) {
                              friendContext.setUserId(friend.userId);
                              friendContext.setUsername(friend.username);
                              friendContext.setUserBio(friend.bio);
                              friendContext.setUserStatus(friend.onlineStatus);
                            }
                          }}
                        >
                          {friend.username}
                        </Link>

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

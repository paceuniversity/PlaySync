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

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
}

const ProfileFeed = () => {
  const friendContext = useFriend();
  const friendId = friendContext?.userId;
  const profileImage = profilePicture;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');
  const [friends, setFriends] = useState<FriendsProps[]>([]);
  const [steamId, setSteamId] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true);
        const response = await useAxios.get(`social/friends/${friendId}`);
        setFriends(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (friendId) fetchFriends();
  }, [friendId]);

  useEffect(() => {
    const fetchSteamId = async () => {
      try {
        const res = await useAxios.get(`auth/${friendId}`);
        const friendSteamId = res.data.data.steamId;
        if (friendSteamId) setSteamId(friendSteamId);
      } catch (err) {
        console.error('Error fetching public user Steam ID:', err);
      }
    };

    if (friendId) fetchSteamId();
  }, [friendId]);

  useEffect(() => {
    const fetchSteamGames = async () => {
      try {
        const gamesRes = await useAxios.get(`steam/games/${steamId}`);
        setGames(gamesRes.data.games || []);
      } catch (err) {
        console.error('Error fetching public Steam games:', err);
      }
    };

    if (steamId) fetchSteamGames();
  }, [steamId]);

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(games.length / gamesPerPage);

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
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            Game Library
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

      <div style={{ marginTop: '20px', color: 'white' }}>
        {isLoading ? (
          <p>Fetching info...</p>
        ) : activeTab === 'library' ? (
          games.length === 0 ? (
            <p>No games found.</p>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {currentGames.map((game) => (
                <div
                  key={game.appid}
                  style={{
                    backgroundColor: '#2c3e50',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '15px',
                  }}
                >
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.name}
                    style={{
                      width: '120px',
                      height: '45px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>{game.name}</h4>
                    <p style={{ margin: '5px 0' }}>
                      Hours played: {(game.playtime_forever / 60).toFixed(1)}{' '}
                      hrs
                    </p>
                    <p style={{ margin: '5px 0' }}>Platform: Steam</p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  style={{
                    backgroundColor: '#0076ff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <span style={{ alignSelf: 'center' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    backgroundColor: '#0076ff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor:
                      currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )
        ) : friends.length === 0 ? (
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
              <div>
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
                    style={{ cursor: 'pointer' }}
                  >
                    {friend.username}
                  </span>
                  {friend.onlineStatus === 'online' ? (
                    <FaCircle
                      style={{
                        color: 'limegreen',
                        fontSize: '0.6rem',
                        marginLeft: 8,
                      }}
                    />
                  ) : (
                    <FaCircleMinus
                      style={{
                        color: 'red',
                        fontSize: '0.65rem',
                        marginLeft: 8,
                      }}
                    />
                  )}
                </h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileFeed;

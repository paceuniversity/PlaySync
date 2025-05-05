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

type UnifiedGame = {
  type: 'steam' | 'riot';
  id: string;
  name: string;
  platform: string;
  imageUrl?: string;
  details: string;
};

const ProfileFeed = () => {
  const userId = localStorage.getItem('userId');
  const friendContext = useFriend();
  const navigate = useNavigate();
  const profileImage = profilePicture;

  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');
  const [isLoading, setIsLoading] = useState(false);
  const [friends, setFriends] = useState<FriendsProps[]>([]);
  const [games, setGames] = useState<UnifiedGame[]>([]);

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

    if (userId) {
      fetchFriends();
    }
  }, [userId, friendContext]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const userRes = await useAxios.get(`auth/${userId}`);
        const { steamId, riotId } = userRes.data.data;

        const promises = [];

        if (steamId) {
          promises.push(
            useAxios.get(`steam/games/${steamId}`).then((res) =>
              (res.data.games || []).map((g: { appid: number; name: string; playtime_forever: number }) => ({
                type: 'steam',
                id: String(g.appid),
                name: g.name,
                platform: 'Steam',
                imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
                details: `Hours played: ${(g.playtime_forever / 60).toFixed(
                  1
                )} hrs`,
              }))
            )
          );
        }

        if (riotId) {
          promises.push(
            useAxios.get(`riot/matches/${riotId}`).then((res) =>
              (res.data.matches || []).map((match: { metadata: { matchId: string }; info: { gameMode: string } }) => ({
                type: 'riot',
                id: match.metadata.matchId,
                name: `Match ID: ${match.metadata.matchId}`,
                platform: 'Riot',
                details: `Game Mode: ${match.info.gameMode}`,
              }))
            )
          );
        }

        const results = await Promise.all(promises);
        const combined = results.flat();
        setGames(combined);
      } catch (err) {
        console.error('Error fetching games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchGames();
    }
  }, [userId]);

  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

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
      {/* Header */}
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
        {isLoading ? (
          <p>Fetching info...</p>
        ) : activeTab === 'library' ? (
          games.length === 0 ? (
            <p>No games found.</p>
          ) : (
            <>
              {currentGames.map((game) => (
                <div
                  key={game.id}
                  style={{
                    backgroundColor: '#2c3e50',
                    padding: '15px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center',
                  }}
                >
                  {game.imageUrl && (
                    <img
                      src={game.imageUrl}
                      alt={`${game.name} cover`}
                      style={{
                        width: '120px',
                        height: '45px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://store.steampowered.com/public/images/v6/default_game_capsule_sm_120.jpg';
                      }}
                    />
                  )}
                  <div>
                    <h4 style={{ margin: 0 }}>{game.name}</h4>
                    <p style={{ margin: '5px 0' }}>{game.details}</p>
                    <p style={{ margin: '5px 0' }}>Platform: {game.platform}</p>
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
            </>
          )
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
                        style={{ color: 'white', cursor: 'pointer' }}
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

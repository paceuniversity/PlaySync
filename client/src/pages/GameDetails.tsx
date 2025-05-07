import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/App.css';

const GameDetails: React.FC = () => {
  const { id } = useParams();
  const [gameData, setGameData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/games/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch game ${id}`);
        const data = await res.json();
        setGameData(data.game);
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [id]);

  if (error) return <div className="App-header" style={{ color: 'red' }}>Error: {error}</div>;
  if (!gameData) return <div className="App-header" style={{ color: 'white' }}>Loading…</div>;

  return (
    <div className="App-header">
      <h1 style={{ color: '#fff', marginBottom: '1rem' }}>{gameData.name}</h1>

      {gameData.coverUrl && (
        <img
          src={gameData.coverUrl}
          alt={gameData.name}
          style={{ width: '300px', borderRadius: '12px', marginBottom: '1rem' }}
        />
      )}

      <div className="info-block">
        <p><strong style={{ color: '#61dafb' }}>Summary:</strong> {gameData.summary || 'No summary available.'}</p>
        {gameData.rating && (
          <p><strong style={{ color: '#61dafb' }}>Rating:</strong> {gameData.rating.toFixed(1)} / 100</p>
        )}
        {gameData.genres?.length > 0 && (
          <p><strong style={{ color: '#61dafb' }}>Genres:</strong> {gameData.genres.join(', ')}</p>
        )}
        {gameData.platforms?.length > 0 && (
          <p><strong style={{ color: '#61dafb' }}>Platforms:</strong> {gameData.platforms.join(', ')}</p>
        )}
        {gameData.companies?.length > 0 && (
          <p><strong style={{ color: '#61dafb' }}>Companies:</strong> {gameData.companies.join(', ')}</p>
        )}
        {gameData.releaseDate && (
          <p><strong style={{ color: '#61dafb' }}>Release Date:</strong> {new Date(gameData.releaseDate * 1000).toLocaleDateString()}</p>
        )}
        {gameData.igdbUrl && (
          <p>
            <strong style={{ color: '#61dafb' }}>IGDB Page:</strong>{' '}
            <a href={gameData.igdbUrl} target="_blank" rel="noreferrer" style={{ color: '#4ea0f0' }}>
              {gameData.igdbUrl}
            </a>
          </p>
        )}
        {gameData.websites?.length > 0 && (
          <div className="link-list">
            <strong style={{ color: '#61dafb' }}>Websites:</strong>
            <ul>
              {gameData.websites.map((url: string, idx: number) => (
                <li key={idx}>
                  <a href={url} target="_blank" rel="noreferrer" style={{ color: '#4ea0f0' }}>
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {gameData.videoId && (
        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '600px' }}>
          <strong style={{ color: '#61dafb' }}>Game Video:</strong>
          <div style={{ position: 'relative', paddingTop: '56.25%', marginTop: '1rem' }}>
            <iframe
              src={`https://www.youtube.com/embed/${gameData.videoId}`}
              title="Game Trailer"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;

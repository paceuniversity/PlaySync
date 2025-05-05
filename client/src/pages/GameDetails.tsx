import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  if (error) return <div>Error: {error}</div>;
  if (!gameData) return <div>Loading…</div>;

  return (
    <div style={{ color: 'white', padding: '2rem' }}>
      <h1>{gameData.name}</h1>
      {gameData.coverUrl && <img src={gameData.coverUrl} alt={gameData.name} />}
      {/* Add more game info here later */}
    </div>
  );
};

export default GameDetails;
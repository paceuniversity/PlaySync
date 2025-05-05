import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Game = { id: number; name: string; coverUrl: string | null };
type Category = { label: string; games: Game[] };

const Products: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/popular-games')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => {
        console.error('Fetch failed:', err);
        setError('Failed to load games');
      });
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!categories.length) return <div className="text-white">Loading…</div>;

  return (
    <div className="container mt-4">
      {categories.map(({ label, games }) => (
        <div key={label} className="mb-6">
          <h5 className="text-white mb-3">{label}</h5>
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '1rem',
              paddingBottom: '1rem',
            }}
          >
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    minWidth: '200px',
                    background: '#2a2f36',
                    padding: '10px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: 'white',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'scale(1.05)';
                    el.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'scale(1)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      style={{ width: '100%', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="text-gray-500">No Image</div>
                  )}
                  <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                    {game.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Products;

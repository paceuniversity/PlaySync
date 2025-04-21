import React, { useState, useEffect } from 'react';

type Game     = { name: string; coverUrl: string | null };
type Category = { label: string; games: Game[] };

const Products: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/popular-games');
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.categories)) {
          console.error('Unexpected payload:', data);
          throw new Error('Invalid API response');
        }
        setCategories(data.categories);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    })();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (categories.length === 0) {
    return <div className="text-white">Loading…</div>;
  }

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
            {games.map((game, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '200px',
                  flexShrink: 0,
                  background: '#2a2f36',
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  color: 'white',
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Products;

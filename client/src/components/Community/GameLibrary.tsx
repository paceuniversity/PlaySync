import React, { useEffect, useState } from 'react';

type Game = {
  name: string;
  coverUrl: string | null;
};

type GameCategory = {
  label: string;
  games: Game[];
};

const GameLibrary = () => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/popular-games')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load games:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-primaryColor text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Game Library</h2>
      {loading ? (
        <p>Loading games...</p>
      ) : (
        categories.map((category) => (
          <div key={category.label} className="mb-8">
            <h3 className="text-xl font-semibold mb-2">{category.label}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.games.map((game, index) => (
                <div
                  key={`${category.label}-${index}`}
                  className="bg-secondaryColor p-3 rounded-lg text-center"
                >
                  {game.coverUrl ? (
                    <img
                      src={game.coverUrl}
                      alt={game.name}
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-700 rounded">
                      <span className="text-sm text-gray-300">No Image</span>
                    </div>
                  )}
                  <h4 className="mt-2 text-base font-medium">{game.name}</h4>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GameLibrary;
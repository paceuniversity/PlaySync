import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Products: React.FC = () => {
  const [gameCovers, setGameCovers] = useState<string[]>([]);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post(
          'https://id.twitch.tv/oauth2/token',
          null,
          {
            params: {
              client_id: 'o6sundgzxb9yxfh18qcn106ziwoixz',
              client_secret: '64t5k0k87q36fmjrb03ibguwb6npql',
              grant_type: 'client_credentials',
            },
          }
        );
        const accessToken = response.data.access_token;
        fetchRandomGameImages(accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    fetchAccessToken();
  }, []);

  const fetchRandomGameImages = async (accessToken: string) => {
    try {
      const response = await axios.post(
        'https://cors-anywhere.herokuapp.com/https://api.igdb.com/v4/covers', //very bad not good cors policy workaround MOVE SERVER SIDE
        `
        fields url;
        sort id desc;
        limit 10;
        offset ${Math.floor(Math.random() * 1000)};
        `,
        {
          headers: {
            'Client-ID': 'o6sundgzxb9yxfh18qcn106ziwoixz',
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/plain',
          },
        }
      );

      const coverUrls: string[] = response.data
        .map((game: { url: string }) => game?.url && `https:${game.url}`)
        .filter(Boolean);

      setGameCovers(coverUrls);
    } catch (error) {
      console.error('Error fetching random game images:', error);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm px-4 w-full"
      style={{ backgroundColor: '#1b2838' }}
    >
      {/* Scrollable list of random game covers */}
      {gameCovers.length > 0 && (
        <div className="mt-4 px-3 w-100">
          <h5 className="text-white mb-3">Random Game Covers</h5>{' '}
          {/*ugly but good start as the dashboard will get complicated
                                                                     also.. im probably doing too much for this component*/}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '1rem',
              paddingBottom: '1rem',
            }}
          >
            {gameCovers.map((url, index) => (
              <div
                key={index}
                style={{
                  minWidth: '200px',
                  flexShrink: 0,
                  background: '#2a2f36',
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
              >
                <img
                  src={url}
                  alt={`Game Cover ${index}`}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Products;

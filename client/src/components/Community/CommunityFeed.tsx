import React, { useEffect, useState } from 'react';

type CommunityData = {
  name: string;
  members: number;
  description: string;
};

type CommunityPost = {
  author: string;
  message: string;
  timestamp: string;
};

const CommunityFeed = () => {
  const [activeTab, setActiveTab] = useState<'Feed' | 'Community Info'>('Feed');
  const [community, setCommunity] = useState<CommunityData | null>(null);

  const communityPosts: CommunityPost[] = [
    { author: 'Ilir', message: 'Just joined the community! Excited to play 🎮', timestamp: 'May 5, 2025' },
    { author: 'Albin', message: 'Check out that new game in the library 👀', timestamp: 'May 4, 2025' },
    { author: 'Cindy', message: 'Let’s plan a co-op session this weekend!', timestamp: 'May 3, 2025' },
  ];

  useEffect(() => {
    fetch('/api/community')
      .then((res) => res.json())
      .then((data) => setCommunity(data));
  }, []);

  return (
    <div style={{
      backgroundColor: '#1b2838',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '100%',
      minHeight: '65vh',
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          margin: 0,
        }}>
          Community Feed
        </h2>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{
              backgroundColor: activeTab === 'Feed' ? '#0076ff' : '#2c3e50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('Feed')}
          >
            Feed
          </button>
          <button
            style={{
              backgroundColor: activeTab === 'Community Info' ? '#0076ff' : '#2c3e50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('Community Info')}
          >
            Community Info
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', color: 'white' }}>
        {activeTab === 'Feed' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {communityPosts.map((post, index) => (
              <div key={index} style={{
                backgroundColor: '#2c3e50',
                padding: '15px',
                borderRadius: '8px',
              }}>
                <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{post.author}</p>
                <p>{post.message}</p>
                <p style={{ fontSize: '0.8rem', color: '#ccc', marginTop: '8px' }}>{post.timestamp}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <h3>{community?.name ?? 'Loading...'}</h3>
            <p>{community?.description ?? 'Loading description...'}</p>
            <p>Members: {community?.members ?? '...'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;

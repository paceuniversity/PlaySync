import React, { useEffect, useState } from 'react';

type CommunityData = {
  name: string;
  members: number;
  description: string;
};

const CommunityFeed = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'friends'>('library');
  const [community, setCommunity] = useState<CommunityData | null>(null);

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
              backgroundColor: activeTab === 'library' ? '#0076ff' : '#2c3e50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('library')}
          >
            Feed
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
            Community Info
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', color: 'white' }}>
        {activeTab === 'library' ? (
          <p>Feed (content coming soon...)</p>
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

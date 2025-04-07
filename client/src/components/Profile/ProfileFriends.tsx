import React from 'react';

const ProfileFriends = () => {
  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '30%',
        maxHeight: '100vh',
        margin: '0 auto',
        color: 'white',
      }}
    >
      <h3 style={{ marginBottom: '12px' }}>Online Friends</h3>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #2c3e50',
          borderRadius: '5px',
          padding: '10px',
        }}
      >
        <div style={{ padding: '8px 0', borderBottom: '1px solid #2c3e50' }}>
          Friend 1
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #2c3e50' }}>
          Friend 2
        </div>
        <div style={{ padding: '8px 0', borderBottom: '1px solid #2c3e50' }}>
          Friend 3
        </div>
        <div style={{ padding: '8px 0' }}>Friend 4</div>
      </div>
    </div>
  );
};

export default ProfileFriends;

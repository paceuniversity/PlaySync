import React from 'react';

const ProfileHeader = () => {
  const profileImage = '../../../Profile-PNG.png';
  const steamLogo = '../../../steam_logo.png';
  const xboxLogo = '../../../xbox_logo.png';

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Profile Picture */}
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

        {/* Name and Logos in one row */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            John Doe
          </h2>
          <img
            src={xboxLogo}
            alt="Xbox"
            style={{ width: '40px', height: '30px', marginLeft: '3px' }}
          />
          <img
            src={steamLogo}
            alt="Steam"
            style={{ width: '40px', height: '30px', marginLeft: '-10px' }}
          />
        </div>
        <br />
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p
          style={{
            color: 'white',
            fontSize: '1rem',
            margin: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Profile Bio
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;

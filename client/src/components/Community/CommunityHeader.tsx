import profilePicture from '../../assets/Profile-PNG.png';

const CommunityHeader = () => {
  const communityImage = profilePicture;

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
        <img
          src={communityImage}
          alt="Avatar"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '20px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Game Community
          </h2>
          <p
            style={{
              color: 'white',
              fontSize: '1rem',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Members: x
          </p>
          <button type="submit" className="btn btn-primary">
            Join!
          </button>
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
          Welcome to X community! Please be respectful, and follow community
          guidelines
        </p>
      </div>
    </div>
  );
};

export default CommunityHeader;

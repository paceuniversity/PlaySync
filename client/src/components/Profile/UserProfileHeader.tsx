import { Link } from 'react-router-dom';
import profilePicture from '../../assets/Profile-PNG.png';
import { FaCircle } from 'react-icons/fa6';
import { useFriend } from '../../context/PublicProfileContext';
import { FaCircleMinus } from 'react-icons/fa6';

const ProfileHeader = () => {
  const profileImage = profilePicture;

  const friend = useFriend();

  const username = friend?.username || ' ';
  const bio = friend?.userBio || ' ';
  const status = friend?.userStatus || 'offline';

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
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

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              margin: 0,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{username}</span>
            <FaCircle style={{ color: 'limegreen', fontSize: '0.6rem' }} />
            {status === 'online' ? (
              <FaCircle style={{ color: 'limegreen', fontSize: '0.6rem' }} />
            ) : (
              <FaCircleMinus style={{ color: 'red', fontSize: '0.65rem' }} />
            )}
          </h2>

          <style>
            {`
          .hover-link {
            color: white;
            text-decoration: none;
          }
          .hover-link:hover {
            color: #007bff; /* blue on hover */
          }
        `}
          </style>

          <p
            style={{
              color: 'white',
              fontSize: '0.9rem',
              margin: 0,
              marginTop: 10,
              whiteSpace: 'nowrap',
            }}
          >
            Communities:
            <Link to="/profile-settings" className="hover-link">
              {' '}
              X
            </Link>
          </p>
        </div>
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
          <p>{bio}</p>
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;

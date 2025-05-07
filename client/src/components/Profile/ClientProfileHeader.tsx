import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useUser } from '../../context/UserProfileContext';
import profilePicture from '../../assets/Profile-PNG.png';
import { IoSettingsSharp } from 'react-icons/io5';
import { FaCircle } from 'react-icons/fa6';
import { FaCircleMinus } from 'react-icons/fa6';
import { IoLogOut } from 'react-icons/io5';
import { useAxios } from '../../hooks/useAxios';
import { useNavigate } from 'react-router-dom';


const ProfileHeader = () => {
  const profileImage = profilePicture;
  const user = useUser();
  const userId = user?.userId || '';
  const username = user?.username || ' ';
  const userBio = user?.userBio || ' ';
  const communities = user?.userCommunities || 0;
  const userStatus = user?.userStatus || 'offline';

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await useAxios.post(`auth/logout`, { userId: userId });

      localStorage.removeItem('userId');
      navigate('/');
    } catch (error: unknown) {
      console.log(error);
      toast.error('Failed to logout!');
    }
  };

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
      <Link to="/profile-settings">
        <IoSettingsSharp
          style={{
            position: 'absolute',
            top: '20px',
            right: '50px',
            color: 'lightgray',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        />
      </Link>

      <IoLogOut
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'lightgray',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
      />

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
            {username}

            {userStatus === 'online' ? (
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
              {communities}
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
          {userBio}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;

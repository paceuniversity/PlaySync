import { Link } from 'react-router-dom';
import profilePicture from '../../assets/Profile-PNG.png';
import { FaCircle } from 'react-icons/fa6';
import { FaCircleMinus } from 'react-icons/fa6';
import { useFriend } from '../../context/PublicProfileContext';
import { useState, useEffect } from 'react';
import { useAxios } from '../../hooks/useAxios';
import toast from 'react-hot-toast';

const ProfileHeader = () => {
  const profileImage = profilePicture;
  const userId = localStorage.getItem('userId');

  const friend = useFriend();
  const friendId = friend?.userId;
  const username = friend?.username || ' ';
  const bio = friend?.userBio || ' ';
  const userStatus = friend?.userStatus || 'offline';
  const [isLoading, setIsLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const axios = useAxios;

  useEffect(() => {
    const checkFriendship = async () => {
      try {
        const response = await useAxios.post('/social/check-friendship', {
          userId: userId,
          friendId: friendId,
        });
        setIsFriend(response.data.areFriends);
      } catch (error) {
        console.error('Error checking friendship:', error);
      }
    };

    if (userId && friendId) {
      checkFriendship();
    }
  }, [userId, friendId]);

  const addFriend = async () => {
    if (!userId || !friendId) {
      toast.error('Missing user information!');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`social/request`, {
        recipientId: friendId,
        requestorId: userId,
      });

      toast.success('Successfully sent friend request!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send friend request!');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFriend = async () => {
    if (!username || !userId) {
      toast.error('Missing user information!');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove ${username} as a friend?`
    );
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await axios.delete(`social/remove-friend/${userId}`, {
        data: { friendUsername: username },
      });

      toast.success('Successfully removed friend!');
      setIsFriend(false); // <-- Update state after removing
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove friend!');
    } finally {
      setIsLoading(false);
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
      {isFriend ? (
        <button
          className="btn btn-danger"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
          disabled={isLoading}
          onClick={removeFriend}
        >
          {isLoading ? 'Removing...' : 'Unfriend'}
        </button>
      ) : (
        <button
          className="btn btn-primary"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
          disabled={isLoading}
          onClick={addFriend}
        >
          {isLoading ? 'Sending...' : 'Add Friend'}
        </button>
      )}

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

            {userStatus === 'online' ? (
              <FaCircle style={{ color: 'limegreen', fontSize: '0.6rem' }} />
            ) : (
              <FaCircleMinus style={{ color: 'red', fontSize: '0.65rem' }} />
            )}
          </h2>

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
          {bio}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;

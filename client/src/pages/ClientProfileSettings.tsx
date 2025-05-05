import { useState, useEffect } from 'react';
import { useAxios } from '../hooks/useAxios';
import toast from 'react-hot-toast';
import { IoChevronBackOutline } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';

interface UserProps {
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  linkedAccounts?: string[];
}

const ClientProfileSettings: React.FC = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserProps>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await useAxios.get(`auth/${userId}`);
        const fetchInfo = response.data.data;

        setUserInfo({
          firstName: fetchInfo.firstName,
          lastName: fetchInfo.lastName,
          username: fetchInfo.username,
          bio: fetchInfo.bio,
          linkedAccounts: fetchInfo.linkedAccounts || [],
        });
      } catch (error: unknown) {
        console.error(error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('linked') === 'steam') {
      toast.success('Steam account successfully linked!');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.username) {
      toast.error('Please fill in all fields!');
      return;
    }

    setIsLoading(true);

    try {
      await useAxios.patch(`auth/${userId}`, {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        username: userInfo.username,
        bio: userInfo.bio,
      });

      toast.success('User info updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user info!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);

    if (!userId) {
      toast.error('Failed to delete account, please try again!');
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete account?`
    );
    if (!confirmed) return;

    try {
      await useAxios.delete(`auth/${userId}`);
      localStorage.removeItem('userId');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account, please try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSteamConnect = () => {
    if (!userId) {
      toast.error('You must be logged in to connect Steam');
      return;
    }
    window.location.href = `http://localhost:3000/api/steam/steam?userId=${userId}`;
  };

  const [riotUsername, setRiotUsername] = useState('');
  const [riotTag, setRiotTag] = useState('');
  const [showRiotForm, setShowRiotForm] = useState(false);

  const handleRiotConnect = async () => {
    if (!userId || !riotUsername || !riotTag) {
      toast.error('Please fill in both Riot username and tag!');
      return;
    }

    setIsLoading(true);
    try {
      await useAxios.post('riot/connect', {
        userId,
        username: riotUsername,
        tag: riotTag,
      });
      toast.success('Riot account successfully linked!');
      setUserInfo((prev) => ({
        ...prev,
        linkedAccounts: [...(prev.linkedAccounts || []), 'riot'],
      }));
    } catch (error) {
      console.error(error);
      toast.error('Failed to link Riot account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#223142',
          borderRadius: '12px',
          padding: '30px',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Link to="/profile">
          <IoChevronBackOutline
            style={{
              position: 'absolute',
              color: 'lightgray',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          />
        </Link>
        <h2
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          User Details
        </h2>

        <form className="text-white" onSubmit={handleSubmit}>
          <div className="mb-3 row">
            <div className="col-md-6">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-control"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={userInfo.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-control"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={userInfo.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Username"
              value={userInfo.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bio" className="form-label">
              Bio
            </label>
            <textarea
              className="form-control"
              id="bio"
              name="bio"
              placeholder="Bio"
              value={userInfo.bio}
              onChange={(e) =>
                setUserInfo({ ...userInfo, bio: e.target.value })
              }
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Updating Account...' : 'Update Account'}
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            className="btn btn-secondary w-100 mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting Account...' : 'Delete Account'}
          </button>

          {!userInfo.linkedAccounts?.includes('steam') && (
            <button
              type="button"
              onClick={handleSteamConnect}
              className="btn btn-success w-100 mt-4"
            >
              Connect Steam Account
            </button>
          )}

          {!userInfo.linkedAccounts?.includes('riot') && !showRiotForm && (
            <button
              type="button"
              onClick={() => setShowRiotForm(true)}
              className="btn btn-danger w-100 mt-2"
            >
              Link Riot Account
            </button>
          )}

          {showRiotForm && !userInfo.linkedAccounts?.includes('riot') && (
            <>
              <div className="mb-3 mt-4">
                <label htmlFor="riotUsername" className="form-label">
                  Riot Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="riotUsername"
                  placeholder="e.g., T1Faker"
                  value={riotUsername}
                  onChange={(e) => setRiotUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="riotTag" className="form-label">
                  Riot Tagline
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="riotTag"
                  placeholder="e.g., KR1"
                  value={riotTag}
                  onChange={(e) => setRiotTag(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  onClick={handleRiotConnect}
                  className="btn btn-danger"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Submit Riot Info'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRiotForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ClientProfileSettings;

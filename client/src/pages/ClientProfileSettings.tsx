import { useState, useEffect } from 'react';
import { useAxios } from '../hooks/useAxios';
import toast from 'react-hot-toast';
import { IoChevronBackOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface UserProps {
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
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
        });
      } catch (error: unknown) {
        console.error(error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.username) {
      toast.error('Please fill in all fields!');
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
        </form>
      </div>
    </div>
  );
};

export default ClientProfileSettings;

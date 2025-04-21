import { useEffect } from 'react';
import Header from '../components/Header';
import ProfileHeader from '../components/Profile/ClientProfileHeader';
import ProfileFeed from '../components/Profile/ClientProfileFeed';
import { useAxios } from '../hooks/useAxios';
import { useUser } from '../context/UserProfileContext';

const ClientProfile = () => {
  const userId = localStorage.getItem('userId');
  const userContext = useUser();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await useAxios.get(`auth/${userId}`);
        const fetchInfo = response.data.data;

        if (userContext?.setUsername) {
          userContext.setUsername(fetchInfo.username);
        }

        if (userContext?.setUserBio) {
          userContext.setUserBio(fetchInfo.bio);
        }

        if (userContext?.setUserCommunities) {
          userContext.setUserCommunities(fetchInfo.numOfCommunities);
        }

        if (userContext?.setUserStatus) {
          userContext.setUserStatus(fetchInfo.onlineStatus);
        }
      } catch (error: unknown) {
        console.error(error);
      }
    };

    if (userId) {
      fetchUsername();
      userContext?.setUserId(userId);
    }
  }, [userId, userContext]);

  return (
    <div style={{ backgroundColor: '#223142', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <ProfileHeader />
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <ProfileFeed />
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;

import { useEffect } from 'react';
import Header from '../components/Header';
import ProfileHeader from '../components/Profile/UserProfileHeader';
import ProfileFeed from '../components/Profile/UserProfileFeed';
import { useLocation } from 'react-router-dom';
import { useFriend } from '../context/PublicProfileContext';

const UserProfile = () => {
  const friendContext = useFriend();
  const { state } = useLocation() as { state?: any };

  useEffect(() => {
    if (!state || !friendContext) return;

    const { userId, username, userBio, userStatus } = state;

    if (userId) friendContext.setUserId(userId);
    if (username) friendContext.setUsername(username);
    if (userBio) friendContext.setUserBio(userBio);
    if (userStatus) friendContext.setUserStatus(userStatus);
  }, [state]);

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

export default UserProfile;

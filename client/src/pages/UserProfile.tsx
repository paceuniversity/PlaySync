import Header from '../components/Header';
import ProfileHeader from '../components/Profile/UserProfileHeader';
import ProfileFeed from '../components/Profile/UserProfileFeed';

const UserProfile = () => {
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

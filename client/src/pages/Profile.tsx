import React from 'react';
import Header from '../components/Header';
import ProfileHeader from '../components/Profile/ProfileHeader';

const Profile = () => {
  return (
    <div style={{ backgroundColor: '#223142', minHeight: '100vh' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 mt-5">
        <ProfileHeader />

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <h3 className="text-white text-xl font-semibold">User Feed</h3>
          <p className="text-white mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

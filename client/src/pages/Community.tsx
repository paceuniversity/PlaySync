import React from 'react';
import Header from '../components/Header';
import CommunityHeader from '../components/Community/CommunityHeader';
import CommunityFeed from '../components/Community/CommunityFeed';

const Community = () => {
  return (
    <div
      className="align-items-center justify-content-center vw-100 vh-100"
      style={{ backgroundColor: '#223142' }}
    >
      <Header />
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <CommunityHeader />

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <CommunityFeed />
        </div>
      </div>
    </div>
  );
};

export default Community;

import React from 'react';
import Header from '../components/Header';
import DirectMessageComponent from '../components/DirectMessage/DirectMessageComponent';

const DirectMessage = () => {
  return (
    <div
      className="align-items-center justify-content-center vw-100 vh-100"
      style={{ backgroundColor: '#223142' }}
    >
      <Header />
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <DirectMessageComponent />
      </div>
    </div>
  );
};

export default DirectMessage;

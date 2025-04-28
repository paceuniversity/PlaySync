import Header from '../components/Header';
import DirectMessageComponent from '../components/DirectMessage/DirectMessageComponent';
import FriendReqHeader from '../components/DirectMessage/FriendRequest';

const DirectMessage = () => {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: '#223142' }}
    >
      <Header />

      <div
        className="flex flex-col md:flex-row gap-6 p-3 flex-grow"
        style={{
          overflowY: 'hidden',
        }}
      >
        <div className="flex-shrink-0 mb-3" style={{ width: '100%' }}>
          <FriendReqHeader />
        </div>

        <div
          className="flex-grow"
          style={{ minHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
        >
          <DirectMessageComponent />
        </div>
      </div>
    </div>
  );
};

export default DirectMessage;

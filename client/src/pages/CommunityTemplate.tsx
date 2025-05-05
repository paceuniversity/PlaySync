import Header from '../components/Header';
import CommunityHeader from '../components/Community/CommunityHeader';
import CommunityFeed from '../components/Community/CommunityFeed';
import { useParams } from 'react-router-dom';

const Community = () => {
  const { communityId } = useParams();
  return (
    <div style={{ backgroundColor: '#223142', minHeight: '100vh' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <CommunityHeader communityId={communityId!} />

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <CommunityFeed />
        </div>
      </div>
    </div>
  );
};

export default Community;

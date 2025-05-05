import Header from '../components/Header';
import JoinedCommunitiesPage from '../components/Community/ClientCommunity';
import { useNavigate } from 'react-router-dom';

const ClientCommunity = () => {
  const navigate = useNavigate();

  return (
    <div
      className="align-items-center justify-content-center vw-100 vh-100"
      style={{ backgroundColor: '#223142' }}
    >
      <Header />
      <div className="max-w-7xl mx-auto px-4 mt-5">
        <div className="flex justify-between items-center mb-4"></div>
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <button
            onClick={() => navigate('/create-community')}
            className="btn btn-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Community
          </button>
          <JoinedCommunitiesPage />
        </div>
      </div>
    </div>
  );
};

export default ClientCommunity;

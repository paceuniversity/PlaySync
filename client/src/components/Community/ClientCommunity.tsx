import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import { useNavigate } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: { seconds: number; nanoseconds: number };
  createdBy: string;
  bannerUrl?: string;
  profilePictureUrl?: string;
}

const JoinedCommunitiesPage = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await useAxios.get(`/communities/user/${userId}`);
        setCommunities(res.data.communities || []);
      } catch (err) {
        console.error('Failed to fetch joined communities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [userId]);

  if (loading) return <p style={{ color: 'white' }}>Loading communities...</p>;

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2 style={{ marginBottom: '20px' }}>My Communities</h2>
      {communities.length === 0 ? (
        <p>You haven't joined any communities yet.</p>
      ) : (
        communities.map((community) => (
          <div
            key={community.id}
            style={{
              backgroundColor: '#2c3e50',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '15px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: '#4da6ff',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => navigate(`/communities/${community.id}`)}
            >
              {community.name}
            </h3>
            <p style={{ margin: '5px 0' }}>{community.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default JoinedCommunitiesPage;

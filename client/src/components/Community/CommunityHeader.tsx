/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import profilePicture from '../../assets/Profile-PNG.png';
import { useAxios } from '../../hooks/useAxios';
import { FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CommunityHeader: React.FC<{ communityId: string }> = ({
  communityId,
}) => {
  const userId = localStorage.getItem('userId');
  const [community, setCommunity] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const communityImage = profilePicture;

  useEffect(() => {
    const fetchCommunityInfo = async () => {
      try {
        const [commRes, membersRes] = await Promise.all([
          useAxios.get(`/communities/${communityId}`),
          useAxios.get(`/communities/${communityId}/members`),
        ]);

        const communityData = commRes.data.community;
        const members = membersRes.data.members || [];

        setCommunity(communityData);
        setMemberCount(members.length);
        setIsMember(members.some((m: any) => m.userId === userId));
        setIsAdmin(
          members.some((m: any) => m.userId === userId && m.role === 'admin')
        );
      } catch (err) {
        console.error('Failed to load community:', err);
        toast.error('Failed to load community info');
      }
    };

    if (communityId && userId) fetchCommunityInfo();
  }, [communityId, userId]);

  const handleJoin = async () => {
    try {
      await useAxios.post(`/communities/${communityId}/join`, {
        userId,
      });
      toast.success('Joined community!');
      setIsMember(true);
      setMemberCount((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to join community.');
    }
  };

  const handleLeave = async () => {
    try {
      await useAxios.delete(`/${communityId}/leave/${userId}`);
      toast.success('Left community.');
      setIsMember(false);
      setMemberCount((prev) => prev - 1);
    } catch (err) {
      console.log(err);
      toast.error('Failed to leave community.');
    }
  };

  if (!community) return null;

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={community.profilePictureUrl || communityImage}
          alt="Community Avatar"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '20px',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.25rem',
              margin: 0,
            }}
          >
            {community.name}
          </h2>
          <p
            style={{
              color: 'white',
              fontSize: '1rem',
              margin: 0,
            }}
          >
            Members: {memberCount}
          </p>

          {isAdmin && (
            <FaCog
              style={{
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
              }}
              title="Admin Settings"
            />
          )}

          {isMember ? (
            <button
              onClick={handleLeave}
              className="btn btn-outline-light btn-sm"
            >
              Leave
            </button>
          ) : (
            <button onClick={handleJoin} className="btn btn-primary btn-sm">
              Join!
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '10px' }}>
        <p style={{ color: 'white' }}>{community.description}</p>
      </div>
    </div>
  );
};

export default CommunityHeader;

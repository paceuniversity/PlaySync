import { useState, useEffect, useCallback } from 'react';
import { useAxios } from '../../hooks/useAxios';
import profilePicture from '../../assets/Profile-PNG.png';
import { useFriend } from '../../context/PublicProfileContext';
import toast from 'react-hot-toast';

interface FriendReqProps {
  reqId: string;
  requestorId: string;
  requestorUsername: string;
  createdAt: string;
  status: string;
}

const FriendReqHeader = () => {
  const userId = localStorage.getItem('userId');
  const friendContext = useFriend();
  const profileImage = profilePicture;
  const [, setIsLoading] = useState(false);

  const [friendReq, setFriendReq] = useState<FriendReqProps[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const fetchFriendReq = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await useAxios.get(`social/requests/${userId}`);
      const fetchInfo: FriendReqProps[] = response.data.data;
      setFriendReq(fetchInfo);
      setTotalRequests(response.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFriendReq();
    }
  }, [userId, friendContext, fetchFriendReq]);

  const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString();
  };

  const handleRequest = async (reqId: string, action: 'accept' | 'decline') => {
    try {
      setIsLoading(true);
      await useAxios.patch(`social/${reqId}`, { userReq: action });
      toast.success(`Friend request ${action}ed!`);
      fetchFriendReq();
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to handle request!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '90%',
        minHeight: '10vh',
        margin: '0 auto',
        position: 'relative',
        color: 'white',
      }}
    >
      {friendReq.length === 0 ? (
        <h2
          style={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            marginBottom: '20px',
          }}
        >
          Friend Requests
        </h2>
      ) : (
        <h2
          style={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            marginBottom: '20px',
          }}
        >
          Friend Requests ({totalRequests})
        </h2>
      )}

      {friendReq.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <img
            src={profileImage}
            alt="Avatar"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              {friendReq[0].requestorUsername}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.8rem',
                color: 'lightgray',
              }}
            >
              Requested on {formatDate(friendReq[0].createdAt)}
            </p>
          </div>
        </div>
      )}

      {friendReq.length === 0 && <p>No pending requests.</p>}

      {/* View All Requests Button */}
      {totalRequests > 0 && (
        <h3
          onClick={() => setShowPopup(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          View All Requests
        </h3>
      )}

      {/* Popup for viewing all */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#223142',
              padding: '20px',
              borderRadius: '8px',
              width: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: 'white',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h5 style={{ marginTop: '20px' }}>All Friend Requests</h5>

            {friendReq.map((req) => (
              <div
                key={req.reqId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #3a4a5a',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <img
                    src={profilePicture}
                    alt="Avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      {req.requestorUsername}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: 'lightgray',
                      }}
                    >
                      Requested on {formatDate(req.createdAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleRequest(req.reqId, 'accept')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleRequest(req.reqId, 'decline')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendReqHeader;

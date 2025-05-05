/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useAxios } from '../../hooks/useAxios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const CommunityFeed = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const postsPerPage = 5;

  useEffect(() => {
    const fetchPostsAndAdmin = async () => {
      try {
        setLoading(true);
        const [postRes, membersRes] = await Promise.all([
          useAxios.get(`/communities/${communityId}/posts`),
          useAxios.get(`/communities/${communityId}/members`),
        ]);

        const postsData = postRes.data.posts || [];
        const members = membersRes.data.members || [];

        const isUserAdmin = members.some(
          (m: any) => m.userId === userId && m.role === 'admin'
        );

        setIsAdmin(isUserAdmin);
        setPosts(postsData);
      } catch (err) {
        console.error('Error loading posts or admin status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) fetchPostsAndAdmin();
  }, [communityId, userId]);

  const handlePostSubmit = async () => {
    if (!newPost.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const res = await useAxios.post(`/communities/${communityId}/posts`, {
        authorId: userId,
        content: newPost.trim(),
      });

      if (res.data.success) {
        toast.success('Post created!');
        setNewPost('');
        const refreshed = await useAxios.get(
          `/communities/${communityId}/posts`
        );
        setPosts(refreshed.data.posts || []);
      } else {
        toast.error('Server responded but did not confirm success.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await useAxios.delete(`/communities/posts/${postId}`);
      toast.success('Post deleted!');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete post');
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        padding: '20px',
        borderRadius: '10px',
        width: '100%',
        minHeight: '60vh',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}
    >
      <h4 style={{ color: 'white' }}>Community Feed</h4>

      <button
        onClick={() => setShowModal(true)}
        style={{
          margin: '10px 0',
          backgroundColor: '#0076ff',
          color: 'white',
          padding: '10px 12px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Create Post +
      </button>

      <div style={{ color: 'white' }}>
        {loading ? (
          <p>Loading posts...</p>
        ) : currentPosts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          currentPosts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                navigate(`/communities/${communityId}/posts/${post.id}`)
              }
              style={{
                backgroundColor: '#2c3e50',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '15px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h4 style={{ margin: 0 }}>Post by {post.authorUsername}</h4>
                {(post.authorId === userId || isAdmin) && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.id);
                    }}
                    style={{
                      color: 'red',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                    }}
                    title="Delete Post"
                  >
                    🗑️
                  </span>
                )}
              </div>

              <p style={{ marginTop: '5px' }}>
                {post.content.length > 100
                  ? post.content.slice(0, 100) + '...'
                  : post.content}
              </p>
            </div>
          ))
        )}

        {posts.length > postsPerPage && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                backgroundColor: '#0076ff',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                backgroundColor: '#0076ff',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#2c3e50',
              padding: '25px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '500px',
              color: 'white',
            }}
          >
            <h3 style={{ marginBottom: '15px' }}>New Post</h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={5}
              placeholder="Share something with the community..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: '#1b2838',
                color: 'white',
                border: '1px solid #3a4a5a',
                resize: 'none',
              }}
            />
            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: '#555',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '5px',
                  marginRight: '10px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handlePostSubmit();
                  setShowModal(false);
                }}
                disabled={submitting}
                style={{
                  backgroundColor: '#0076ff',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;

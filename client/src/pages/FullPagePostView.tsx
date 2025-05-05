import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAxios } from '../hooks/useAxios';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number };
}

interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: { seconds: number; nanoseconds: number };
}

const FullPostView = () => {
  const { communityId, postId } = useParams();
  const userId = localStorage.getItem('userId');
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postRes = await useAxios.get(`/communities/${communityId}/posts`);
        const foundPost = postRes.data.posts.find((p: Post) => p.id === postId);
        if (!foundPost) throw new Error('Post not found');
        setPost(foundPost);

        const replyRes = await useAxios.get(`/communities/${postId}/replies`);
        setReplies(replyRes.data.replies || []);
      } catch (err) {
        toast.error('Error loading post or replies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (communityId && postId) fetchData();
  }, [communityId, postId]);

  const handleReplySubmit = async () => {
    if (!newReply.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await useAxios.post(`/communities/${postId}/replies`, {
        authorId: userId,
        content: newReply.trim(),
      });
      toast.success('Reply posted!');
      setNewReply('');
      const updated = await useAxios.get(`/communities/${postId}/replies`);
      setReplies(updated.data.replies || []);
    } catch (err) {
      toast.error('Failed to post reply');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !post) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  }

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        color: 'white',
        minHeight: '100vh',
        padding: '40px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          flex: 1,
        }}
      >
        <h2 style={{ marginBottom: '10px' }}>
          Post by{' '}
          <span style={{ color: '#4cb8ff' }}>{post.authorUsername}</span>
        </h2>
        <p
          style={{
            fontSize: '1.15rem',
            backgroundColor: '#2c3e50',
            padding: '15px',
            borderRadius: '8px',
          }}
        >
          {post.content}
        </p>

        <hr style={{ margin: '30px 0', borderColor: '#555' }} />

        <h3 style={{ marginBottom: '10px' }}>Replies</h3>
        {replies.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>No replies yet.</p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              style={{
                backgroundColor: '#2c3e50',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '10px',
              }}
            >
              <strong>{reply.authorUsername}:</strong>
              <p style={{ marginTop: '5px' }}>{reply.content}</p>
            </div>
          ))
        )}

        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Write a reply..."
          rows={4}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: '#1b2838',
            color: 'white',
            border: '1px solid #3a4a5a',
            resize: 'none',
          }}
        />
        <button
          onClick={handleReplySubmit}
          disabled={submitting}
          style={{
            marginTop: '10px',
            backgroundColor: '#0076ff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Posting...' : 'Reply'}
        </button>
      </div>
    </div>
  );
};

export default FullPostView;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../hooks/useAxios';
import toast from 'react-hot-toast';
import { IoChevronBackOutline } from 'react-icons/io5';

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description) {
      toast.error('Name and description are required.');
      return;
    }

    try {
      const res = await useAxios.post('communities', {
        name,
        description,
        createdBy: userId,
      });

      toast.success('Community created successfully!');
      console.log(res);

      navigate(`/community`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create community.');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#1b2838',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        position: 'relative',
      }}
    >
      {/* Back Button */}
      <IoChevronBackOutline
        onClick={() => navigate('/community')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: 'lightgray',
          fontSize: '1.5rem',
          cursor: 'pointer',
        }}
      />

      <div
        style={{
          backgroundColor: '#2c3e50',
          padding: '30px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h2
          style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Create a Community
        </h2>

        <form onSubmit={handleSubmit}>
          <label
            style={{ color: 'white', marginBottom: '6px', display: 'block' }}
          >
            Community Name
          </label>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '16px',
              border: 'none',
              outline: 'none',
            }}
          />

          <label
            style={{ color: 'white', marginBottom: '6px', display: 'block' }}
          >
            Description
          </label>
          <textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: 'none',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#0076ff',
              color: 'white',
              padding: '10px 16px',
              width: '100%',
              fontWeight: 'bold',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Create Community
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityPage;

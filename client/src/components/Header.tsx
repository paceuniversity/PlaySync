import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaUserAlt, FaSearch } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { AiFillMessage } from 'react-icons/ai';
import { TbWorldUpload } from 'react-icons/tb';
import logo from '../assets/PlaySyncLogo.png';
import toast from 'react-hot-toast';
import { useAxios } from '../hooks/useAxios';
import profilePicture from '../assets/Profile-PNG.png';

const Header: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  interface SearchResult {
    profilePic: string;
    userId: string;
    username: string;
    onlineStatus: 'online' | 'offline';
  }

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!search.trim()) {
      toast.error('Please enter something to search!');
      return;
    }

    let searchType = 'username'; // Default
    let searchQuery = search.trim();

    if (search.startsWith('u/')) {
      searchType = 'username';
      searchQuery = search.slice(2);
    }

    try {
      const response = await useAxios.get(`search/${searchType}`, {
        params: { query: searchQuery },
      });

      const fetched = response.data.data;
      setSearchResults(fetched); // expecting an array
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search!');
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light shadow-sm px-4 w-full"
      style={{ backgroundColor: '#1b2838' }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex justify-content-center align-items-center mb-3 gap-1">
          <img
            src={logo}
            alt="PlaySync Logo"
            style={{ width: '50px', height: '50px' }}
          />
          <Link
            className="navbar-brand fs-4 fw-bold d-flex align-items-center text-primary"
            to="/dashboard"
          >
            <span className="fw-bold">PlaySync</span>
          </Link>
        </div>

        <div
          className="d-none d-lg-flex gap-4 align-items-center"
          style={{ position: 'relative' }}
        >
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 bg-light"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          {showDropdown && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                width: '350px',
                zIndex: 1000,
                padding: '10px',
              }}
            >
              {searchResults.map((result) => (
                <span
                  key={result.userId}
                  onClick={() => {
                    navigate('/user-profile', {
                      state: {
                        userId: result.userId,
                        username: result.username,
                        userStatus: result.onlineStatus,
                      },
                    });
                    setShowDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#333',
                    borderBottom: '1px solid #ccc',
                  }}
                >
                  <img
                    src={result.profilePic || profilePicture}
                    alt="Profile"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', color: 'black' }}>
                      {result.username}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color:
                          result.onlineStatus === 'online' ? 'green' : 'red',
                      }}
                    >
                      {result.onlineStatus}
                    </span>
                  </div>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown d-flex align-items-center gap-4">
          <Link to="/dashboard" className="nav-link text-dark">
            <IoHome size={28} className="text-primary" />
          </Link>
          <Link to="/community" className="nav-link text-dark">
            <TbWorldUpload size={28} className="text-primary" />
          </Link>
          <Link to="/direct-message" className="nav-link text-dark">
            <AiFillMessage size={28} className="text-primary" />
          </Link>
          <Link to="/profile" className="nav-link text-dark">
            <FaUserAlt size={28} className="text-primary" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;

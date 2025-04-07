import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { FaUserAlt } from 'react-icons/fa';
import { IoHome } from 'react-icons/io5';
import { AiFillMessage } from 'react-icons/ai';
import { FaSearch } from 'react-icons/fa';
import { TbWorldUpload } from 'react-icons/tb';
import logo from '../assets/PlaySyncLogo.png';

const Header: React.FC = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light  shadow-sm px-4 w-full"
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

        <div className="d-none d-lg-flex gap-4 align-items-center">
          <div className="input-group">
            <span className="input-group-text bg-light border-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-0 bg-light"
              placeholder="Search products"
            />
          </div>
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

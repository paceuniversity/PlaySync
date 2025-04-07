import React, { useState } from 'react';
import Lottie from 'lottie-react';
import loginAnimation from '../../../assets/animations/LoginAnimation.json';
import logo from '../../../assets/PlaySyncLogo.png';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

interface IAuthRequest {
  email: string;
}

const ForgotPasswordReq: React.FC = () => {
  const [user, setUser] = useState<IAuthRequest>({
    email: '',
  });

  //   const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Side: Sign In Form */}
        <div
          className="col-md-6 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: '#1b2838' }}
        >
          <div className="w-75 text-white">
            <div className="d-flex justify-content-center align-items-center mb-5 gap-2">
              <img
                src={logo}
                alt="PlaySync Logo"
                style={{ width: '40px', height: '40px' }}
              />
              <h2 className="text-white m-0">PlaySync</h2>
            </div>

            <p className="mb-4">Forgot Password</p>
            <form>
              {/* onSubmit={handleSubmit} */}
              <div className="mb-3 position-relative">
                <label htmlFor="email" className="form-label text-white">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your account's email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <div className="d-flex justify-content-between mt-2">
                  <span className="form-text text-white">
                    Back to{' '}
                    <a href="/" className="text-decoration-none text-primary">
                      Login
                    </a>
                  </span>
                  <span className="form-text text-white">
                    Don't have an account?{' '}
                    <a
                      href="/sign-up"
                      className="text-decoration-none text-primary"
                    >
                      Sign Up
                    </a>
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                // disabled={isLoading}
              >
                {/* {isLoading ? 'Sending OTP...' : 'Send OTP'} */}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Lottie Animation */}
        <div
          className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
          style={{ backgroundColor: '#223142' }}
        >
          <div style={{ width: '700px', height: '700px' }}>
            <Lottie animationData={loginAnimation} loop autoplay />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordReq;

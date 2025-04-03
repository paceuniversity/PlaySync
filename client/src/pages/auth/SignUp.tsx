import React, { useState } from 'react';
import logo from '../../assets/PlaySyncLogo.png';
import Lottie from 'lottie-react';
import signupAnimation from '../../assets/animations/SignUpAnimation.json';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

interface SignUpProps {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userName: string;
}

const SignUp: React.FC = () => {
  const [user, setUser] = useState<SignUpProps>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userName: '',
  });
  //   const [isLoading, setIsLoading] = useState(false);

  //   const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
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
            <p className="text-white m-0">Create Account</p>
            <form className="mt-3">
              {/* onSubmit={handleSubmit} */}
              <div className="mb-3 row">
                <div className="col-md-6">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={user.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={user.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={user.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: 'pointer' }}
                  >
                    <i
                      className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}
                    ></i>
                  </span>
                </div>
              </div>
              <div className="mb-3 position-relative">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y me-2"
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: 'pointer' }}
                  >
                    <i
                      className={
                        showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                      }
                    ></i>
                  </span>
                </div>
              </div>
              <div className="d-flex text-white justify-content-between mt-2 mb-3">
                <span className="form-text text-white ">
                  Already have an account?{' '}
                  <a href="/" className="text-decoration-none">
                    Sign In
                  </a>
                </span>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                // disabled={isLoading}
              >
                {/* {isLoading ? 'Creating Account...' : 'Sign Up'} */}
              </button>
            </form>
          </div>
        </div>

        <div
          className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
          style={{ backgroundColor: '#223142' }}
        >
          <div style={{ width: '500px', height: '500px' }}>
            <Lottie animationData={signupAnimation} loop autoplay />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

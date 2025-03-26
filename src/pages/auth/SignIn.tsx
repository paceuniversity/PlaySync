import React, { useState } from 'react';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

interface IAuthRequest {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const [user, setUser] = useState<IAuthRequest>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  //   const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Side: Sign In Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h2 className="text-center mb-4">Sign In</h2>
            <form>
              {/* onSubmit={handleSubmit} */}
              <div className="mb-3 position-relative">
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
                <div className="d-flex justify-content-between mt-2">
                  <span className="form-text">
                    Don't have an account?{' '}
                    <a href="/sign-up" className="text-decoration-none">
                      Sign Up
                    </a>
                  </span>
                  <span className="form-text">
                    <a href="/forgot-password" className="text-decoration-none">
                      Forgot Password?
                    </a>
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                // disabled={isLoading}
              >
                {/* {isLoading ? 'Signing In...' : 'Sign In'} */}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Media/Image */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <img
            src="/assets/signin-image.png"
            alt="Sign In"
            className="img-fluid"
            style={{ maxWidth: '80%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;

import './css/App.css';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserProfileContext';
import { FriendProvider } from './context/PublicProfileContext';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import DirectMessage from './pages/DirectMessage';
import Community from './pages/CommunityTemplate';
import ForgotPasswordReq from './pages/auth/ForgotPassword/ForgotPasswordReq';
import ClientProfileSettings from './pages/ClientProfileSettings';
import ClientProfile from './pages/ClientProfile';
import UserProfile from './pages/UserProfile';

function App() {
  const [, setLoading] = useState<boolean>(true);
  const queryClient = new QueryClient();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPasswordReq />} />
        <Route
          path="/profile"
          element={
            <UserProvider>
              <ClientProfile />
            </UserProvider>
          }
        />
        <Route
          path="/profile-settings"
          element={
            <UserProvider>
              <ClientProfileSettings />
            </UserProvider>
          }
        />
        <Route
          path="/user-profile"
          element={
            <FriendProvider>
              <UserProfile />
            </FriendProvider>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/direct-message" element={<DirectMessage />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;

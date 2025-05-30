import './css/App.css';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserProfileContext';
import { FriendProvider } from './context/PublicProfileContext';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import DirectMessage from './pages/DirectMessage';
import ForgotPasswordReq from './pages/auth/ForgotPassword/ForgotPasswordReq';
import ClientProfileSettings from './pages/ClientProfileSettings';
import ClientProfile from './pages/ClientProfile';
import UserProfile from './pages/UserProfile';
import ClientCommunity from './pages/ClientCommunity';
import CreateCommunityPage from './pages/CreateCommunity';
import Community from './pages/CommunityTemplate';
import FullPostView from './pages/FullPagePostView';
import GameDetails from './pages/GameDetails';

function App() {
  const queryClient = new QueryClient();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
        <Route path="/community" element={<ClientCommunity />} />
        <Route path="/create-community" element={<CreateCommunityPage />} />
        <Route path="/communities/:communityId" element={<Community />} />
        <Route path="/game/:id" element={<GameDetails />} />
        <Route
          path="/communities/:communityId/posts/:postId"
          element={<FullPostView />}
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;

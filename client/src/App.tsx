import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, useLocation } from 'react-router-dom';
import './css/App.css';
import Dashboard from './pages/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

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
    <>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<SignIn />} />
        </Routes>
        <Routes>
          <Route path="/sign-up" element={<SignUp />} />
        </Routes>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </QueryClientProvider>
    </>
  );
}

export default App;

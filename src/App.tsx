import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
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
      <h1>PlaySync </h1>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </QueryClientProvider>
    </>
  );
}

export default App;

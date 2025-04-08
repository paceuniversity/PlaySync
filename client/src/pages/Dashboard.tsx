import React from 'react';
import Header from '../components/Header';
import Products from '../components/Dashboard/Products';
const Dashboard = () => {
  return (
    <div style={{ backgroundColor: '#223142', minHeight: '100vh' }}>
      <Header />

      <h4 className="text-4x1 text-white font-bold mt-3">Dashboard</h4>
      <Products />
    </div>
  );
};

export default Dashboard;

import React from 'react';
import Header from '../components/Header';
import Products from '../components/Products';
const Dashboard = () => {
  return (
    <div
      className="align-items-center justify-content-center vw-100 vh-100"
      style={{ backgroundColor: '#223142' }}
    >
      <Header />
      <h4 className="text-4x1 text-white font-bold mt-3">Dashboard</h4>
      <Products />
    </div>
  );
};

export default Dashboard;

import React from 'react';
import Header from '../components/Header';

const Dashboard = () => {
  return (
    <div style={{ backgroundColor: '#223142', minHeight: '100vh' }}>
      <Header />

      {/* Inline styles */}
      <style>
        {`
          .dashboard-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 20px;
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 1rem;
          }

          .dashboard-box {
            background-color: #1b2838;
            color: white;
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #444;
            min-height: 200px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            font-weight: bold;
          }

          @media (max-width: 768px) {
            .dashboard-container {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      {/* Grid content */}
      <div className="dashboard-container">
        <div className="dashboard-box">Top Left</div>
        <div className="dashboard-box">Top Right</div>
        <div className="dashboard-box">Bottom Left</div>
        <div className="dashboard-box">Bottom Right</div>
      </div>
    </div>
  );
};

export default Dashboard;

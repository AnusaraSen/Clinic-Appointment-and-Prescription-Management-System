import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';

const OrdersPage = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content-with-sidebar">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Order Management</h1>
          <p>Order management functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

import React from 'react';
import InventoryNavigationSidebar from '../components/InventoryNavigationSidebar';

const OrdersPage = () => {
  return (
    <div className="inventory-nav-layout">
      <InventoryNavigationSidebar />
      <div className="inventory-nav-content">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Order Management</h1>
          <p>Order management functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

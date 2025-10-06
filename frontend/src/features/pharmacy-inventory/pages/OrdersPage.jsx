import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrderList from './OrderManagement/OrderList';
import CreateOrder from './OrderManagement/CreateOrder';
import UpdateOrder from './OrderManagement/UpdateOrder';

const OrdersPage = () => {
  return (
    <Routes>
      <Route index element={<OrderList />} />
      <Route path="new" element={<CreateOrder />} />
      <Route path="edit/:id" element={<UpdateOrder />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default OrdersPage;

import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, MailIcon, AlertTriangleIcon, ArrowRightIcon, ShoppingCartIcon } from 'lucide-react';
// Sample data for orders
const initialOrders = [{
  id: 1,
  orderNumber: 'ORD-001',
  supplier: 'PharmaCorp',
  items: 'Amoxicillin, Test Tubes',
  status: 'Pending',
  date: '2023-05-10',
  supplierEmail: 'orders@pharmacorp.com'
}, {
  id: 2,
  orderNumber: 'ORD-002',
  supplier: 'MediSource',
  items: 'Ibuprofen, Microscope Slides',
  status: 'Delivered',
  date: '2023-05-05',
  supplierEmail: 'supply@medisource.com'
}, {
  id: 3,
  orderNumber: 'ORD-003',
  supplier: 'HealthDrug',
  items: 'Lisinopril, Petri Dishes',
  status: 'Processing',
  date: '2023-05-09',
  supplierEmail: 'orders@healthdrug.com'
}, {
  id: 4,
  orderNumber: 'ORD-004',
  supplier: 'PharmaCorp',
  items: 'Metformin, Pipettes',
  status: 'Pending',
  date: '2023-05-11',
  supplierEmail: 'orders@pharmacorp.com'
}, {
  id: 5,
  orderNumber: 'ORD-005',
  supplier: 'MediSource',
  items: 'Atorvastatin, Centrifuge Tubes',
  status: 'Cancelled',
  date: '2023-05-01',
  supplierEmail: 'supply@medisource.com'
}];
// Sample data for low stock items
const lowStockItems = [{
  id: 1,
  name: 'Lisinopril 10mg',
  category: 'Medicine',
  quantity: 25,
  threshold: 50
}, {
  id: 2,
  name: 'Test Tubes (10ml)',
  category: 'Lab',
  quantity: 30,
  threshold: 100
}, {
  id: 3,
  name: 'Metformin 850mg',
  category: 'Medicine',
  quantity: 40,
  threshold: 75
}, {
  id: 4,
  name: 'Microscope Slides',
  category: 'Lab',
  quantity: 15,
  threshold: 50
}];
type Order = {
  id: number;
  orderNumber: string;
  supplier: string;
  items: string;
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  date: string;
  supplierEmail: string;
};
export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Omit<Order, 'id'>>({
    orderNumber: `ORD-${String(new Date().getFullYear()).slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`,
    supplier: '',
    items: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    supplierEmail: ''
  });
  const handleAddOrder = () => {
    const id = orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1;
    const addedOrder = {
      id,
      ...newOrder
    };
    setOrders([...orders, addedOrder]);
    // Show email sent notification
    setEmailSent(addedOrder.supplier);
    setTimeout(() => setEmailSent(null), 3000);
    setNewOrder({
      orderNumber: `ORD-${String(new Date().getFullYear()).slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(orders.length + 2).padStart(3, '0')}`,
      supplier: '',
      items: '',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      supplierEmail: ''
    });
    setIsAddModalOpen(false);
  };
  const handleEditOrder = () => {
    if (currentOrder) {
      setOrders(orders.map(order => order.id === currentOrder.id ? currentOrder : order));
      setIsEditModalOpen(false);
      setCurrentOrder(null);
    }
  };
  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter(order => order.id !== id));
  };
  const handleCreateOrderFromLowStock = (item: any) => {
    // Find a suitable supplier based on the item category
    const supplier = item.category === 'Medicine' ? 'PharmaCorp' : 'LabEquip Co.';
    const supplierEmail = item.category === 'Medicine' ? 'orders@pharmacorp.com' : 'orders@labequip.com';
    const newOrderObj = {
      id: orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1,
      orderNumber: `ORD-${String(new Date().getFullYear()).slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`,
      supplier,
      items: item.name,
      status: 'Pending' as const,
      date: new Date().toISOString().split('T')[0],
      supplierEmail
    };
    setOrders([...orders, newOrderObj]);
    // Show email sent notification
    setEmailSent(supplier);
    setTimeout(() => setEmailSent(null), 3000);
    setIsLowStockModalOpen(false);
  };
  const handleConfirmOrder = (orderId: number) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Delivered' as const
        };
      }
      return order;
    });
    const confirmedOrder = orders.find(order => order.id === orderId);
    if (confirmedOrder) {
      setOrderConfirmed(confirmedOrder.orderNumber);
      setTimeout(() => setOrderConfirmed(null), 3000);
    }
    setOrders(updatedOrders);
  };
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        <div className="flex space-x-3">
          <button onClick={() => setIsLowStockModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center">
            <AlertTriangleIcon size={18} className="mr-1" />
            Order Low Stock Items
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <PlusIcon size={18} className="mr-1" />
            New Order
          </button>
        </div>
      </div>

      {emailSent && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <MailIcon size={20} className="mr-2" />
            <span>
              Order request has been sent to <strong>{emailSent}</strong>{' '}
              successfully!
            </span>
          </div>
          <button onClick={() => setEmailSent(null)} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>}

      {orderConfirmed && <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckIcon size={20} className="mr-2" />
            <span>
              Order <strong>{orderConfirmed}</strong> has been confirmed and
              inventory has been updated.
            </span>
          </div>
          <button onClick={() => setOrderConfirmed(null)} className="text-blue-600 hover:text-blue-800">
            ×
          </button>
        </div>}

      {/* Orders Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-col">
                    <span>{order.supplier}</span>
                    <span className="text-xs text-gray-400">
                      {order.supplierEmail}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {order.items}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {order.status === 'Pending' && <button onClick={() => handleConfirmOrder(order.id)} className="text-green-600 hover:text-green-900 mr-3" title="Confirm Delivery">
                      <CheckIcon size={18} />
                    </button>}
                  <button onClick={() => {
                setCurrentOrder(order);
                setIsEditModalOpen(true);
              }} className="text-indigo-600 hover:text-indigo-900 mr-3">
                    <PencilIcon size={18} />
                  </button>
                  <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-900">
                    <TrashIcon size={18} />
                  </button>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Add Order Modal */}
      {isAddModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input type="text" value={newOrder.orderNumber} onChange={e => setNewOrder({
              ...newOrder,
              orderNumber: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input type="text" value={newOrder.supplier} onChange={e => setNewOrder({
              ...newOrder,
              supplier: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Email
                </label>
                <input type="email" value={newOrder.supplierEmail} onChange={e => setNewOrder({
              ...newOrder,
              supplierEmail: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items (comma separated)
                </label>
                <textarea value={newOrder.items} onChange={e => setNewOrder({
              ...newOrder,
              items: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input type="date" value={newOrder.date} onChange={e => setNewOrder({
              ...newOrder,
              date: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select value={newOrder.status} onChange={e => setNewOrder({
              ...newOrder,
              status: e.target.value as any
            })} className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAddOrder} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <MailIcon size={16} className="mr-1" />
                Create & Send Order
              </button>
            </div>
          </div>
        </div>}

      {/* Edit Order Modal */}
      {isEditModalOpen && currentOrder && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input type="text" value={currentOrder.orderNumber} onChange={e => setCurrentOrder({
              ...currentOrder,
              orderNumber: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input type="text" value={currentOrder.supplier} onChange={e => setCurrentOrder({
              ...currentOrder,
              supplier: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Email
                </label>
                <input type="email" value={currentOrder.supplierEmail} onChange={e => setCurrentOrder({
              ...currentOrder,
              supplierEmail: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Items (comma separated)
                </label>
                <textarea value={currentOrder.items} onChange={e => setCurrentOrder({
              ...currentOrder,
              items: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input type="date" value={currentOrder.date} onChange={e => setCurrentOrder({
              ...currentOrder,
              date: e.target.value
            })} className="w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select value={currentOrder.status} onChange={e => setCurrentOrder({
              ...currentOrder,
              status: e.target.value as any
            })} className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleEditOrder} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>}

      {/* Low Stock Order Modal */}
      {isLowStockModalOpen && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Low Stock Items</h3>
            <p className="text-sm text-gray-600 mb-4">
              These items are below their threshold levels. Select items to
              create orders for.
            </p>
            <div className="overflow-y-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map(item => <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleCreateOrderFromLowStock(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-xs">
                          <ShoppingCartIcon size={12} className="mr-1" />
                          Order
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsLowStockModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
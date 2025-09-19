import React, { useState, Component } from 'react';
import { AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, PackageIcon, FlaskConicalIcon, ShoppingCartIcon, CalendarIcon, CheckCircleIcon, ClockIcon, MailIcon, BellIcon } from 'lucide-react';
// Sample data for dashboard metrics
const inventoryMetrics = {
  totalLabItems: 1250,
  totalMedicines: 875,
  lowStockItems: 42,
  expiredItems: 8,
  pendingOrders: 8,
  recentDeliveries: 12,
  inventoryValue: 285750,
  monthlyComparison: 8.5 // percentage increase from last month
};
// Sample data for recent activity
const recentActivity = [{
  id: 1,
  type: 'medicine',
  action: 'added',
  item: 'Amoxicillin 500mg',
  quantity: 200,
  timestamp: 'Today, 10:23 AM'
}, {
  id: 2,
  type: 'order',
  action: 'delivered',
  item: 'Order #ORD-2023-089',
  timestamp: 'Today, 09:15 AM'
}, {
  id: 3,
  type: 'lab',
  action: 'updated',
  item: 'Microscope Slides',
  quantity: 150,
  timestamp: 'Yesterday, 04:45 PM'
}, {
  id: 4,
  type: 'medicine',
  action: 'low_stock',
  item: 'Lisinopril 10mg',
  quantity: 25,
  timestamp: 'Yesterday, 02:30 PM'
}, {
  id: 5,
  type: 'order',
  action: 'placed',
  item: 'Order #ORD-2023-090',
  timestamp: 'Yesterday, 11:20 AM'
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
// Sample data for expired items
const expiredItems = [{
  id: 1,
  name: 'Amoxicillin 250mg',
  category: 'Medicine',
  quantity: 45,
  expiryDate: '2023-09-30'
}, {
  id: 2,
  name: 'Ibuprofen 200mg',
  category: 'Medicine',
  quantity: 60,
  expiryDate: '2023-10-05'
}, {
  id: 3,
  name: 'Blood Culture Medium',
  category: 'Lab',
  quantity: 12,
  expiryDate: '2023-10-08'
}, {
  id: 4,
  name: 'Tetracycline 500mg',
  category: 'Medicine',
  quantity: 30,
  expiryDate: '2023-09-25'
}];
// Sample data for upcoming deliveries
const upcomingDeliveries = [{
  id: 1,
  orderNumber: 'ORD-2023-090',
  supplier: 'PharmaCorp',
  expectedDate: 'Tomorrow',
  items: 12
}, {
  id: 2,
  orderNumber: 'ORD-2023-092',
  supplier: 'MediSource',
  expectedDate: 'Oct 15',
  items: 8
}, {
  id: 3,
  orderNumber: 'ORD-2023-095',
  supplier: 'LabEquip Co.',
  expectedDate: 'Oct 18',
  items: 15
}];
export function Dashboard() {
  const [activeAlert, setActiveAlert] = useState<'low-stock' | 'expired'>('low-stock');
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const handleCreateOrder = (itemName: string) => {
    // In a real app, this would open a modal or redirect to create an order
    setOrderSuccess(itemName);
    // Reset success message after 3 seconds
    setTimeout(() => {
      setOrderSuccess(null);
    }, 3000);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Inventory Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 flex items-center">
            <CalendarIcon size={16} className="mr-1" />
            {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </span>
          <button className="relative p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
            <BellIcon size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {inventoryMetrics.lowStockItems + inventoryMetrics.expiredItems}
            </span>
          </button>
        </div>
      </div>

      {orderSuccess && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircleIcon size={20} className="mr-2" />
            <span>
              Order request for <strong>{orderSuccess}</strong> has been created
              and sent to the supplier.
            </span>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="text-green-600 hover:text-green-800">
            ×
          </button>
        </div>}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Inventory Items" value={inventoryMetrics.totalLabItems + inventoryMetrics.totalMedicines} icon={<PackageIcon className="text-indigo-600" />} change={inventoryMetrics.monthlyComparison} changeLabel="vs. last month" />
        <MetricCard title="Low Stock Items" value={inventoryMetrics.lowStockItems} icon={<AlertTriangleIcon className="text-amber-500" />} isNegative changeLabel="require attention" actionLabel="View All" />
        <MetricCard title="Expired Items" value={inventoryMetrics.expiredItems} icon={<ClockIcon className="text-red-500" />} isNegative changeLabel="need disposal" actionLabel="View All" />
        <MetricCard title="Inventory Value" value={`$${inventoryMetrics.inventoryValue.toLocaleString()}`} icon={<TrendingUpIcon className="text-green-600" />} change={inventoryMetrics.monthlyComparison} changeLabel="vs. last month" />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map(activity => <ActivityItem key={activity.id} activity={activity} />)}
          </div>
          <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All Activity
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Alert Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button className={`flex-1 py-3 px-4 text-center font-medium ${activeAlert === 'low-stock' ? 'bg-amber-50 text-amber-800 border-b-2 border-amber-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveAlert('low-stock')}>
                Low Stock ({lowStockItems.length})
              </button>
              <button className={`flex-1 py-3 px-4 text-center font-medium ${activeAlert === 'expired' ? 'bg-red-50 text-red-800 border-b-2 border-red-500' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveAlert('expired')}>
                Expired ({expiredItems.length})
              </button>
            </div>
            <div className="p-4">
              {activeAlert === 'low-stock' ? <div className="space-y-3">
                  {lowStockItems.map(item => <div key={item.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                          <div className="mt-1 flex items-center">
                            <p className="text-xs text-amber-600 font-semibold mr-2">
                              {item.quantity}/{item.threshold}
                            </p>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div className="bg-amber-500 h-1.5 rounded-full" style={{
                          width: `${item.quantity / item.threshold * 100}%`
                        }}></div>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleCreateOrder(item.name)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center">
                          <ShoppingCartIcon size={12} className="mr-1" />
                          Add Order
                        </button>
                      </div>
                    </div>)}
                </div> : <div className="space-y-3">
                  {expiredItems.map(item => <div key={item.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                          <div className="mt-1 flex items-center space-x-2">
                            <p className="text-xs text-gray-500">
                              Quantity:{' '}
                              <span className="font-semibold">
                                {item.quantity}
                              </span>
                            </p>
                            <p className="text-xs text-red-600 font-semibold">
                              Expired:{' '}
                              {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleCreateOrder(item.name)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center">
                          <ShoppingCartIcon size={12} className="mr-1" />
                          Replace
                        </button>
                      </div>
                    </div>)}
                </div>}
              <button className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium w-full text-center">
                View All{' '}
                {activeAlert === 'low-stock' ? 'Low Stock Items' : 'Expired Items'}
              </button>
            </div>
          </div>

          {/* Upcoming Deliveries */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Upcoming Deliveries
            </h3>
            <div className="space-y-3">
              {upcomingDeliveries.map(delivery => <div key={delivery.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-800">
                      {delivery.orderNumber}
                    </p>
                    <p className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {delivery.expectedDate}
                    </p>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <p className="text-gray-600">{delivery.supplier}</p>
                    <p className="text-gray-600">{delivery.items} items</p>
                  </div>
                </div>)}
            </div>
            <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All Orders
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAccessCard title="Lab Inventory" description="Manage laboratory equipment and supplies" icon={<FlaskConicalIcon size={24} className="text-purple-500" />} bgColor="bg-purple-50" linkText="Go to Lab Inventory" linkTo="lab" />
        <QuickAccessCard title="Medicine Inventory" description="Manage pharmaceutical products and medications" icon={<PackageIcon size={24} className="text-green-500" />} bgColor="bg-green-50" linkText="Go to Medicine Inventory" linkTo="medicine" />
        <QuickAccessCard title="Order Management" description="Track and manage inventory orders and deliveries" icon={<ShoppingCartIcon size={24} className="text-blue-500" />} bgColor="bg-blue-50" linkText="Go to Order Management" linkTo="orders" />
      </div>
    </div>;
}
// Helper Components
type MetricCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  isNegative?: boolean;
  isCount?: boolean;
  actionLabel?: string;
};
function MetricCard({
  title,
  value,
  icon,
  change,
  changeLabel,
  isNegative = false,
  isCount = false,
  actionLabel
}: MetricCardProps) {
  return <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
      </div>
      {changeLabel && <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            {change !== undefined && !isCount && <span className={`mr-1 ${isNegative ? 'text-red-500' : 'text-green-500'} flex items-center`}>
                {isNegative ? <ArrowDownIcon size={14} /> : <ArrowUpIcon size={14} />}
                {change}%
              </span>}
            {change !== undefined && isCount && <span className="mr-1 text-green-500 flex items-center">
                <CheckCircleIcon size={14} className="mr-1" />
                {change}
              </span>}
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
          {actionLabel && <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              {actionLabel}
            </button>}
        </div>}
    </div>;
}
type ActivityItemProps = {
  activity: {
    id: number;
    type: string;
    action: string;
    item: string;
    quantity?: number;
    timestamp: string;
  };
};
function ActivityItem({
  activity
}: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'medicine':
        return <PackageIcon size={16} className="text-green-500" />;
      case 'lab':
        return <FlaskConicalIcon size={16} className="text-purple-500" />;
      case 'order':
        return <ShoppingCartIcon size={16} className="text-blue-500" />;
      default:
        return <PackageIcon size={16} className="text-gray-500" />;
    }
  };
  const getActionColor = () => {
    switch (activity.action) {
      case 'added':
        return 'text-green-600';
      case 'updated':
        return 'text-blue-600';
      case 'low_stock':
        return 'text-amber-600';
      case 'delivered':
        return 'text-green-600';
      case 'placed':
        return 'text-indigo-600';
      default:
        return 'text-gray-600';
    }
  };
  const getActionText = () => {
    switch (activity.action) {
      case 'added':
        return 'Added new item';
      case 'updated':
        return 'Updated item';
      case 'low_stock':
        return 'Low stock alert';
      case 'delivered':
        return 'Order delivered';
      case 'placed':
        return 'New order placed';
      default:
        return activity.action;
    }
  };
  return <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="p-2 bg-gray-100 rounded-full">{getActivityIcon()}</div>
      <div className="flex-1">
        <div className="flex justify-between">
          <p className={`font-medium ${getActionColor()}`}>{getActionText()}</p>
          <span className="text-xs text-gray-500">{activity.timestamp}</span>
        </div>
        <p className="text-sm text-gray-800">{activity.item}</p>
        {activity.quantity && <p className="text-xs text-gray-500">Quantity: {activity.quantity}</p>}
      </div>
    </div>;
}
type QuickAccessCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  linkText: string;
  linkTo: string;
};
function QuickAccessCard({
  title,
  description,
  icon,
  bgColor,
  linkText,
  linkTo
}: QuickAccessCardProps) {
  return <div className={`rounded-xl shadow-sm overflow-hidden ${bgColor} border border-gray-100`}>
      <div className="p-6">
        <div className="p-3 bg-white rounded-lg inline-block mb-4 shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center" onClick={() => {}}>
          {linkText}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>;
}
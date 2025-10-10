import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Plus, 
  Activity, 
  ChevronDown,
  User,
  Search,
  Bell
} from 'lucide-react';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalInventory: 15,
    lowStock: 2,
    expiredItems: 4,
    inventoryValue: 285750,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all three inventory types
      const [medicinesRes, chemicalsRes, equipmentRes] = await Promise.all([
        axios.get('http://localhost:5000/api/medicines'),
        axios.get('http://localhost:5000/api/chemical-inventory'),
        axios.get('http://localhost:5000/api/equipment-inventory')
      ]);

      const medicines = medicinesRes.data.data || [];
      const chemicals = chemicalsRes.data.data || [];
      const equipment = equipmentRes.data.data || [];

      // Combine all items with their timestamps
      const allItems = [];

      // Add medicines
      medicines.forEach((medicine) => {
        allItems.push({
          type: medicine.updatedAt && medicine.updatedAt !== medicine.createdAt ? 'update' : 'add',
          item: `${medicine.medicineName} ${medicine.strength || ''}`.trim(),
          time: medicine.updatedAt && medicine.updatedAt !== medicine.createdAt 
            ? new Date(medicine.updatedAt) 
            : new Date(medicine.createdAt),
          quantity: medicine.quantity,
          category: 'Medicine'
        });
      });

      // Add chemicals
      chemicals.forEach((chemical) => {
        allItems.push({
          type: chemical.updatedAt && chemical.updatedAt !== chemical.createdAt ? 'update' : 'add',
          item: chemical.itemName,
          time: chemical.updatedAt && chemical.updatedAt !== chemical.createdAt 
            ? new Date(chemical.updatedAt) 
            : new Date(chemical.createdAt),
          quantity: chemical.quantity,
          category: 'Chemical'
        });
      });

      // Add equipment
      equipment.forEach((equip) => {
        allItems.push({
          type: equip.updatedAt && equip.updatedAt !== equip.createdAt ? 'update' : 'add',
          item: equip.itemName,
          time: equip.updatedAt && equip.updatedAt !== equip.createdAt 
            ? new Date(equip.updatedAt) 
            : new Date(equip.createdAt),
          quantity: equip.quantity,
          category: 'Equipment'
        });
      });

      // Sort by most recent and take top 5
      const sortedItems = allItems.sort((a, b) => b.time - a.time).slice(0, 5);

      // Format time for display
      const recentActivity = sortedItems.map(item => {
        const now = new Date();
        const diffInHours = (now - item.time) / (1000 * 60 * 60);
        
        let timeText;
        if (diffInHours < 1) {
          timeText = 'Just now';
        } else if (diffInHours < 24) {
          const hours = Math.floor(diffInHours);
          timeText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
          const days = Math.floor(diffInHours / 24);
          timeText = `${days} day${days > 1 ? 's' : ''} ago`;
        }

        return {
          ...item,
          time: timeText
        };
      });

      setDashboardData(prev => ({
        ...prev,
        recentActivity
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = [
    { name: 'Amoxicillin', quantity: 3, unit: 'capsules', status: 'low' },
    { name: 'Centrifuge Tubes', quantity: 4, unit: 'pcs', status: 'low' },
    { name: 'Amoxicillin', date: '1/30/2025', status: 'expired' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h2>
              <p className="text-gray-600">Monday, September 2, 2025</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/inventory-summary')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Activity className="w-5 h-5" />
                View Summary Report
              </button>
              <Bell className="w-6 h-6 text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="w-8 h-8 text-gray-600" />
                <span className="text-gray-700">Inventory Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left side - Statistics and Recent Activity */}
            <div className="col-span-8 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-4 gap-6">
                {/* Total Inventory */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Total Inventory Items</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.totalInventory}</p>
                      <p className="text-gray-500 text-sm mt-1">+3.5% vs last month</p>
                    </div>
                    <Package className="w-8 h-8 text-orange-400" />
                  </div>
                </div>

                {/* Low Stock */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.lowStock}</p>
                      <p className="text-gray-500 text-sm mt-1">items attention</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                </div>

                {/* Expired Items */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Expired Items</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{dashboardData.expiredItems}</p>
                      <p className="text-gray-500 text-sm mt-1">need disposal</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                {/* Inventory Value */}
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-400">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">${dashboardData.inventoryValue.toLocaleString()}</p>
                      <p className="text-gray-500 text-sm mt-1">+5.2% vs last month</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  <button 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    onClick={() => navigate('/activities')}
                  >
                    View All Activity
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  {dashboardData.recentActivity.length > 0 ? (
                    dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`${activity.type === 'update' ? 'bg-yellow-100' : 'bg-green-100'} p-2 rounded-full`}>
                          {activity.type === 'update' ? (
                            <Activity className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <Plus className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-800 font-medium">
                              {activity.type === 'update' ? 'Updated' : 'Added new'} {activity.category.toLowerCase()}
                            </span>
                          </div>
                          <p className="text-gray-900 font-semibold mt-1">{activity.item}</p>
                          <p className="text-gray-600 text-sm">Quantity: {activity.quantity}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              activity.category === 'Medicine' 
                                ? 'bg-blue-100 text-blue-700' 
                                : activity.category === 'Chemical'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {activity.category === 'Medicine' && '💊 Medicine'}
                              {activity.category === 'Chemical' && '🧪 Chemical'}
                              {activity.category === 'Equipment' && '🔧 Equipment'}
                            </span>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Stock Alerts */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow-sm h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Stock Alerts</h3>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="bg-orange-100 px-3 py-1 rounded-full">
                      <span className="text-orange-700 text-sm font-medium">Low Stock (2)</span>
                    </div>
                    <div className="bg-red-100 px-3 py-1 rounded-full">
                      <span className="text-red-700 text-sm font-medium">Expired (4)</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {lowStockItems.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            item.status === 'expired' 
                              ? 'bg-red-100' 
                              : 'bg-orange-100'
                          }`}>
                            {item.status === 'expired' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-600 text-sm">
                              {item.status === 'expired' 
                                ? `Expired: ${item.date}`
                                : `${item.quantity} ${item.unit} left`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {item.status !== 'expired' && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.quantity <= 3 ? 'bg-red-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min((item.quantity / 20) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium text-center py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
                    onClick={() => navigate('/low-stock-items')}
                  >
                    View All Low Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;

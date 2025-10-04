import React from 'react';
import { Users, Shield, Stethoscope, Settings, Lock } from 'lucide-react';

/**
 * 👥 User Statistics Cards Component
 * 
 * Features:
 * ✅ Real database-driven user statistics
 * ✅ Role-based breakdown cards
 * ✅ Account status tracking
 * ✅ Professional styling with color themes
 * ✅ No trends or ML - pure database data
 */

export const UserStatisticsCards = ({ userData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate real statistics from database data
  const stats = {
    totalUsers: userData.length,
    admins: userData.filter(u => u.role === 'Admin').length,
    doctors: userData.filter(u => u.role === 'Doctor').length,
    supportStaff: userData.filter(u => 
      ['LabStaff', 'LabSupervisor', 'Technician', 'Pharmacist', 'InventoryManager'].includes(u.role)
    ).length,
    patients: userData.filter(u => u.role === 'Patient').length,
    lockedAccounts: userData.filter(u => u.isLocked).length,
    activeAccounts: userData.filter(u => !u.isLocked).length
  };

  // Calculate percentages
  const calculatePercentage = (value, total) => 
    total > 0 ? Math.round((value / total) * 100) : 0;

  const userStatsCards = [
    {
      title: 'Administrators',
      count: stats.admins,
      total: stats.totalUsers,
      percentage: calculatePercentage(stats.admins, stats.totalUsers),
      icon: <Shield className="h-6 w-6" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: 'System administrators',
      breakdown: [
        { label: 'Total Admins', value: stats.admins },
        { label: 'Active', value: userData.filter(u => u.role === 'Admin' && !u.isLocked).length },
        { label: 'Locked', value: userData.filter(u => u.role === 'Admin' && u.isLocked).length }
      ]
    },
    {
      title: 'Medical Staff',
      count: stats.doctors,
      total: stats.totalUsers,
      percentage: calculatePercentage(stats.doctors, stats.totalUsers),
      icon: <Stethoscope className="h-6 w-6" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Doctors & medical professionals',
      breakdown: [
        { label: 'Total Doctors', value: stats.doctors },
        { label: 'Active', value: userData.filter(u => u.role === 'Doctor' && !u.isLocked).length },
        { label: 'Locked', value: userData.filter(u => u.role === 'Doctor' && u.isLocked).length }
      ]
    },
    {
      title: 'Support Staff',
      count: stats.supportStaff,
      total: stats.totalUsers,
      percentage: calculatePercentage(stats.supportStaff, stats.totalUsers),
      icon: <Settings className="h-6 w-6" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Lab, pharmacy & technical staff',
      breakdown: [
        { label: 'Lab Staff', value: userData.filter(u => ['LabStaff', 'LabSupervisor'].includes(u.role)).length },
        { label: 'Technicians', value: userData.filter(u => u.role === 'Technician').length },
        { label: 'Pharmacy', value: userData.filter(u => u.role === 'Pharmacist').length },
        { label: 'Inventory', value: userData.filter(u => u.role === 'InventoryManager').length }
      ]
    },
    {
      title: 'Total Users',
      count: stats.totalUsers,
      total: stats.totalUsers,
      percentage: 100,
      icon: <Users className="h-6 w-6" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'All registered users',
      breakdown: [
        { label: 'Active Users', value: stats.activeAccounts },
        { label: 'Locked Accounts', value: stats.lockedAccounts },
        { label: 'Patients', value: stats.patients }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {userStatsCards.map((card, index) => (
        <div 
          key={index}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <span className={card.textColor}>
                {card.icon}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${card.textColor}`}>
                {card.count}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {card.percentage}% of total
              </p>
            </div>
          </div>

          {/* Card Title */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {card.title}
            </h3>
            <p className="text-sm text-gray-500">
              {card.description}
            </p>
          </div>

          {/* Breakdown Statistics */}
          <div className="space-y-2">
            {card.breakdown.map((item, breakdownIndex) => (
              <div key={breakdownIndex} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-${card.color}-500 transition-all duration-500`}
                style={{ width: `${card.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
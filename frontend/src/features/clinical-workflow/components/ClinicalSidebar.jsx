import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Pill, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Stethoscope,
  Activity,
  Home
} from 'lucide-react';

/**
 * 🩺 Clinical Sidebar - Medical Navigation Component
 * 
 * Features:
 * ✅ Medical-themed navigation menu
 * ✅ Collapsible sidebar functionality
 * ✅ Active route highlighting
 * ✅ Professional medical styling
 * ✅ Responsive design
 */

export const ClinicalSidebar = ({ isCollapsed, onToggle, currentPath }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState(currentPath || '/clinical/dashboard');

  const navigationItems = [
    {
      id: 'dashboard',
      title: 'Clinical Dashboard',
      icon: <Activity className="h-5 w-5" />,
      path: '/clinical/dashboard',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      id: 'medical-records',
      title: 'Medical Records',
      icon: <FileText className="h-5 w-5" />,
      path: '/patient/all',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'prescriptions',
      title: 'Prescriptions',
      icon: <Pill className="h-5 w-5" />,
      path: '/prescription/all',
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      id: 'calendar',
      title: 'Doctor Calendar',
      icon: <Calendar className="h-5 w-5" />,
      path: '/doctor-availability',
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    {
      id: 'profile',
      title: 'Doctor Profile',
      icon: <User className="h-5 w-5" />,
      path: '/doctor-profile',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    }
  ];

  const handleNavigation = (item) => {
    setActiveItem(item.path);
    navigate(item.path);
  };

  const isActive = (path) => {
    return activeItem === path || currentPath === path;
  };

  return (
    <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white shadow-2xl border-r border-gray-200 transition-all duration-300 z-30 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-emerald-600">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <Stethoscope className="h-6 w-6 text-black" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Clinical Portal</h2>
                <p className="text-blue-100 text-sm">Medical Navigation</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onToggle}
            className="p-2 bg-white bg-opacity-20 text-black rounded-lg hover:bg-opacity-30 transition-all duration-200"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path)
                ? `${item.color} shadow-lg transform scale-105`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={isCollapsed ? item.title : ''}
          >
            <div className={`p-2 rounded-lg ${
              isActive(item.path) 
                ? 'bg-white shadow-md' 
                : 'group-hover:bg-white group-hover:shadow-sm'
            }`}>
              {item.icon}
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs opacity-75">
                  {item.id === 'dashboard' && 'Clinical overview'}
                  {item.id === 'medical-records' && 'Patient records'}
                  {item.id === 'prescriptions' && 'Medication management'}
                  {item.id === 'calendar' && 'Schedule management'}
                  {item.id === 'profile' && 'Professional settings'}
                </p>
              </div>
            )}
            
            {!isCollapsed && isActive(item.path) && (
              <div className="w-1 h-6 bg-white rounded-full shadow-sm"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Medical Portal</p>
                <p className="text-xs text-gray-600">Version 2.0</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Secure clinical workflow management system for healthcare professionals.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalSidebar;
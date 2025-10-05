import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  Calendar, 
  BarChart3, 
  Users, 
  Package, 
  Settings, 
  Menu, 
  X 
} from 'lucide-react';

// 📋 This is our navigation sidebar - think of it as the main menu for our clinic system!
// For your university project, this shows all the different sections users can access
export const Sidebar = ({ isExpanded, onToggle, currentPage, onPageChange }) => {

  // 📋 Here's our menu items array - each item represents a different section of our clinic system
  // For your project, we'll focus on the ones that actually have backend support
  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      page: 'dashboard'
    },
    {
      name: 'Work Requests', // ✅ This connects to your maintenance requests backend!
      icon: <ClipboardList className="h-5 w-5" />,
      page: 'work-requests'
    },
    {
      name: 'Equipment Status', // ✅ This connects to your equipment backend!
      icon: <Activity className="h-5 w-5" />,
      page: 'equipment'
    },
    {
      name: 'Maintenance Calendar', // ✅ This connects to your maintenance calendar!
      icon: <Calendar className="h-5 w-5" />,
      page: 'calendar'
    },
    {
      name: 'Reports', // 📊 Future feature - not implemented yet
      icon: <BarChart3 className="h-5 w-5" />,
      page: 'reports'
    },
    {
      name: 'Technicians', // ✅ This connects to your technicians backend!
      icon: <Users className="h-5 w-5" />,
      page: 'technicians'
    },
    {
      name: 'Settings', // ⚙️ Future feature - not implemented yet
      icon: <Settings className="h-5 w-5" />,
      page: 'settings'
    }
  ];

  const handleNavigation = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <>
      {/* 🍔 Sidebar toggle button - now always visible for both mobile and desktop */}
      {/* This button allows users to collapse/expand the sidebar on any screen size */}
      <button 
        onClick={onToggle} 
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg" 
        aria-label="Toggle sidebar"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 🏢 Main sidebar container - now collapsible on all screen sizes */}
      {/* When collapsed: shows only icons (64px wide), When expanded: shows full menu (256px wide) */}
      <aside className={`
        bg-white border-r border-gray-200 flex-shrink-0 
        fixed inset-y-0 left-0 transition-all duration-300 ease-in-out z-10
        ${isExpanded ? 'w-64' : 'w-16'}
      `}>
        
        {/* 🏥 Header section - clean space for visual separation */}
        {/* Maintains the header area but without any branding text for a minimalist look */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-2">
          {/* Empty space - provides visual separation between toggle button and navigation */}
        </div>

        {/* 🧭 Navigation menu - now adaptive based on sidebar state! */}
        <nav className="mt-5 px-2 space-y-1">
          {menuItems.map(item => (
            <button 
              key={item.name} 
              onClick={() => handleNavigation(item.page)}
              className={`
                group flex items-center py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left
                ${isExpanded ? 'px-2' : 'px-2 justify-center'}
                ${currentPage === item.page
                  ? 'bg-blue-50 text-blue-600' // Active item styling - highlighted!
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900' // Normal item styling
                }
              `}
              title={!isExpanded ? item.name : ''} // Show tooltip when collapsed
            >
              {/* 🎨 Icon with dynamic coloring based on active state */}
              <span className={`${currentPage === item.page ? 'text-blue-600' : 'text-gray-500'} ${isExpanded ? 'mr-3' : ''}`}>
                {item.icon}
              </span>
              {/* 📝 Text label - only show when expanded */}
              {isExpanded && (
                <span className="truncate">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

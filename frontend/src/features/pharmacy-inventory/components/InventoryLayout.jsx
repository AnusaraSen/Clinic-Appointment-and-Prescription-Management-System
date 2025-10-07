import React, { useState, useMemo } from 'react';
import InventoryNavigationSidebar from './InventoryNavigationSidebar';
import '../../../styles/InventoryNavigationSidebar.css';

// Layout that aligns content with fixed sidebar and exposes a top toggle arrow.
const InventoryLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const layoutClass = useMemo(
    () => `inventory-nav-layout${collapsed ? ' sidebar-collapsed' : ''}`,
    [collapsed]
  );

  return (
    <div className="inventory-with-navbar" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <InventoryNavigationSidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />

      {/* Content aligned with sidebar */}
      <div className={layoutClass}>
        <div className="inventory-nav-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InventoryLayout;

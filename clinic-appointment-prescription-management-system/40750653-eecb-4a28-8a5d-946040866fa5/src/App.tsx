import React, { useState } from 'react';
import { RoleSelection } from './components/RoleSelection';
import { InventoryManagerDashboard } from './pages/InventoryManager/InventoryManagerDashboard';
import { PharmacistDashboard } from './pages/Pharmacist/PharmacistDashboard';
export function App() {
  const [selectedRole, setSelectedRole] = useState<'' | 'pharmacist' | 'inventory'>('');
  if (!selectedRole) {
    return <RoleSelection onSelectRole={setSelectedRole} />;
  }
  return <div className="min-h-screen bg-gray-50">
      {selectedRole === 'inventory' ? <InventoryManagerDashboard onLogout={() => setSelectedRole('')} /> : <PharmacistDashboard onLogout={() => setSelectedRole('')} />}
    </div>;
}
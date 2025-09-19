import React, { useState } from 'react';
import { Header } from '../../components/Layout/Header';
import { LabInventory } from './LabInventory';
import { MedicineInventory } from './MedicineInventory';
import { OrderManagement } from './OrderManagement';
import { Dashboard } from './Dashboard';
import { Profile } from './Profile';
import { FlaskConicalIcon, PillIcon, ShoppingCartIcon, LayoutDashboardIcon, UserIcon } from 'lucide-react';
type InventoryManagerDashboardProps = {
  onLogout: () => void;
};
export function InventoryManagerDashboard({
  onLogout
}: InventoryManagerDashboardProps) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'lab' | 'medicine' | 'orders' | 'profile'>('dashboard');
  return <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Inventory Manager Dashboard" role="Inventory Manager" onLogout={onLogout} />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar Navigation */}
        <aside className="bg-indigo-800 text-white md:w-64 p-4">
          <nav className="space-y-2">
            <NavItem label="Dashboard" icon={<LayoutDashboardIcon size={20} />} isActive={activeModule === 'dashboard'} onClick={() => setActiveModule('dashboard')} />
            <NavItem label="Lab Inventory" icon={<FlaskConicalIcon size={20} />} isActive={activeModule === 'lab'} onClick={() => setActiveModule('lab')} />
            <NavItem label="Medicine Inventory" icon={<PillIcon size={20} />} isActive={activeModule === 'medicine'} onClick={() => setActiveModule('medicine')} />
            <NavItem label="Order Management" icon={<ShoppingCartIcon size={20} />} isActive={activeModule === 'orders'} onClick={() => setActiveModule('orders')} />
            <NavItem label="My Profile" icon={<UserIcon size={20} />} isActive={activeModule === 'profile'} onClick={() => setActiveModule('profile')} />
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeModule === 'dashboard' && <Dashboard />}
          {activeModule === 'lab' && <LabInventory />}
          {activeModule === 'medicine' && <MedicineInventory />}
          {activeModule === 'orders' && <OrderManagement />}
          {activeModule === 'profile' && <Profile />}
        </main>
      </div>
    </div>;
}
type NavItemProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
};
function NavItem({
  label,
  icon,
  isActive,
  onClick
}: NavItemProps) {
  return <button onClick={onClick} className={`flex items-center w-full p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-700'}`}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>;
}
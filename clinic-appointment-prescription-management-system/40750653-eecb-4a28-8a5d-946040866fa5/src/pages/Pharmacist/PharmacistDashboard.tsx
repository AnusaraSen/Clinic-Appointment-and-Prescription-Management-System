import React, { useState } from 'react';
import { Header } from '../../components/Layout/Header';
import { Prescriptions } from './Prescriptions';
import { DispensingModule } from './DispensingModule';
import { Dashboard } from './Dashboard';
import { Profile } from './Profile';
import { ClipboardIcon, PackageIcon, LayoutDashboardIcon, UserIcon } from 'lucide-react';
type PharmacistDashboardProps = {
  onLogout: () => void;
};
export function PharmacistDashboard({
  onLogout
}: PharmacistDashboardProps) {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'prescriptions' | 'dispensing' | 'profile'>('dashboard');
  return <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title="Pharmacist Dashboard" role="Pharmacist" onLogout={onLogout} />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar Navigation */}
        <aside className="bg-blue-800 text-white md:w-64 p-4">
          <nav className="space-y-2">
            <NavItem label="Dashboard" icon={<LayoutDashboardIcon size={20} />} isActive={activeModule === 'dashboard'} onClick={() => setActiveModule('dashboard')} />
            <NavItem label="Prescriptions" icon={<ClipboardIcon size={20} />} isActive={activeModule === 'prescriptions'} onClick={() => setActiveModule('prescriptions')} />
            <NavItem label="Dispensing Module" icon={<PackageIcon size={20} />} isActive={activeModule === 'dispensing'} onClick={() => setActiveModule('dispensing')} />
            <NavItem label="My Profile" icon={<UserIcon size={20} />} isActive={activeModule === 'profile'} onClick={() => setActiveModule('profile')} />
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeModule === 'dashboard' && <Dashboard />}
          {activeModule === 'prescriptions' && <Prescriptions />}
          {activeModule === 'dispensing' && <DispensingModule />}
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
  return <button onClick={onClick} className={`flex items-center w-full p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'}`}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>;
}
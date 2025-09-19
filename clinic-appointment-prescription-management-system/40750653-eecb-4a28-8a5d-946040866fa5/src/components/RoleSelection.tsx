import React from 'react';
import { ClipboardListIcon, PackageIcon } from 'lucide-react';
type RoleSelectionProps = {
  onSelectRole: (role: 'pharmacist' | 'inventory') => void;
};
export function RoleSelection({
  onSelectRole
}: RoleSelectionProps) {
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Pharmacy & Inventory Management
        </h1>
        <p className="text-gray-600">Please select your role to continue</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <RoleCard title="Pharmacist" description="Manage prescriptions and dispense medicines to patients" icon={<ClipboardListIcon size={48} className="text-blue-600" />} onClick={() => onSelectRole('pharmacist')} />
        <RoleCard title="Inventory Manager" description="Manage lab and medicine inventory, handle orders" icon={<PackageIcon size={48} className="text-indigo-600" />} onClick={() => onSelectRole('inventory')} />
      </div>
    </div>;
}
type RoleCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
};
function RoleCard({
  title,
  description,
  icon,
  onClick
}: RoleCardProps) {
  return <button onClick={onClick} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center border border-gray-100 hover:border-blue-200">
      <div className="mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </button>;
}
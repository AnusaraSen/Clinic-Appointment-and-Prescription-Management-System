import React from 'react';
import { UserIcon, LogOutIcon } from 'lucide-react';
type HeaderProps = {
  title: string;
  role: string;
  onLogout: () => void;
};
export function Header({
  title,
  role,
  onLogout
}: HeaderProps) {
  return <header className="bg-white shadow-sm py-4 px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-600">
            <UserIcon size={18} className="mr-2" />
            <span>{role}</span>
          </div>
          <button onClick={onLogout} className="flex items-center text-red-600 hover:text-red-800">
            <LogOutIcon size={18} className="mr-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>;
}
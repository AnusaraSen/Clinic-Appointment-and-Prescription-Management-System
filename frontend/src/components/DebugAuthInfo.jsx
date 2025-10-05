import React from 'react';
import { useAuth } from '../features/authentication/context/AuthContext';

const DebugAuthInfo = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log('DebugAuthInfo: Full auth state:', { user, isAuthenticated, isLoading });
  
  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Auth Info</h3>
      <div className="text-sm space-y-1">
        <div><strong>Is Loading:</strong> {String(isLoading)}</div>
        <div><strong>Is Authenticated:</strong> {String(isAuthenticated)}</div>
        <div><strong>User Role:</strong> {user?.role || 'No role'}</div>
        <div><strong>User Name:</strong> {user?.name || user?.firstName + ' ' + user?.lastName || 'No name'}</div>
        <div><strong>User Email:</strong> {user?.email || 'No email'}</div>
        <div><strong>User ID:</strong> {user?.id || user?._id || 'No ID'}</div>
        <div><strong>Current URL:</strong> {window.location.pathname}</div>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-yellow-700">Full User Object</summary>
        <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(user, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DebugAuthInfo;
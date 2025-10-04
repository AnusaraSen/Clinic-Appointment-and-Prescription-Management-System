import React, { useState, useMemo } from 'react';
import { Search, Filter, Lock, Unlock, Mail, User, Shield, Edit3, Trash2, UserX, Plus } from 'lucide-react';
import AddUserModal from './AddUserModal';
import { DeleteUserModal } from './DeleteUserModal';

/**
 * 📋 Latest Users Table Component
 * 
 * Features:
 * ✅ Complete user list from database
 * ✅ Search and filter functionality
 * ✅ Role-based styling and indicators
 * ✅ Account status management
 * ✅ Responsive table design
 * ✅ No trends - pure database display
 */

export const LatestUsersTable = ({ userData, loading, onView, onEdit, onDelete, onDeactivate, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(userData.map(user => user.role))];
    return roles.sort();
  }, [userData]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && !user.isLocked) ||
        (statusFilter === 'locked' && user.isLocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userData, searchTerm, roleFilter, statusFilter]);

  // Role color mapping
  const getRoleColor = (role) => {
    const roleColors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Doctor': 'bg-blue-100 text-blue-800',
      'LabStaff': 'bg-green-100 text-green-800',
      'LabSupervisor': 'bg-green-100 text-green-800',
      'Technician': 'bg-orange-100 text-orange-800',
      'Pharmacist': 'bg-cyan-100 text-cyan-800',
      'InventoryManager': 'bg-indigo-100 text-indigo-800',
      'Patient': 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  // Get role icon
  const getRoleIcon = (role) => {
    if (role === 'Admin') return <Shield className="h-4 w-4" />;
    if (role === 'Doctor') return <User className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header with Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Users Directory</h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredUsers.length} of {userData.length} users
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option key="roles-all" value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option key="userstatus-all" value="all">All Status</option>
              <option key="userstatus-active" value="active">Active</option>
              <option key="userstatus-locked" value="locked">Locked</option>
            </select>
            
            {/* Add User Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="ml-2 inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newUser) => {
            setShowAddModal(false);
            // trigger optional create callback to refresh data in parent
            if (onCreate) onCreate(newUser);
          }}
        />
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  {/* User Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1 ${
                      user.isLocked 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      {user.isLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>

                  {/* User ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.user_id}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => (onView ? onView(user) : console.log('View user', user))}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors"
                        aria-label={`View ${user.name}`}
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        onClick={() => (onEdit ? onEdit(user) : console.log('Edit user', user))}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-900 transition-colors"
                        aria-label={`Edit ${user.name}`}
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-900 transition-colors"
                        aria-label={`Delete ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>

                      <button
                        onClick={() => {
                          const confirmMessage = user.isLocked
                            ? `Reactivate ${user.name}?`
                            : `Deactivate ${user.name}?`;
                          if (window.confirm(confirmMessage)) {
                            if (onDeactivate) onDeactivate(user);
                            else console.log(user.isLocked ? 'Reactivate user' : 'Deactivate user', user);
                          }
                        }}
                        className={`flex items-center gap-2 transition-colors ${user.isLocked ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}`}
                        aria-label={`${user.isLocked ? 'Reactivate' : 'Deactivate'} ${user.name}`}
                      >
                        <UserX className="h-4 w-4" />
                        <span className="hidden sm:inline">{user.isLocked ? 'Reactivate' : 'Deactivate'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Filter className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {filteredUsers.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Total: {filteredUsers.length} users
            </span>
            <div className="flex items-center space-x-4">
              <span>Active: {filteredUsers.filter(u => !u.isLocked).length}</span>
              <span>Locked: {filteredUsers.filter(u => u.isLocked).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          user={deleteUser}
          isLoading={deleteLoading}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteUser(null);
          }}
          onConfirm={async (userId) => {
            try {
              setDeleteLoading(true);
              if (onDelete) await onDelete(userId, deleteUser);
              setShowDeleteModal(false);
              setDeleteUser(null);
            } catch (err) {
              console.error('Failed to delete user', err);
            } finally {
              setDeleteLoading(false);
            }
          }}
        />
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { LatestUsersTable } from "../components/LatestUsersTable";
import UserDetailsModal from "../components/UserDetailsModal";
import { EditUserModal } from "../components/EditUserModal";
import { DeleteUserModal } from "../components/DeleteUserModal";
import DeactivateUserModal from "../components/DeactivateUserModal";

const UsersPage = ({ onNavigate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsersList = async () => {
    let mounted = true;
    try {
      const candidateUrls = ['/api/users', 'http://localhost:5000/api/users'];
      let lastError = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          const text = await res.text();
          const contentType = res.headers.get('content-type') || '';

          if (!res.ok) {
            throw new Error(`${url} responded ${res.status}: ${text}`);
          }

          if (contentType.includes('text/html') || text.trim().startsWith('<!doctype')) {
            lastError = new Error(`${url} returned HTML instead of JSON`);
            continue;
          }

          let payload;
          try {
            payload = JSON.parse(text);
          } catch (parseErr) {
            throw new Error(`${url} returned non-JSON response`);
          }

          if (mounted) {
            const normalized = (payload.data || []).map(u => ({
              ...u,
              isLocked: !!(u.lockUntil && new Date(u.lockUntil) > Date.now())
            }));
            setUsers(normalized);
          }
          lastError = null;
          break;
        } catch (innerErr) {
          lastError = innerErr;
        }
      }

      if (lastError) throw lastError;
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
    return () => { mounted = false; };
  };

  useEffect(() => {
    let mounted = true;
    fetchUsersList();
    return () => { mounted = false; };
  }, []);

  // Helper: refresh the list (shows loading while fetching)
  const refreshList = async () => {
    setLoading(true);
    setError(null);
    await fetchUsersList();
  };

  // Action handlers
  const handleView = async (user) => {
    try {
      // Fetch full user details from the individual user endpoint
      const userId = user.id || user._id;
      const candidateUrls = [`/api/users/${userId}`, `http://localhost:5000/api/users/${userId}`];
      let fullUserData = null;
      let lastError = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          const text = await res.text();
          const contentType = res.headers.get('content-type') || '';

          if (!res.ok) {
            throw new Error(`${url} responded ${res.status}: ${text}`);
          }

          if (contentType.includes('text/html') || text.trim().startsWith('<!doctype')) {
            lastError = new Error(`${url} returned HTML instead of JSON`);
            continue;
          }

          let payload;
          try {
            payload = JSON.parse(text);
          } catch (parseErr) {
            throw new Error(`${url} returned non-JSON response`);
          }

          fullUserData = payload.data;
          if (fullUserData) {
            fullUserData.isLocked = !!(fullUserData.lockUntil && new Date(fullUserData.lockUntil) > Date.now());
          }
          lastError = null;
          break;
        } catch (innerErr) {
          lastError = innerErr;
        }
      }

      if (lastError) {
        console.error('Failed to fetch user details:', lastError);
        // Fallback to using the limited data from the list
        setSelectedUser(user);
      } else {
        console.log('Full user data fetched:', fullUserData);
        setSelectedUser(fullUserData);
      }
      
      setShowDetailsModal(true);
    } catch (err) {
      console.error('Error in handleView:', err);
      // Fallback to using the limited data from the list
      setSelectedUser(user);
      setShowDetailsModal(true);
    }
  };

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const handleEdit = async (user) => {
    try {
      // Fetch full user details for editing
      const userId = user.id || user._id;
      const candidateUrls = [`/api/users/${userId}`, `http://localhost:5000/api/users/${userId}`];
      let fullUserData = null;
      let lastError = null;

      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          const text = await res.text();
          const contentType = res.headers.get('content-type') || '';

          if (!res.ok) {
            throw new Error(`${url} responded ${res.status}: ${text}`);
          }

          if (contentType.includes('text/html') || text.trim().startsWith('<!doctype')) {
            lastError = new Error(`${url} returned HTML instead of JSON`);
            continue;
          }

          let payload;
          try {
            payload = JSON.parse(text);
          } catch (parseErr) {
            throw new Error(`${url} returned non-JSON response`);
          }

          fullUserData = payload.data;
          if (fullUserData) {
            fullUserData.isLocked = !!(fullUserData.lockUntil && new Date(fullUserData.lockUntil) > Date.now());
          }
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (fullUserData) {
        setSelectedUser(fullUserData);
      } else {
        // Fallback to using the limited data from the list
        setSelectedUser(user);
      }
      
      setShowEditModal(true);
    } catch (err) {
      console.error('Error in handleEdit:', err);
      // Fallback to using the limited data from the list
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  const handleDelete = (id, user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (id, user) => {
    setIsDeleting(true);
    try {
      const candidateUrls = [`/api/users/${id}`, `http://localhost:5000/api/users/${id}`];
      let lastErr = null;
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, { method: 'DELETE' });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`${url} responded ${res.status}: ${text}`);
          }
          // Success
          await refreshList();
          setShowDeleteModal(false);
          setSelectedUser(null);
          return;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user: ' + (err.message || 'unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      const candidateUrls = [`/api/users/${id}`, `http://localhost:5000/api/users/${id}`];
      let lastErr = null;
      
      for (const url of candidateUrls) {
        try {
          const res = await fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
          
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`${url} responded ${res.status}: ${text}`);
          }
          
          // Success
          await refreshList();
          setShowEditModal(false);
          setSelectedUser(null);
          return;
        } catch (err) {
          lastErr = err;
        }
      }
      throw lastErr;
    } catch (err) {
      console.error('Failed to update user', err);
      throw new Error('Failed to update user: ' + (err.message || 'unknown error'));
    }
  };

  const handleDeactivate = async (user) => {
    // Open the Deactivate modal and let the user confirm there
    setSelectedUser(user);
    setShowDeactivateModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header Banner */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  User Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Comprehensive user account management and access control
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>
        )}
        <LatestUsersTable
          userData={users}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeactivate={handleDeactivate}
          onCreate={refreshList}
        />
      </div>

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={() => { setShowDetailsModal(false); setSelectedUser(null); }}
          user={selectedUser}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          user={selectedUser}
          onUpdate={handleUpdate}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
          user={selectedUser}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {showDeactivateModal && selectedUser && (
        <DeactivateUserModal
          isOpen={showDeactivateModal}
          onClose={() => { setShowDeactivateModal(false); setSelectedUser(null); }}
          user={selectedUser}
          isLoading={isTogglingActive}
          onConfirm={async (userToToggle) => {
            const id = userToToggle.id || userToToggle._id || userToToggle.user_id;
            const newLocked = !userToToggle.isLocked;
            // Optimistic update: toggle locally so UI updates immediately
            const previousUsers = users;
            setUsers(prev => prev.map(u => {
              const matchId = u.id || u._id || u.user_id;
              if (!matchId) return u;
              return (matchId === id) ? { ...u, isLocked: newLocked } : u;
            }));

            setIsTogglingActive(true);
            try {
              const body = { isLocked: newLocked };
              const candidateUrls = [`/api/users/${id}`, `http://localhost:5000/api/users/${id}`];
              let lastErr = null;
              for (const url of candidateUrls) {
                try {
                  const res = await fetch(url, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                  });
                  if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`${url} responded ${res.status}: ${text}`);
                  }
                  // Success: refresh list to ensure canonical data
                  await refreshList();
                  setShowDeactivateModal(false);
                  setSelectedUser(null);
                  return;
                } catch (err) {
                  lastErr = err;
                }
              }
              throw lastErr;
            } catch (err) {
              console.error('Failed to update user status', err);
              // revert optimistic update
              setUsers(previousUsers);
              alert('Failed to update user status: ' + (err.message || 'unknown error'));
            } finally {
              setIsTogglingActive(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;

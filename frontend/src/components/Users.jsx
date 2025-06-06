import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, Shield, User, Crown, Ban, CheckCircle, XCircle, Eye } from 'lucide-react';
import { axiosInstance } from "../lib/axios";
import styles from '../styles/UsersStyles';
import toast from 'react-hot-toast';
import "../styles/UserStyles.css";
import { useNavigate } from 'react-router-dom';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const navigate = useNavigate()

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/getAllUsers');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/users/admin/search?q=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(response.data.users);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const updateUserRole = async (id, newRole) => {
    try {
      const res = await axiosInstance.patch(`/users/updateProfile/${id}`, { role: newRole });

      if (res.data.success) {
        toast.success("Role update successful");
        fetchAllUsers(); // Refresh the list
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);

      if (error.response) {
        if (error.response.status === 403) {
          toast.error('You do not have permission to update user roles');
        } else if (error.response.status === 404) {
          toast.error('User not found');
        } else if (error.response.status === 400) {
          toast.error('Invalid role value');
        } else {
          toast.error('Failed to update user role. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('Network error. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const updateAccountStatus = async (id, newStatus) => {
    try {
      const res = await axiosInstance.patch(`/users/updateProfile/${id}`, { accountStatus: newStatus });

      if (res.data.success) {
        toast.success("Status update successful");
        fetchAllUsers(); // Refresh the list
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating account status:', error);

      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
        toast.error(`Failed to update account status: ${error.response.data?.message || 'Server error'}`);
      } else {
        toast.error('Network error. Please try again.');
      }
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await axiosInstance.delete(`/users/deleteUser/${id}`);

      if (res.data.success) {
        toast.success('User deleted successfully');
        fetchAllUsers(); // Refresh the list
        setShowDeleteModal(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return <Crown style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'admin': return <Shield style={{ width: '16px', height: '16px', color: '#3b82f6' }} />;
      default: return <User style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'inactive': return <XCircle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'banned': return <Ban style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
      default: return <XCircle style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const UserCard = ({ user, isSearchResult = false }) => (
    <div style={styles.userCard}>
      <div style={styles.cardContent}>
        <div style={styles.cardHeader}>
          <div style={styles.userInfo}>
            <div style={styles.avatarContainer}>
              <img
                src={user.profilePicture || "https://avatar.iran.liara.run/public/1.png"}
                alt={user.username}
                style={styles.avatar}
                onClick={() => handleNavigateToProfile(user.id)}
              />
              <div style={styles.roleIconContainer}>
                {getRoleIcon(user.role)}
              </div>
            </div>
            <div style={styles.userDetails}>
              <div style={styles.nameContainer}>
                <h3 style={styles.userName} onClick={() => handleNavigateToProfile(user.id)} >{user.firstName} {user.lastName}</h3>
                {getStatusIcon(user.accountStatus)}
              </div>
              <p style={styles.username} onClick={() => handleNavigateToProfile(user.id)}>@{user.username}</p>
              <p style={styles.email} onClick={() => handleNavigateToProfile(user.id)}>{user.email}</p>
            </div>
          </div>

          {!isSearchResult && (
            <div style={styles.actionButtons}>
              <button
                onClick={() => setEditingUser(user)}
                style={styles.editButton}
              >
                <Edit3 style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setShowDeleteModal(user)}
                style={styles.deleteButton}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}
        </div>

        <div style={styles.roleStatusContainer}>
          <div style={styles.roleBox}>
            <div style={styles.roleLabel}>Role</div>
            <div style={styles.roleValue}>{user.role?.replace('_', ' ')}</div>
          </div>
          <div style={styles.statusBox}>
            <div style={styles.statusLabel}>Status</div>
            <div style={styles.statusValue}>{user.accountStatus}</div>
          </div>
        </div>

        {!isSearchResult && (
          <div style={styles.statsContainer}>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{user.friendsCount || 0}</div>
              <div style={styles.statLabel}>Friends</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{user.postsCount || 0}</div>
              <div style={styles.statLabel}>Posts</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNumber}>{user.friendRequestCount || 0}</div>
              <div style={styles.statLabel}>Requests</div>
            </div>
          </div>
        )}

        {user.bio && (
          <p style={styles.bio}>"{user.bio}"</p>
        )}

        {user.location && (
          <p style={styles.location}>📍 {user.location}</p>
        )}

        {!isSearchResult && user.lastLogin && (
          <div style={styles.lastLogin}>
            Last login: {formatDate(user.lastLogin)}
          </div>
        )}
      </div>
    </div>
  );

  const handleNavigateToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };


  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Manage users, roles, and permissions</p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchUsers(e.target.value);
              }}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Search Results</h2>
              <button
                onClick={() => {
                  setShowSearchResults(false);
                  setSearchTerm('');
                }}
                style={styles.clearButton}
              >
                Clear Search
              </button>
            </div>
            <div style={styles.grid}>
              {searchResults.map((user) => (
                <UserCard key={user.id} user={user} isSearchResult={true} />
              ))}
            </div>
            {searchResults.length === 0 && (
              <div style={styles.noResults}>
                No users found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* All Users */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>All Users ({users.length})</h2>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading users...</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Edit User: {editingUser.username}</h3>

              <div style={styles.modalContent}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => updateUserRole(editingUser.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Status</label>
                  <select
                    value={editingUser.accountStatus}
                    onChange={(e) => updateAccountStatus(editingUser.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setEditingUser(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.deleteModalTitle}>Delete User</h3>
              <p style={styles.deleteModalText}>
                Are you sure you want to delete user "{showDeleteModal.username}"? This action cannot be undone.
              </p>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteModal(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(showDeleteModal.id)}
                  style={styles.confirmDeleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import {
  FaUserFriends,
  FaTrash,
  FaUserPlus,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";

const ManageRolesModal = ({ show, onClose, pageId, roles, onUpdate, isMainAdmin }) => {
  const [localRoles, setLocalRoles] = useState(roles);
  const [loading, setLoading] = useState(false);
  
  // Admin selection state
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminSearching, setAdminSearching] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  
  // Moderator selection state
  const [modSearchTerm, setModSearchTerm] = useState('');
  const [modSearchResults, setModSearchResults] = useState([]);
  const [selectedMod, setSelectedMod] = useState(null);
  const [modSearching, setModSearching] = useState(false);
  const [showModDropdown, setShowModDropdown] = useState(false);
  
  const [newModPermissions, setNewModPermissions] = useState({
    createContent: false,
    updateContent: false,
    deleteContent: false,
    updateProfile: false,
    replyToReviews: false,
  });

  useEffect(() => {
    setLocalRoles(roles);
  }, [roles]);

  // Search users for admin
  const searchUsers = async (searchTerm, setSearchResults, setSearching, setShowDropdown) => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchTerm)}&limit=10`);
      
      if (res?.data?.users) {
        // Filter out users who are already admins or the main admin
        const filteredUsers = res.data.users.filter(user => {
          const isMainAdmin = user.id === localRoles.mainAdmin?.id;
          const isAdmin = localRoles.admins?.some(admin => admin.id === user.id);
          return !isMainAdmin && !isAdmin;
        });
        
        setSearchResults(filteredUsers);
        setShowDropdown(filteredUsers.length > 0);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  // Search users for moderator
  const searchUsersForMod = async (searchTerm) => {
    if (searchTerm.trim().length < 2) {
      setModSearchResults([]);
      setShowModDropdown(false);
      return;
    }

    setModSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchTerm)}&limit=10`);
      
      if (res?.data?.users) {
        // Filter out users who are already admins, moderators, or the main admin
        const filteredUsers = res.data.users.filter(user => {
          const isMainAdmin = user.id === localRoles.mainAdmin?.id;
          const isAdmin = localRoles.admins?.some(admin => admin.id === user.id);
          const isModerator = localRoles.moderators?.some(mod => mod.user.id === user.id);
          return !isMainAdmin && !isAdmin && !isModerator;
        });
        
        setModSearchResults(filteredUsers);
        setShowModDropdown(filteredUsers.length > 0);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setModSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (adminSearchTerm) {
        searchUsers(adminSearchTerm, setAdminSearchResults, setAdminSearching, setShowAdminDropdown);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [adminSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (modSearchTerm) {
        searchUsersForMod(modSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [modSearchTerm]);

  const handleAddAdmin = async () => {
    if (!selectedAdmin) {
      toast.error('Please select a user from the dropdown');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Sending add admin request:', {
        userId: selectedAdmin.id
      });

      const res = await axiosInstance.post(`/pages/${pageId}/admins`, {
        userId: selectedAdmin.id
      });

      if (res?.data?.success) {
        toast.success(res.data.message || 'Admin added successfully');
        setSelectedAdmin(null);
        setAdminSearchTerm('');
        setAdminSearchResults([]);
        setShowAdminDropdown(false);
        onUpdate();
      } else {
        throw new Error(res?.data?.message || 'Failed to add admin');
      }
    } catch (err) {
      console.error('❌ Error adding admin:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add admin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this admin?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/pages/${pageId}/admins/${userId}`);
      if (res?.data?.success) {
        toast.success('Admin removed successfully');
        onUpdate();
      } else {
        throw new Error(res?.data?.message || 'Failed to remove admin');
      }
    } catch (err) {
      console.error('Error removing admin:', err);
      const errorMessage = err.response?.data?.message || 'Failed to remove admin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveModerator = async (userId) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this moderator?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/pages/${pageId}/moderators/${userId}`);
      if (res?.data?.success) {
        toast.success('Moderator removed successfully');
        onUpdate();
      } else {
        throw new Error(res?.data?.message || 'Failed to remove moderator');
      }
    } catch (err) {
      console.error('Error removing moderator:', err);
      const errorMessage = err.response?.data?.message || 'Failed to remove moderator';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModerator = async () => {
    if (!selectedMod) {
      toast.error('Please select a user from the dropdown');
      return;
    }

    if (!Object.values(newModPermissions).some(perm => perm)) {
      toast.error('At least one permission must be selected for the moderator');
      return;
    }

    setLoading(true);

    try {
      console.log('🔵 Sending add moderator request:', {
        userId: selectedMod.id,
        searchTerm: selectedMod.username,
        permissions: newModPermissions
      });

      const res = await axiosInstance.post(`/pages/${pageId}/moderators`, {
        userId: selectedMod.id,
        permissions: newModPermissions
      });

      if (res?.data?.success) {
        toast.success(res.data.message || 'Moderator added successfully');
        setSelectedMod(null);
        setModSearchTerm('');
        setModSearchResults([]);
        setShowModDropdown(false);
        setNewModPermissions({
          createContent: false,
          updateContent: false,
          deleteContent: false,
          updateProfile: false,
          replyToReviews: false,
        });
        onUpdate();
      } else {
        throw new Error(res?.data?.message || 'Failed to add moderator');
      }
    } catch (err) {
      console.error('❌ Error adding moderator:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add moderator';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (userId, permission, value) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return;
    }
    const mod = localRoles.moderators.find(m => m.user.id === userId);
    if (!mod) {
      toast.error('Moderator not found');
      return;
    }
    const currentPermissions = { ...mod.permissions };
    const newPermissions = { ...currentPermissions, [permission]: value };

    setLocalRoles(prev => ({
      ...prev,
      moderators: prev.moderators.map(m =>
        m.user.id === userId ? { ...m, permissions: newPermissions } : m
      ),
    }));

    try {
      const res = await axiosInstance.put(`/pages/${pageId}/moderators/${userId}/permissions`, { permissions: newPermissions });
      if (res?.data?.success) {
        toast.success('Permission updated successfully');
      } else {
        throw new Error(res?.data?.message || 'Failed to update permission');
      }
    } catch (err) {
      console.error('Error updating permission:', err);
      setLocalRoles(prev => ({
        ...prev,
        moderators: prev.moderators.map(m =>
          m.user.id === userId ? { ...m, permissions: currentPermissions } : m
        ),
      }));
      const errorMessage = err.response?.data?.message || 'Failed to update permission';
      toast.error(errorMessage);
    }
  };

  const permissionKeys = ['createContent', 'updateContent', 'deleteContent', 'updateProfile', 'replyToReviews'];

  if (!show || !localRoles) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark">
              <FaUserFriends className="me-2" />
              Manage Page Roles
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading && (
              <div className="alert alert-info d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Processing request...</span>
              </div>
            )}

            {localRoles.mainAdmin && (
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Main Admin (Owner)</h6>
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <img
                  src={localRoles.mainAdmin.profilePicture || "/default-avatar.png"}
                  alt={`${localRoles.mainAdmin.firstName} ${localRoles.mainAdmin.lastName}`}
                  className="rounded-circle me-3"
                  style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />
                <div>
                  <div className="fw-bold text-dark">
                    {localRoles.mainAdmin.firstName} {localRoles.mainAdmin.lastName}
                  </div>
                  <div className="text-secondary small">@{localRoles.mainAdmin.username}</div>
                  <div className="text-secondary small">Cannot be changed</div>
                </div>
              </div>
            </div>
            )}

            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Admins</h6>
              {localRoles.admins && localRoles.admins.length > 0 ? (
                localRoles.admins.map(admin => (
                  <div key={admin.id} className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={admin.profilePicture || "/default-avatar.png"}
                        alt={`${admin.firstName} ${admin.lastName}`}
                        className="rounded-circle me-3"
                        style={{ width: "48px", height: "48px", objectFit: "cover" }}
                      />
                      <div>
                        <div className="fw-bold text-dark">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-secondary small">@{admin.username}</div>
                      </div>
                    </div>
                    {isMainAdmin && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleRemoveAdmin(admin.id)} disabled={loading}>
                        <FaTrash className="me-1" /> Remove
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-secondary">No admins added yet</p>
              )}

              {isMainAdmin && (
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2">Add New Admin</h6>
                <div className="alert alert-info small mb-2">
                  <FaInfoCircle className="me-2" />
                  Search and select a user who is following the page
                </div>
                
                <div className="position-relative">
                  <div className="input-group mb-2">
                    <span className="input-group-text bg-white">
                      <FaSearch className="text-secondary" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or username (min 2 chars)"
                      value={selectedAdmin ? `${selectedAdmin.firstName} ${selectedAdmin.lastName} (@${selectedAdmin.username})` : adminSearchTerm}
                      onChange={(e) => {
                        if (selectedAdmin) {
                          setSelectedAdmin(null);
                        }
                        setAdminSearchTerm(e.target.value);
                      }}
                      disabled={loading}
                      onFocus={() => {
                        if (adminSearchResults.length > 0) {
                          setShowAdminDropdown(true);
                        }
                      }}
                    />
                    {adminSearching && (
                      <span className="input-group-text bg-white">
                        <div className="spinner-border spinner-border-sm"></div>
                      </span>
                    )}
                  </div>

                  {showAdminDropdown && adminSearchResults.length > 0 && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                      {adminSearchResults.map(user => (
                        <div
                          key={user.id}
                          className="d-flex align-items-center p-2 cursor-pointer hover-bg-light"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedAdmin(user);
                            setAdminSearchTerm('');
                            setShowAdminDropdown(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <img
                            src={user.profilePicture || "/default-avatar.png"}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="rounded-circle me-2"
                            style={{ width: "32px", height: "32px", objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-bold small">{user.firstName} {user.lastName}</div>
                            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>@{user.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedAdmin && (
                  <div className="alert alert-success d-flex align-items-center mb-2">
                    <img
                      src={selectedAdmin.profilePicture || "/default-avatar.png"}
                      alt={selectedAdmin.firstName}
                      className="rounded-circle me-2"
                      style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <strong>{selectedAdmin.firstName} {selectedAdmin.lastName}</strong>
                      <span className="text-muted ms-2">@{selectedAdmin.username}</span>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedAdmin(null);
                        setAdminSearchTerm('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleAddAdmin} 
                  disabled={loading || !selectedAdmin}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="me-1" /> Add Admin
                    </>
                  )}
                </button>
              </div>
              )}
            </div>

            <div>
              <h6 className="fw-bold text-dark mb-3">Moderators</h6>
              {localRoles.moderators && localRoles.moderators.length > 0 ? (
                localRoles.moderators.map(mod => (
                  <div key={mod.user.id} className="mb-4 p-3 bg-light rounded">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <img
                          src={mod.user.profilePicture || "/default-avatar.png"}
                          alt={`${mod.user.firstName} ${mod.user.lastName}`}
                          className="rounded-circle me-3"
                          style={{ width: "48px", height: "48px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="fw-bold text-dark">
                            {mod.user.firstName} {mod.user.lastName}
                          </div>
                          <div className="text-secondary small">@{mod.user.username}</div>
                        </div>
                      </div>
                      {isMainAdmin && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleRemoveModerator(mod.user.id)} disabled={loading}>
                        <FaTrash className="me-1" /> Remove
                      </button>
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-3">
                      {permissionKeys.map(perm => (
                        <div key={perm} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={mod.permissions[perm]}
                            onChange={(e) => handleUpdatePermission(mod.user.id, perm, e.target.checked)}
                            id={`${mod.user.id}-${perm}`}
                            disabled={loading || !isMainAdmin}
                          />
                          <label className="form-check-label" htmlFor={`${mod.user.id}-${perm}`}>
                            {perm.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + perm.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary">No moderators added yet</p>
              )}

              {isMainAdmin && (
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2">Add New Moderator</h6>
                <div className="alert alert-info small mb-2">
                  <FaInfoCircle className="me-2" />
                  Search and select a user who is following the page
                </div>
                
                <div className="position-relative">
                  <div className="input-group mb-2">
                    <span className="input-group-text bg-white">
                      <FaSearch className="text-secondary" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or username (min 2 chars)"
                      value={selectedMod ? `${selectedMod.firstName} ${selectedMod.lastName} (@${selectedMod.username})` : modSearchTerm}
                      onChange={(e) => {
                        if (selectedMod) {
                          setSelectedMod(null);
                        }
                        setModSearchTerm(e.target.value);
                      }}
                      disabled={loading}
                      onFocus={() => {
                        if (modSearchResults.length > 0) {
                          setShowModDropdown(true);
                        }
                      }}
                    />
                    {modSearching && (
                      <span className="input-group-text bg-white">
                        <div className="spinner-border spinner-border-sm"></div>
                      </span>
                    )}
                  </div>

                  {showModDropdown && modSearchResults.length > 0 && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}>
                      {modSearchResults.map(user => (
                        <div
                          key={user.id}
                          className="d-flex align-items-center p-2 cursor-pointer"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedMod(user);
                            setModSearchTerm('');
                            setShowModDropdown(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <img
                            src={user.profilePicture || "/default-avatar.png"}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="rounded-circle me-2"
                            style={{ width: "32px", height: "32px", objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-bold small">{user.firstName} {user.lastName}</div>
                            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>@{user.username}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedMod && (
                  <div className="alert alert-success d-flex align-items-center mb-2">
                    <img
                      src={selectedMod.profilePicture || "/default-avatar.png"}
                      alt={selectedMod.firstName}
                      className="rounded-circle me-2"
                      style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <strong>{selectedMod.firstName} {selectedMod.lastName}</strong>
                      <span className="text-muted ms-2">@{selectedMod.username}</span>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedMod(null);
                        setModSearchTerm('');
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                <h6 className="fw-bold text-dark mb-2 mt-3">Permissions</h6>
                <div className="d-flex flex-wrap gap-3 p-3 border rounded bg-white mb-2">
                    {permissionKeys.map(perm => (
                        <div key={`add-mod-${perm}`} className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={newModPermissions[perm]}
                                onChange={(e) => setNewModPermissions(prev => ({ ...prev, [perm]: e.target.checked }))}
                                id={`add-mod-${perm}`}
                                disabled={loading}
                            />
                            <label className="form-check-label" htmlFor={`add-mod-${perm}`}>
                                {perm.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + perm.replace(/([A-Z])/g, ' $1').trim().slice(1)}
                            </label>
                        </div>
                    ))}
                </div>
                {!Object.values(newModPermissions).some(p => p) && (
                  <small className="text-danger d-block mb-2">
                    At least one permission must be selected
                  </small>
                )}

                <button 
                  className="btn btn-primary w-100" 
                  onClick={handleAddModerator} 
                  disabled={loading || !selectedMod || !Object.values(newModPermissions).some(p => p)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="me-1" /> Add Moderator
                    </>
                  )}
                </button>
              </div>
              )}
            </div>
          </div>
          <div className="modal-footer border-top">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageRolesModal;
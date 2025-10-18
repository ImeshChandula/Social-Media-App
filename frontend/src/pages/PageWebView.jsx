

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import CreatePagePost from "../components/CreatePagePost";
import CreatePageStory from "../components/CreatePageStory";
import StoryViewer from "../components/StoryView";
import WhatsAppContactButton from "../components/WhatsAppContactButton";
import ReviewsSection from "../components/ReviewsSection";
import { StarRatingDisplay } from "../components/StarRating";
import useAuthStore from "../store/authStore";
import '../styles/PageWebView.css';
import {
  FaEdit,
  FaImage,
  FaUserCircle,
  FaUndo,
  FaSave,
  FaArrowLeft,
  FaThumbsUp,
  FaUserPlus,
  FaEnvelope,
  FaShare,
  FaMapMarkerAlt,
  FaPhone,
  FaVideo,
  FaCalendar,
  FaInfoCircle,
  FaAlignLeft,
  FaUserFriends,
  FaTrash
} from "react-icons/fa";
import useThemeStore from "../store/themeStore";

// =========================================================================
// Helper Components (Defined outside PageWebView for clarity and performance)
// =========================================================================

// About Tab Content Component (omitted for brevity, assume correct)
const AboutTabContent = ({ page, isOwner, pageId, pageRoles }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body">
      <h5 className="fw-bold text-dark mb-4">About</h5>

      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-2">Overview</h6>
        <p className="text-secondary">
          {page.description || "No description available"}
        </p>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-3">Page Info</h6>

        {page.category && (
          <div className="mb-3">
            <strong className="text-dark">Category:</strong>
            <div className="mt-1">
              <span className="badge bg-light text-dark border">
                {page.category.charAt(0).toUpperCase() + page.category.slice(1)}
              </span>
            </div>
          </div>
        )}

        {page.address && (
          <div className="mb-3">
            <strong className="text-dark">Address:</strong>
            <div className="mt-1 text-secondary">
              <FaMapMarkerAlt className="me-2" />
              {page.address}
            </div>
          </div>
        )}

        {page.phone && (
          <div className="mb-3">
            <strong className="text-dark">Phone:</strong>
            <div className="mt-1 text-secondary d-flex justify-content-between align-items-center">
              <span>
                <FaPhone className="me-2" />
                {page.phone}
              </span>
              {!isOwner && (
                <WhatsAppContactButton
                  pageId={pageId}
                  pageName={page.pageName}
                  size="sm"
                />
              )}
            </div>
          </div>
        )}

        {page.email && (
          <div className="mb-3">
            <strong className="text-dark">Email:</strong>
            <div className="mt-1 text-secondary">
              <FaEnvelope className="me-2" />
              {page.email}
            </div>
          </div>
        )}
      </div>

      {page.owner && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Page Transparency</h6>
          <div className="d-flex align-items-center p-3 bg-light rounded">
            <img
              src={page.owner.profilePicture || "/default-avatar.png"}
              alt={`${page.owner.firstName} ${page.owner.lastName}`}
              className="rounded-circle me-3"
              style={{ width: "48px", height: "48px", objectFit: "cover" }}
            />
            <div>
              <div className="fw-bold text-dark">
                {page.owner.firstName} {page.owner.lastName}
              </div>
              <div className="text-secondary small">Page Owner</div>
            </div>
          </div>
        </div>
      )}
      {/* Conditionally render roles based on pageRoles prop */}
      {pageRoles && pageRoles.mainAdmin && (
        <>
          <div className="mt-4">
            <h6 className="fw-bold text-dark mb-3">Admins</h6>
            {pageRoles.admins && pageRoles.admins.length > 0 ? (
              pageRoles.admins.map((admin) => (
                <div
                  key={admin.id}
                  className="d-flex align-items-center p-3 bg-light rounded mb-2"
                >
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
                    <div className="text-secondary small">Admin</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">No admins added yet</p>
            )}
          </div>
          <div className="mt-4">
            <h6 className="fw-bold text-dark mb-3">Moderators</h6>
            {pageRoles.moderators && pageRoles.moderators.length > 0 ? (
              pageRoles.moderators.map((mod) => (
                <div
                  key={mod.user.id}
                  className="d-flex align-items-center p-3 bg-light rounded mb-2"
                >
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
                    <div className="text-secondary small">Moderator</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-secondary">No moderators added yet</p>
            )}
          </div>
        </>
      )}
    </div>
  </div>
);

// Photos Tab Content Component (omitted for brevity, assume correct)
const PhotosTabContent = ({ posts }) => {
  const photoPosts = posts.filter(post => post.mediaType === 'image' && post.media && post.media.length > 0);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold text-dark mb-4">Photos</h5>
        {photoPosts.length > 0 ? (
          <div className="row g-2">
            {photoPosts.map((post, index) => (
              <div key={post._id || post.id} className="col-4">
                <div className="ratio ratio-1x1">
                  <img
                    src={post.media[0]} // Assuming media is an array of URLs, take the first one
                    alt={`Photo ${index + 1}`}
                    className="rounded"
                    style={{ objectFit: "cover", cursor: "pointer" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaImage size={64} className="text-secondary mb-3" />
            <p className="text-secondary">No photos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Videos Tab Content Component (omitted for brevity, assume correct)
const VideosTabContent = ({ posts }) => {
  const videoPosts = posts.filter(post => post.mediaType === 'video' && post.media && post.media.length > 0);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold text-dark mb-4">Videos</h5>
        {videoPosts.length > 0 ? (
          <div className="row g-3">
            {videoPosts.map((post) => (
              <div key={post._id || post.id} className="col-12">
                <video
                  src={post.media[0]} // Assuming media is an array of URLs, take the first one
                  controls
                  className="w-100 rounded"
                  style={{ maxHeight: "400px" }}
                />
                {post.content && (
                  <p className="mt-2 text-dark">{post.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaVideo size={64} className="text-secondary mb-3" />
            <p className="text-secondary">No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Profile Modal Component (omitted for brevity, assume correct)
const EditProfileModal = ({ show, onClose, page, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: "",
    profilePicture: "",
    coverPhoto: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    if (show && page) {
      setFormData({
        description: page.description || "",
        profilePicture: page.profilePicture || "",
        coverPhoto: page.coverPhoto || "",
      });
      setProfilePreview(page.profilePicture || "");
      setCoverPreview(page.coverPhoto || "");
    }
  }, [show, page]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (type === "profile") {
          setProfileImageFile(file);
          setProfilePreview(base64);
          setFormData((prev) => ({ ...prev, profilePicture: base64 }));
        } else {
          setCoverImageFile(file);
          setCoverPreview(base64);
          setFormData((prev) => ({ ...prev, coverPhoto: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(
        `/pages/${page.id || page._id}/profile`,
        formData
      );

      if (res?.data?.success) {
        onUpdate(res.data.page);
        toast.success("Page profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (page) {
      setFormData({
        description: page.description || "",
        profilePicture: page.profilePicture || "",
        coverPhoto: page.coverPhoto || "",
      });
      setProfilePreview(page.profilePicture || "");
      setCoverPreview(page.coverPhoto || "");
      setProfileImageFile(null);
      setCoverImageFile(null);
    }
  };

  if (!show || !page) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark">
              <FaEdit className="me-2" />
              Edit Page Profile
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                <small className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  Update your page's visual appearance and description. Images should be under 5MB.
                </small>
              </div>

              {/* Cover Photo */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <FaImage className="me-2" />
                  Cover Photo
                </label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "cover")}
                    />
                    <small className="text-secondary">
                      Recommended: 1200x400px or similar wide format
                    </small>
                  </div>
                  <div className="col-md-4">
                    {coverPreview && (
                      <div className="position-relative">
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="rounded w-100"
                          style={{ height: "60px", objectFit: "cover" }}
                        />
                        {coverImageFile && (
                          <span className="badge bg-success position-absolute top-0 end-0">
                            Updated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <FaUserCircle className="me-2" />
                  Profile Picture
                </label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "profile")}
                    />
                    <small className="text-secondary">
                      Recommended: Square image (500x500px or similar)
                    </small>
                  </div>
                  <div className="col-md-4">
                    {profilePreview && (
                      <div className="position-relative text-center">
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="rounded-circle"
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                        />
                        {profileImageFile && (
                          <span className="badge bg-success position-absolute top-0 end-0">
                            Updated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <FaAlignLeft className="me-2" />
                  Page Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Tell people what your page is about..."
                  required
                  maxLength={500}
                />
                <small className="text-secondary">
                  {formData.description.length}/500 characters
                </small>
              </div>
            </div>

            <div className="modal-footer border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                <FaUndo className="me-2" />
                Reset
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Manage Roles Modal Component (RESTORED SIMPLE INPUTS)
const ManageRolesModal = ({ show, onClose, pageId, roles, onUpdate, isMainAdmin }) => {
  const [localRoles, setLocalRoles] = useState(roles);
  const [loading, setLoading] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newModUsername, setNewModUsername] = useState('');
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

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const handleAddAdmin = async () => {
    if (!newAdminUsername.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!validateUsername(newAdminUsername)) {
      toast.error('Username must be 3-20 characters long and contain only letters, numbers, or underscores');
      return;
    }
    setLoading(true);
    let userId = null;
    try {
      // 1. Fetch user ID by username (Required by current API design)
      let userRes;
      try {
        // Use a generic search endpoint
        userRes = await axiosInstance.get(`/users/username/${newAdminUsername}`);
      } catch (userErr) {
        // Catch 404 from the user lookup endpoint directly
        if (userErr.response && userErr.response.status === 404) {
          throw new Error('User not found with that username. Please check the username.'); 
        }
        throw userErr; // Re-throw other errors
      }

      if (!userRes?.data?.success || !userRes.data.user) {
        throw new Error('User lookup failed. The user may not exist.');
      }
      
      userId = userRes.data.user.id || userRes.data.user._id;
      if (!userId) {
        throw new Error('Invalid user data received from the server.');
      }

      // 2. Add admin
      const res = await axiosInstance.post(`/pages/${pageId}/admins`, { userId });
      if (res?.data?.success) {
        toast.success('Admin added successfully');
        setNewAdminUsername('');
        onUpdate(); // Trigger parent to re-fetch roles
      } else {
        throw new Error(res?.data?.message || 'Failed to add admin');
      }
    } catch (err) {
      console.error('Error adding admin:', err);
      
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to add admin (Server error)';
                           
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
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/pages/${pageId}/admins/${userId}`);
      if (res?.data?.success) {
        toast.success('Admin removed successfully');
        onUpdate(); // Trigger parent to re-fetch roles
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

  const handleAddModerator = async () => {
    if (!newModUsername.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!validateUsername(newModUsername)) {
      toast.error('Username must be 3-20 characters long and contain only letters, numbers, or underscores');
      return;
    }
    if (!Object.values(newModPermissions).some(perm => perm)) {
      toast.error('At least one permission must be selected for the moderator');
      return;
    }
    setLoading(true);
    let userId = null;
    try {
      // 1. Fetch user ID by username (Required by current API design)
      let userRes;
      try {
        userRes = await axiosInstance.get(`/users/username/${newModUsername}`);
      } catch (userErr) {
        // Catch 404 from the user lookup endpoint directly
        if (userErr.response && userErr.response.status === 404) {
          throw new Error('User not found with that username. Please check the username.'); 
        }
        throw userErr; // Re-throw other errors
      }

      if (!userRes?.data?.success || !userRes.data.user) {
        throw new Error('User lookup failed. The user may not exist.');
      }
      
      userId = userRes.data.user.id || userRes.data.user._id;
      if (!userId) {
        throw new Error('Invalid user data received from the server.');
      }

      // 2. Add moderator
      const res = await axiosInstance.post(`/pages/${pageId}/moderators`, { userId, permissions: newModPermissions });
      if (res?.data?.success) {
        toast.success('Moderator added successfully');
        setNewModUsername('');
        setNewModPermissions({
          createContent: false,
          updateContent: false,
          deleteContent: false,
          updateProfile: false,
          replyToReviews: false,
        });
        onUpdate(); // Trigger parent to re-fetch roles
      } else {
        throw new Error(res?.data?.message || 'Failed to add moderator');
      }
    } catch (err) {
      console.error('Error adding moderator:', err);
      
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'Failed to add moderator (Server error)';
                           
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

    // Optimistic update
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
        onUpdate(); 
      } else {
        throw new Error(res?.data?.message || 'Failed to update permission');
      }
    } catch (err) {
      console.error('Error updating permission:', err);
      // Revert optimistic update on error
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
              <div className="text-center mb-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {/* Main Admin */}
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
                  <div className="text-secondary small">Cannot be changed</div>
                </div>
              </div>
            </div>
            )}

            {/* Admins Section */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3">Admins</h6>
              {localRoles.admins.map(admin => (
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
              ))}
              {isMainAdmin && (
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2">Add New Admin</h6>
                <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter username to add as admin"
                      value={newAdminUsername}
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      disabled={loading}
                    />
                    <button className="btn btn-primary" onClick={handleAddAdmin} disabled={loading}>
                      <FaUserPlus className="me-1" /> Add Admin
                    </button>
                </div>
                <small className="text-secondary">Note: User must be a follower of the page.</small>
              </div>
              )}
            </div>

            {/* Moderators Section */}
            <div>
              <h6 className="fw-bold text-dark mb-3">Moderators</h6>
              {localRoles.moderators.map(mod => (
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
              ))}
              {isMainAdmin && (
              <div className="mt-3">
                <h6 className="fw-bold text-dark mb-2">Add New Moderator</h6>
                <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter username to add as moderator"
                      value={newModUsername}
                      onChange={(e) => setNewModUsername(e.target.value)}
                      disabled={loading}
                    />
                    <button className="btn btn-primary" onClick={handleAddModerator} disabled={loading}>
                      <FaUserPlus className="me-1" /> Add Moderator
                    </button>
                </div>
                <small className="text-secondary">Note: User must be a follower of the page.</small>
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

// =========================================================================
// PageWebView Component
// =========================================================================

const PageWebView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { isDarkMode } = useThemeStore();

  // Content states
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Create content modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);

  // Story viewer states
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [pageStories, setPageStories] = useState(null);

  // Roles states
  const [pageRoles, setPageRoles] = useState(null);
  const [showManageRoles, setShowManageRoles] = useState(false);
  
  // Helper calculation (will be re-evaluated when pageRoles updates)
  const isMainAdmin = pageRoles && authUser && pageRoles.mainAdmin?.id === authUser.id;

  // Combined admin/owner check for UI actions
  const isAdminUser =
    isOwner ||
    (pageRoles &&
      authUser &&
      (pageRoles.mainAdmin?.id === authUser.id ||
        pageRoles.admins?.some((admin) => admin.id === authUser.id)));

  const fetchPageRoles = async () => {
    try {
      const res = await axiosInstance.get(`/pages/${id}/roles`);
      if (res?.data?.success) {
        const rolesData = res.data.roles;
        setPageRoles(rolesData);
        
        return rolesData;
      }
    } catch (err) {
      console.error("Error fetching page roles:", err);
    }
    return null;
  };

  const handleManageRolesClick = async () => {
    await fetchPageRoles();
    setShowManageRoles(true);
  };

  const handleRolesUpdate = () => {
    fetchPageRoles();
  };

  useEffect(() => {
    fetchPageDetails();
    fetchPageStories();
  }, [id]);

  useEffect(() => {
    if (page && (activeTab === 'home' || activeTab === 'posts')) {
      fetchPagePosts();
    }
  }, [page, activeTab]);

  useEffect(() => {
    if (page && isOwner && !pageRoles && authUser) {
        fetchPageRoles();
    }
  }, [page, isOwner, authUser]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}`);
      if (res?.data?.success) {
        const pageData = res.data.page;
        setPage(pageData);
        setIsFollowing(pageData.isFollowing || false);

        const ownershipCheck = pageData.isOwner ||
          (authUser && (
            pageData.owner === authUser.id ||
            pageData.owner?.id === authUser.id
          ));

        setIsOwner(ownershipCheck);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      if (err.response?.status === 404) {
        toast.error("Page not found");
        navigate("/profile");
      } else {
        toast.error("Failed to load page");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}/posts`);
      if (res?.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching page posts:', err);
      toast.error("Failed to load page posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchPageStories = async () => {
    try {
      const res = await axiosInstance.get(`/pages/${id}/stories`);
      if (res?.data?.success) {
        setStories(res.data.stories || []);
      }
    } catch (err) {
      console.error('Error fetching page stories:', err);
    }
  };

  const handleProfilePictureClick = async () => {
    try {
      const res = await axiosInstance.get(`/pages/${id}/stories`);

      if (res?.data?.success && res.data.stories?.length > 0) {
        const now = new Date();
        const activeStories = res.data.stories.filter(story => {
          const expiresAt = new Date(story.expiresAt);
          return story.isActive && expiresAt > now;
        });

        if (activeStories.length > 0) {
          const formattedStories = {
            user: {
              id: page.id,
              firstName: '',
              lastName: '',
              username: page.username || page.pageName,
              profilePicture: page.profilePicture,
              pageName: page.pageName,
              isPage: true,
              type: 'page'
            },
            stories: activeStories.map(story => ({
              ...story,
              _id: story._id || story.id,
              user: {
                id: page.id,
                firstName: '',
                lastName: '',
                username: page.username || page.pageName,
                profilePicture: page.profilePicture,
                pageName: page.pageName,
                isPage: true,
                type: 'page'
              },
              authorType: 'page'
            }))
          };

          setPageStories(formattedStories);
          setShowStoryViewer(true);
        } else {
          toast.info("No active stories available");
        }
      } else {
        toast.info("No stories available");
      }
    } catch (err) {
      console.error('Error fetching page stories for viewer:', err);
      toast.error("Failed to load stories");
    }
  };

  const hasActiveStories = () => {
    if (!stories || stories.length === 0) return false;

    const now = new Date();
    return stories.some(story => {
      const expiresAt = new Date(story.expiresAt);
      return story.isActive && expiresAt > now;
    });
  };

  const handleFollow = async () => {
    if (!page) return;

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const res = await axiosInstance.post(`/pages/${id}/${endpoint}`);

      if (res?.data?.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed page" : "Following page");
        setPage(prev => ({
            ...prev,
            followersCount: isFollowing ? Math.max(0, prev.followersCount - 1) : prev.followersCount + 1
        }));
      }
    } catch (err) {
      console.error('Error following/unfollowing page:', err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleEditProfileUpdate = (updatedData) => {
    setPage(prev => ({ ...prev, ...updatedData }));
    setShowEditProfile(false);
    toast.success("Page profile updated successfully!");
  };

  const handleCreatePost = () => {
    if (!isAdminUser) {
      toast.error("You don't have permission to create posts for this page");
      return;
    }
    setShowCreatePost(true);
  };

  const handleCreateStory = () => {
    if (!isAdminUser) {
      toast.error("You don't have permission to create stories for this page");
      return;
    }
    setShowCreateStory(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
    setPage(prev => ({ ...prev, postsCount: prev.postsCount + 1 }));
    toast.success("Page post created successfully!");
  };

  const handleStoryCreated = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    setShowCreateStory(false);
    toast.success("Page story created successfully!");
  };

  const handleStoryDelete = (storyId) => {
    setStories(prev => prev.filter(story => (story._id || story.id) !== storyId));

    if (pageStories) {
      const updatedStories = pageStories.stories.filter(story => (story._id || story.id) !== storyId);
      if (updatedStories.length === 0) {
        setShowStoryViewer(false);
        setPageStories(null);
      } else {
        setPageStories(prev => ({
          ...prev,
          stories: updatedStories
        }));
      }
    }

    toast.success('Story deleted successfully');
  };

  const handleStoryUpdate = (updatedStory) => {
    setStories(prev =>
      prev.map(story =>
        (story._id || story.id) === (updatedStory._id || updatedStory.id) ? { ...story, ...updatedStory } : story
      )
    );

    if (pageStories) {
      setPageStories(prev => ({
        ...prev,
        stories: prev.stories.map(story =>
          (story._id || story.id) === (updatedStory._id || updatedStory.id) ? { ...story, ...updatedStory } : story
        )
      }));
    }

    toast.success('Story updated successfully');
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => (post._id || post.id) !== postId));
    setPage(prev => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));
    toast.success("Post deleted successfully");
  };

  const updatePostLike = (postId, isLiked, likeCount) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        const currentPostId = post._id || post.id;
        if (currentPostId === postId) {
          return {
            ...post,
            isLiked,
            likeCount: Math.max(0, likeCount)
          };
        }
        return post;
      })
    );
  };

  const reportPost = async (postId, reason) => {
    try {
      const response = await axiosInstance.post(`/posts/report/${postId}`, {
        reason: reason.trim()
      });

      if (response.data.success) {
        setPosts(prevPosts => prevPosts.filter(post => {
          const currentPostId = post._id || post.id;
          return currentPostId !== postId;
        }));

        toast.success("Post reported successfully");
        return { success: true, message: "Post reported successfully" };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to report post";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h3 className={`${isDarkMode ? "text-white" : "text-black"}`}>Page Not Found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-vh-100 mt-5 mt-md-0">
      {/* Header Section */}
      <div className="shadow-sm">
        {/* Cover Photo */}
        <div className="position-relative" style={{ height: "400px" }}>
          <img
            src={page.coverPhoto || "https://via.placeholder.com/1200x400/667eea/ffffff?text=Cover+Photo"}
            alt="Cover"
            className="w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "10px" }}
          />
        </div>

        {/* Page Info Header */}
        <div className="container" style={{ marginTop: "-80px", position: "relative" }}>
          <div className="row">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                {/* Back Button */}
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(-1)}
                  title="Go back"
                >
                  <FaArrowLeft className="text-dark" />
                </button>
                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  {!isAdminUser ? (
                    <>
                      <button
                        className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={handleFollow}
                      >
                        <FaThumbsUp className="me-2" />
                        {isFollowing ? 'Followed' : 'Follow'}
                      </button>
                      <button className="btn btn-light">
                        <FaShare className="me-2" />
                        Share
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-light" onClick={() => setShowEditProfile(true)}>
                        <FaEdit className="me-2" />
                        Edit Page
                      </button>
                      {/* Manage Roles button for Owner & Admin */}
                      <button
                        className="btn btn-light"
                        onClick={handleManageRolesClick}
                      >
                        <FaUserFriends className="me-2" />
                        Manage Roles
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between flex-wrap">
                {/* Profile Picture */}
                <div className="d-flex align-items-end gap-3">
                  <div
                    className="position-relative"
                    onClick={handleProfilePictureClick}
                    style={{
                      cursor: hasActiveStories() ? 'pointer' : 'default',
                    }}
                  >
                    <img
                      src={page.profilePicture || "/default-page-avatar.png"}
                      alt={page.pageName}
                      className="rounded-circle border-5 border-white"
                      style={{
                        width: "168px",
                        height: "168px",
                        objectFit: "cover",
                        backgroundColor: "white"
                      }}
                    />
                    {hasActiveStories() && (
                      <div
                        className="position-absolute"
                        style={{
                          bottom: '10px',
                          right: '10px',
                          background: '#1877f2',
                          color: 'white',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '4px solid white'
                        }}
                      >
                        <FaImage size={16} />
                      </div>
                    )}
                  </div>

                  {/* Page Name & Stats */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h1 className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`} style={{ fontSize: "32px", fontWeight: "700" }}>
                        {page.pageName}
                      </h1>
                    </div>
                    <div className="text-secondary mt-1">
                      {page.category && (
                        <span className="me-3">{page.category.charAt(0).toUpperCase() + page.category.slice(1)}</span>
                      )}
                    </div>
                    <div className="d-flex gap-3 mt-2 text-dark">
                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        <FaUserPlus className="me-1" />
                        <strong>{page.followersCount || 0}</strong> Followers
                      </span>

                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        <FaThumbsUp className="me-1" />
                        <strong>{stories.length || 0}</strong> Stories
                      </span>

                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        <FaMapMarkerAlt className="me-1" />
                        <strong>{page.postsCount || 0}</strong> Posts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-top mt-3">
                <ul className="nav nav-tabs border-0" style={{ marginLeft: "0" }}>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'home' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('home')}
                      style={{
                        color: activeTab === 'home' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'home' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Home
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'about' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('about')}
                      style={{
                        color: activeTab === 'about' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'about' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      About
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'posts' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('posts')}
                      style={{
                        color: activeTab === 'posts' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'posts' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Posts
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'reviews' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('reviews')}
                      style={{
                        color: activeTab === 'reviews' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'reviews' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Reviews
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'photos' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('photos')}
                      style={{
                        color: activeTab === 'photos' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'photos' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Photos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'videos' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('videos')}
                      style={{
                        color: activeTab === 'videos' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'videos' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Videos
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Left Sidebar - About Section (Summary) */}
          <div className="col-lg-5 col-xl-4 mb-4">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title fw-bold text-dark mb-3">About</h5>
                <p className="text-secondary mb-3">
                  {page.description || "No description available"}
                </p>
                {/* Roles Summary - Only show if roles are loaded */}
                {pageRoles && pageRoles.mainAdmin && (
                  <>
                    <h6 className="fw-bold mt-3 text-dark">Main Admin</h6>
                    <p className="text-secondary mb-2">
                      {pageRoles.mainAdmin?.username ||
                        pageRoles.mainAdmin?.email ||
                        "Unknown"}
                    </p>

                    <h6 className="fw-bold mt-3 text-dark">Admins</h6>
                    {pageRoles.admins && pageRoles.admins.length > 0 ? (
                      <ul className="list-group mb-2">
                        {pageRoles.admins.map((admin) => (
                          <li
                            key={admin.id}
                            className="list-group-item small text-dark"
                          >
                            {admin.username || admin.email || `${admin.firstName} ${admin.lastName}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-secondary small">No admins</p>
                    )}

                    <h6 className="fw-bold mt-3 text-dark">Moderators</h6>
                    {pageRoles.moderators && pageRoles.moderators.length > 0 ? (
                      <ul className="list-group mb-2">
                        {pageRoles.moderators.map((mod) => (
                          <li
                            key={mod.user.id}
                            className="list-group-item small text-dark"
                          >
                            {mod.user.username || mod.user.email || `${mod.user.firstName} ${mod.user.lastName}`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-secondary small">No moderators</p>
                    )}
                  </>
                )}
                <button className={`nav-link ${activeTab === 'about' ? 'active' : ''} btn btn-light w-100`}
                  onClick={() => setActiveTab('about')}>
                  See more</button>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="fw-bold text-dark mb-3">Contact Info</h6>

                {page.address && (
                  <div className="d-flex align-items-start mb-3">
                    <FaMapMarkerAlt className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Address</div>
                      <div className="text-dark">{page.address}</div>
                    </div>
                  </div>
                )}

                {page.phone && (
                  <div className="d-flex align-items-start mb-3">
                    <FaPhone className="mt-1 me-3 text-secondary" />
                    <div className="flex-grow-1">
                      <div className="text-secondary small">Phone</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-dark">{page.phone}</span>
                        {!isOwner && (
                          <WhatsAppContactButton
                            pageId={id}
                            pageName={page.pageName}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {page.email && (
                  <div className="d-flex align-items-start mb-3">
                    <FaEnvelope className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Email</div>
                      <div className="text-dark">{page.email}</div>
                    </div>
                  </div>
                )}

                {page.website && (
                  <div className="d-flex align-items-start">
                    <FaGlobe className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Website</div>
                      <a href={page.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {page.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Card - Updated */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0">Reviews</h6>
                  <div className="text-warning">
                    <StarRatingDisplay rating={4.7} size={16} showNumber />
                  </div>
                </div>

                {/* Sample Review Preview */}
                <div className="mb-3 pb-3 border-bottom">
                  <div className="d-flex gap-2 mb-2">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="Reviewer"
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong className="text-dark">Priya Sharma</strong>
                          <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                        </div>
                      </div>
                      <StarRatingDisplay rating={5} size={12} />
                      <div className="text-secondary small">1 week ago</div>
                    </div>
                  </div>
                  <p className="mb-0 small text-dark">
                    Excellent service and innovative solutions...
                  </p>
                </div>

                <button
                  className="btn btn-light w-100"
                  onClick={() => setActiveTab('reviews')}
                >
                  See all reviews
                </button>
              </div>
            </div>

            {/* Get in Touch Card */}
            <div className="card border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <div className="card-body text-white">
                <h5 className="fw-bold mb-2">Get in Touch</h5>
                <p className="mb-3">Ready to transform your business? Contact us today!</p>
                <WhatsAppContactButton
                  className="btn btn-light w-100"
                  pageId={page.id}
                  pageName={page.pageName}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Right Content - Posts Feed */}
          <div className="col-lg-7 col-xl-8">
            {/* Create Post Card - Only for owners/admins */}
            {isAdminUser && activeTab === 'home' && (
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex gap-2">
                    <img
                      src={page.profilePicture || "/default-page-avatar.png"}
                      alt={page.pageName}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <button
                      className="btn btn-light w-100 text-start"
                      onClick={handleCreatePost}
                      style={{ borderRadius: "20px", backgroundColor: "#f0f2f5" }}
                    >
                      What's on your mind?
                    </button>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-around">
                    <button className="btn btn-light flex-grow-1 me-1" onClick={handleCreateStory}>
                      <FaVideo className="text-danger me-2" />
                      Story
                    </button>
                    <button className="btn btn-light flex-grow-1 mx-1" onClick={handleCreatePost}>
                      <FaImage className="text-success me-2" />
                      Photo/Video
                    </button>
                    <button className="btn btn-light flex-grow-1 ms-1">
                      <FaCalendar className="text-primary me-2" />
                      Event
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {(activeTab === 'home' || activeTab === 'posts') && (
              <>
                {loadingPosts ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading posts...</span>
                    </div>
                  </div>
                ) : posts.length > 0 ? (
                  <>
                    {posts.map((post) => (
                      <div key={post._id || post.id} className="mb-3">
                        <PostCard
                          post={post}
                          isUserPost={isOwner}
                          onLikeUpdate={updatePostLike}
                          onDeletePost={handleDeletePost}
                          onReportPost={reportPost}
                          disableNavigation={false}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <FaImage size={64} className="text-secondary mb-3" />
                      <h5 className="text-dark">No posts yet</h5>
                      <p className="text-secondary">
                        {isAdminUser ? "Start sharing content by creating your first post!" : "This page hasn't posted anything yet."}
                      </p>
                      {isAdminUser && (
                        <button className="btn btn-primary mt-3" onClick={handleCreatePost}>
                          Create First Post
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* About Tab Content */}
            {activeTab === 'about' && (
              <AboutTabContent page={page} isOwner={isOwner} pageId={id} pageRoles={pageRoles} />
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'reviews' && (
              <ReviewsSection
                pageId={id}
                page={page}
                isOwner={isOwner}
              />
            )}

            {/* Photos Tab Content */}
            {activeTab === 'photos' && (
              <PhotosTabContent posts={posts} />
            )}

            {/* Videos Tab Content */}
            {activeTab === 'videos' && (
              <VideosTabContent posts={posts} />
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal (omitted for brevity, assume correct)*/}
      {showCreatePost && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Create Post</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreatePost(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreatePagePost
                  pageId={id}
                  pageData={page}
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowCreatePost(false)}
                  isModal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal (omitted for brevity, assume correct)*/}
      {showCreateStory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Create Page Story</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateStory(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreatePageStory
                  pageId={id}
                  pageData={page}
                  onStoryCreated={handleStoryCreated}
                  onCancel={() => setShowCreateStory(false)}
                  isModal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal (omitted for brevity, assume correct)*/}
      {showStoryViewer && pageStories && (
        <StoryViewer
          userStories={pageStories}
          onClose={() => {
            setShowStoryViewer(false);
            setPageStories(null);
          }}
          onDelete={handleStoryDelete}
          onUpdate={handleStoryUpdate}
          isUserPost={isOwner}
          currentUserId={authUser?.id}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          show={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          page={page}
          onUpdate={handleEditProfileUpdate}
        />
      )}

      {/* Manage Roles Modal */}
      {showManageRoles && pageRoles ? (
        <ManageRolesModal
          show={showManageRoles}
          onClose={() => setShowManageRoles(false)}
          pageId={id}
          roles={pageRoles}
          onUpdate={handleRolesUpdate}
          isMainAdmin={isMainAdmin}
        />
      ) : showManageRoles && !pageRoles ? (
        // Loading state for Manage Roles Modal
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  Manage Page Roles
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowManageRoles(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-dark">Loading roles...</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PageWebView;
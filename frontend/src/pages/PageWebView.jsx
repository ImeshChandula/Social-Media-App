import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import '../styles/PageWebView.css'


const PageWebView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchPageDetails();
  }, [id]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}`);
      if (res?.data?.success) {
        const pageData = res.data.page;
        setPage(pageData);
        setIsFollowing(pageData.isFollowing || false);
        setFollowersCount(pageData.followersCount || 0);
        setIsOwner(pageData.isOwner || false);
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

  const handleFollow = async () => {
    if (!page) return;
    
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const res = await axiosInstance.post(`/pages/${id}/${endpoint}`);
      
      if (res?.data?.success) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        toast.success(isFollowing ? "Unfollowed page" : "Following page");
      }
    } catch (err) {
      console.error('Error following/unfollowing page:', err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleEditProfileUpdate = (updatedData) => {
    setPage(prev => ({ ...prev, ...updatedData }));
    setShowEditProfile(false);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-white normal-loading-spinner">
          Loading page<span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h3 className="text-white">Page Not Found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#1a1a1a" }}>
      {/* Cover Photo Section */}
      <div className="position-relative">
        <div
          className="w-100"
          style={{
            height: "300px",
            backgroundImage: page.coverPhoto 
              ? `url(${page.coverPhoto})` 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="position-relative" style={{ marginTop: "-80px" }}>
                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
                  {/* Profile Picture */}
                  <motion.img
                    src={page.profilePicture || "/default-page-avatar.png"}
                    alt={page.pageName}
                    className="rounded-circle border border-4 border-white shadow-lg"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      backgroundColor: "white"
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Page Info */}
                  <div className="text-center text-md-start flex-grow-1 mt-3">
                    <motion.h1 
                      className="text-white fw-bold mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {page.pageName}
                    </motion.h1>
                    
                    {page.username && (
                      <motion.p 
                        className="text-info fs-5 mb-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        @{page.username}
                      </motion.p>
                    )}

                    <motion.div 
                      className="d-flex justify-content-center justify-content-md-start align-items-center gap-4 mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="text-white fw-bold fs-4">{followersCount}</div>
                        <div className="text-white-50 small">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white fw-bold fs-4">{page.postsCount || 0}</div>
                        <div className="text-white-50 small">Posts</div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div 
                      className="d-flex justify-content-center justify-content-md-start gap-2 flex-wrap"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {!isOwner && (
                        <button
                          className={`btn ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'} px-4`}
                          onClick={handleFollow}
                        >
                          <i className={`fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-2`}></i>
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                      
                      <button
                        className="btn btn-outline-light px-4"
                        onClick={() => setShowAbout(true)}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        About
                      </button>

                      {isOwner && (
                        <button
                          className="btn btn-success px-4"
                          onClick={() => setShowEditProfile(true)}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Edit Profile
                        </button>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <motion.div 
        className="container py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="row">
          <div className="col-lg-8">
            {/* Page Description */}
            <div className="card bg-dark border-secondary mb-4">
              <div className="card-body">
                <h5 className="card-title text-white mb-3">
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Description
                </h5>
                <p className="text-white-50 mb-0" style={{ lineHeight: "1.6" }}>
                  {page.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Posts Section - You can implement this later */}
            <div className="card bg-dark border-secondary">
              <div className="card-body">
                <h5 className="card-title text-white mb-3">
                  <i className="fas fa-images me-2 text-primary"></i>
                  Recent Posts
                </h5>
                <div className="text-center py-4">
                  <i className="fas fa-image text-white-50" style={{ fontSize: "3rem" }}></i>
                  <p className="text-white-50 mt-3">Posts feature coming soon...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Quick Info Card */}
            <div className="card bg-dark border-secondary mb-4">
              <div className="card-body">
                <h5 className="card-title text-white mb-3">
                  <i className="fas fa-info me-2 text-primary"></i>
                  Page Info
                </h5>
                
                <div className="mb-3">
                  <strong className="text-white-50">Category:</strong>
                  <div className="text-white">
                    <span className="badge bg-info mt-1">
                      {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                    </span>
                  </div>
                </div>

                {page.phone && (
                  <div className="mb-3">
                    <strong className="text-white-50">Phone:</strong>
                    <div className="text-white">
                      <i className="fas fa-phone me-2"></i>
                      {page.phone}
                    </div>
                  </div>
                )}

                {page.email && (
                  <div className="mb-3">
                    <strong className="text-white-50">Email:</strong>
                    <div className="text-white">
                      <i className="fas fa-envelope me-2"></i>
                      {page.email}
                    </div>
                  </div>
                )}

                {page.address && (
                  <div className="mb-0">
                    <strong className="text-white-50">Address:</strong>
                    <div className="text-white">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {page.address}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Page Owner Card */}
            {page.owner && (
              <div className="card bg-dark border-secondary">
                <div className="card-body">
                  <h5 className="card-title text-white mb-3">
                    <i className="fas fa-user-circle me-2 text-primary"></i>
                    Page Owner
                  </h5>
                  <div className="d-flex align-items-center">
                    <img
                      src={page.owner.profilePicture || "/default-avatar.png"}
                      alt={`${page.owner.firstName} ${page.owner.lastName}`}
                      className="rounded-circle me-3"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <div>
                      <div className="text-white fw-bold">
                        {page.owner.firstName} {page.owner.lastName}
                      </div>
                      {page.owner.username && (
                        <div className="text-info small">@{page.owner.username}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* About Modal */}
      <AboutModal 
        show={showAbout}
        onClose={() => setShowAbout(false)}
        page={page}
      />

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal 
          show={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          page={page}
          onUpdate={handleEditProfileUpdate}
        />
      )}
    </div>
  );
};

// About Modal Component
const AboutModal = ({ show, onClose, page }) => {
  if (!show || !page) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="fas fa-info-circle me-2 text-info"></i>
              About {page.pageName}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="text-center mb-4">
                  <img
                    src={page.profilePicture || "/default-page-avatar.png"}
                    alt={page.pageName}
                    className="rounded-3 mb-3"
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      objectFit: "cover",
                      border: "3px solid rgba(255, 255, 255, 0.3)"
                    }}
                  />
                  <h5 className="text-white">{page.pageName}</h5>
                  {page.username && (
                    <p className="text-info">@{page.username}</p>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-info mb-3">
                  <i className="fas fa-align-left me-2"></i>
                  Description
                </h6>
                <p className="text-white-50 mb-4">
                  {page.description || "No description available"}
                </p>

                <h6 className="text-info mb-3">
                  <i className="fas fa-chart-bar me-2"></i>
                  Statistics
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="text-white fw-bold fs-5">{page.followersCount || 0}</div>
                    <div className="text-white-50 small">Followers</div>
                  </div>
                  <div className="col-6">
                    <div className="text-white fw-bold fs-5">{page.postsCount || 0}</div>
                    <div className="text-white-50 small">Posts</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-secondary my-4" />

            <h6 className="text-info mb-3">
              <i className="fas fa-address-book me-2"></i>
              Contact Details
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <strong className="text-white-50">Category:</strong>
                <div className="text-white">
                  <span className="badge bg-info">
                    {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                  </span>
                </div>
              </div>
              {page.phone && (
                <div className="col-md-6">
                  <strong className="text-white-50">Phone:</strong>
                  <div className="text-white">
                    <i className="fas fa-phone me-2"></i>
                    {page.phone}
                  </div>
                </div>
              )}
              {page.email && (
                <div className="col-md-6">
                  <strong className="text-white-50">Email:</strong>
                  <div className="text-white">
                    <i className="fas fa-envelope me-2"></i>
                    {page.email}
                  </div>
                </div>
              )}
              {page.address && (
                <div className="col-12">
                  <strong className="text-white-50">Address:</strong>
                  <div className="text-white">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {page.address}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer border-secondary">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Modal Component
const EditProfileModal = ({ show, onClose, page, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: '',
    profilePicture: '',
    coverPhoto: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    if (show && page) {
      setFormData({
        description: page.description || '',
        profilePicture: page.profilePicture || '',
        coverPhoto: page.coverPhoto || ''
      });
      setProfilePreview(page.profilePicture || '');
      setCoverPreview(page.coverPhoto || '');
    }
  }, [show, page]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (type === 'profile') {
          setProfileImageFile(file);
          setProfilePreview(base64);
          setFormData(prev => ({...prev, profilePicture: base64}));
        } else {
          setCoverImageFile(file);
          setCoverPreview(base64);
          setFormData(prev => ({...prev, coverPhoto: base64}));
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
      const res = await axiosInstance.put(`/pages/${page.id || page._id}`, formData);
      
      if (res?.data?.success) {
        toast.success("Profile updated successfully");
        onUpdate(res.data.page);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="fas fa-edit me-2 text-success"></i>
              Edit Profile
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Cover Photo Upload */}
              <div className="mb-4">
                <label className="form-label">Cover Photo</label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control bg-dark text-white border-secondary"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'cover')}
                    />
                    <small className="text-white-50">Max file size: 5MB. Recommended: 1200x300px</small>
                  </div>
                  <div className="col-md-4">
                    {coverPreview && (
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="rounded"
                        style={{ width: "100%", height: "60px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="mb-4">
                <label className="form-label">Profile Picture</label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control bg-dark text-white border-secondary"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'profile')}
                    />
                    <small className="text-white-50">Max file size: 5MB. Recommended: Square image</small>
                  </div>
                  <div className="col-md-4">
                    {profilePreview && (
                      <img
                        src={profilePreview}
                        alt="Profile Preview"
                        className="rounded-circle"
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label">
                  Page Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control bg-dark text-white border-secondary"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Tell people what your page is about..."
                  required
                />
                <small className="text-white-50">
                  {formData.description.length}/500 characters
                </small>
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
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

export default PageWebView;
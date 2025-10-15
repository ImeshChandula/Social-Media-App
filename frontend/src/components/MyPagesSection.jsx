import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import useThemeStore from "../store/themeStore";

const MyPagesSection = ({ onViewPagePosts }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchUserPages();
  }, []);

  const fetchUserPages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/pages/my-pages");
      if (res?.data?.success) {
        setPages(res.data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      toast.error("Failed to load your pages");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (pageId) => {
    try {
      const res = await axiosInstance.put(`/pages/${pageId}/publish`);
      if (res?.data?.success) {
        toast.success("Page published successfully");
        fetchUserPages();
      }
    } catch (err) {
      console.error('Error publishing page:', err);
      toast.error(err.response?.data?.message || "Failed to publish page");
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await axiosInstance.delete(`/pages/${pageId}`);
      if (res?.data?.success) {
        toast.success("Page deleted successfully");
        fetchUserPages();
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      toast.error(err.response?.data?.message || "Failed to delete page");
    }
  };

  const handleViewPage = (page) => {
    const pageId = page.id || page._id;
    navigate(`/business-page/${pageId}`);
  };

  const getStatusBadge = (page) => {
    const status = getDisplayStatus(page);
    const styles = {
      published: { backgroundColor: '#28a745', color: 'white' },
      approved: { backgroundColor: '#17a2b8', color: 'white' },
      pending: { backgroundColor: '#ffc107', color: '#212529' },
      rejected: { backgroundColor: '#dc3545', color: 'white' },
      banned: { backgroundColor: '#343a40', color: 'white' },
      default: { backgroundColor: '#6c757d', color: 'white' }
    };

    const badgeStyle = {
      ...styles[status] || styles.default,
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold'
    };

    const labels = {
      published: "Published",
      approved: "Approved - Ready to Publish",
      pending: "Pending Admin Approval",
      rejected: "Rejected by Admin",
      banned: "Banned",
      default: "Draft"
    };

    return <span style={badgeStyle}>{labels[status] || labels.default}</span>;
  };

  const getDisplayStatus = (page) => {
    if (page.isBanned) return 'banned';
    if (page.isPublished && page.approvalStatus === 'approved') return 'published';
    if (!page.isPublished && page.approvalStatus === 'approved') return 'approved';
    if (page.approvalStatus === 'pending') return 'pending';
    if (page.approvalStatus === 'rejected') return 'rejected';
    return 'draft';
  };

  const getStatusMessage = (page) => {
    const status = getDisplayStatus(page);
    const messages = {
      published: "Your page is live and visible to everyone",
      approved: "Your page has been approved by admin. You can now publish it!",
      pending: "Your page is under admin review. You'll be notified once it's approved.",
      rejected: page.reviewNote || "Your page was rejected by admin. Please check the feedback and make necessary changes.",
      banned: page.banReason || "This page has been banned by admin.",
      default: "Complete your page setup and submit for approval"
    };

    return messages[status] || messages.default;
  };

  const canPublish = (page) => {
    return page.approvalStatus === 'approved' && !page.isPublished && !page.isBanned;
  };

  const canEdit = (page) => {
    return !page.isBanned && page.approvalStatus !== 'pending';
  };

  const content = loading ? (
    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#495057' }}>
      Loading your pages...
    </div>
  ) : pages.length === 0 ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '3rem 0' }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '3rem', color: '#adb5bd' }}>📄</div>
      </div>
      <h5 style={{ color: '#495057', marginBottom: '1rem' }}>No Pages Yet</h5>
      <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
        Create your first page to start building your brand presence and connecting with your audience.
        Your page will need admin approval before it can be published.
      </p>
      <button
        style={{
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => setShowCreateModal(true)}
      >
        Create Your First Page
      </button>
    </motion.div>
  ) : (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h5 className={`mb-1 ${isDarkMode ? "text-white" : "text-black"} `}>My Pages</h5>
          <p className="text-secondary">Manage your pages and track their performance</p>
        </div>
        <button
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Page
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {pages.map((page, index) => {
          const pageId = page.id || page._id;
          const status = getDisplayStatus(page);

          return (
            <motion.div
              key={pageId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dee2e6',
                borderRadius: '10px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <img
                  src={page.profilePicture || "/default-page-avatar.png"}
                  alt={page.pageName}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '2px solid #e9ecef',
                    marginRight: '1rem'
                  }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h6 style={{ color: '#495057', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {page.pageName}
                  </h6>
                  {page.username && (
                    <p style={{ color: '#17a2b8', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      @{page.username}
                    </p>
                  )}
                  <div style={{ marginBottom: '0.5rem' }}>
                    {getStatusBadge(page)}
                  </div>
                </div>
              </div>

              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef'
              }}>
                <small style={{ color: '#6c757d' }}>
                  {getStatusMessage(page)}
                </small>
              </div>

              <p style={{
                color: '#6c757d',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {page.description || "No description available"}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '5px',
                backgroundColor: '#f8f9fa'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#495057', fontWeight: 'bold' }}>
                    {page.followersCount || page.followers?.length || 0}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.75rem' }}>Followers</div>
                </div>
                <div style={{ borderLeft: '1px solid #dee2e6', margin: '0 1rem' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#495057', fontWeight: 'bold' }}>
                    {page.postsCount || page.posts?.length || 0}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.75rem' }}>Posts</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {status === 'published' && (
                  <>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#17a2b8',
                        border: '1px solid #17a2b8',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1,
                        fontSize: '0.875rem'
                      }}
                      onClick={() => handleViewPage(page)}
                    >
                      View Page
                    </button>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #6c757d',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        flex: 1,
                        fontSize: '0.875rem'
                      }}
                      onClick={() => onViewPagePosts && onViewPagePosts(page)}
                    >
                      Posts
                    </button>
                  </>
                )}

                {canPublish(page) && (
                  <button
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flex: 1,
                      fontSize: '0.875rem'
                    }}
                    onClick={() => handlePublish(pageId)}
                  >
                    Publish Now
                  </button>
                )}

                {canEdit(page) && (
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: '1px solid #6c757d',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => {
                      setSelectedPage(page);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                )}

                {status !== 'banned' && (
                  <button
                    style={{
                      backgroundColor: 'transparent',
                      color: '#dc3545',
                      border: '1px solid #dc3545',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                    onClick={() => handleDelete(pageId)}
                  >
                    Delete
                  </button>
                )}
              </div>

              {status === 'rejected' && page.reviewNote && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb'
                }}>
                  <small style={{ color: '#721c24' }}>
                    <strong>Admin Feedback:</strong> {page.reviewNote}
                  </small>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {content}
      <CreatePageModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPageCreated={(newPage) => {
          setPages(prev => [newPage, ...prev]);
          setShowCreateModal(false);
          toast.success("Page created and submitted for approval!");
        }}
      />

      <EditPageModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPage(null);
        }}
        page={selectedPage}
        onPageUpdated={(updatedPage) => {
          setPages(prev => prev.map(p =>
            (p.id || p._id) === (updatedPage.id || updatedPage._id) ? updatedPage : p
          ));
          setShowEditModal(false);
          setSelectedPage(null);
        }}
      />
    </>
  );
};

const CreatePageModal = ({ show, onClose, onPageCreated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: "",
    profilePicture: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (show) {
      fetchCategories();
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setFormData({
      pageName: "",
      username: "",
      description: "",
      category: "",
      phone: "",
      email: "",
      address: "",
      profilePicture: ""
    });
    setImagePreview("");
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axiosInstance.get("/pages/categories");
      if (res?.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, profilePicture: base64String }));
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.pageName.trim()) errors.push("Page name is required");
    if (!formData.description.trim()) errors.push("Description is required");
    if (!formData.category) errors.push("Category is required");
    if (!formData.phone.trim()) errors.push("Phone number is required");
    if (!formData.email.trim()) errors.push("Email address is required");
    if (!formData.address.trim()) errors.push("Business address is required");
    if (!formData.profilePicture) errors.push("Profile image is required");

    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        pageName: formData.pageName.trim(),
        username: formData.username.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim()
      };

      const res = await axiosInstance.post("/pages", submitData);

      if (res?.data?.success) {
        onPageCreated(res.data.page);
        resetForm();
      }
    } catch (err) {
      console.error('Error creating page:', err);
      const errorMessage = err.response?.data?.message || "Failed to create page";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050
    }}>
      <div style={{
        backgroundColor: '#858688FF',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{ color: '#495057', margin: 0 }}>Create New Page</h5>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            {loadingCategories ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                Loading data...
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Profile Picture <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #dee2e6'
                          }}
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Page Name <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        }}
                        value={formData.pageName}
                        onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                        placeholder="Enter page name"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Username
                      </label>
                      <div style={{ display: 'flex' }}>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#e9ecef',
                          border: '1px solid #ced4da',
                          borderRight: 'none',
                          borderRadius: '0.25rem 0 0 0.25rem'
                        }}>@</span>
                        <input
                          type="text"
                          style={{
                            flex: 1,
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '0 0.25rem 0.25rem 0'
                          }}
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="optional-username"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Description <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem'
                      }}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your page"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Category <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <select
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        }}
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Choose category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Phone Number <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        }}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Email Address <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="email"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        }}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Business Address <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        }}
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Business Street, City"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Create and Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditPageModal = ({ show, onClose, page, onPageUpdated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (show && page) {
      setFormData({
        pageName: page.pageName || "",
        username: page.username || "",
        description: page.description || "",
        category: page.category || "",
        phone: page.phone || "",
        email: page.email || "",
        address: page.address || ""
      });
      fetchCategories();
    }
  }, [show, page]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await axiosInstance.get("/pages/categories");
      if (res?.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const pageId = page?.id || page?._id;

    try {
      const submitData = {
        ...formData,
        pageName: formData.pageName.trim(),
        username: formData.username.trim(),
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim()
      };

      const res = await axiosInstance.put(`/pages/${pageId}`, submitData);

      if (res?.data?.success) {
        const message = res.data.needsApproval
          ? "Page updated. Contact details changes are pending admin approval."
          : "Page updated successfully";
        toast.success(message);
        onPageUpdated(res.data.page);
      }
    } catch (err) {
      console.error('Error updating page:', err);
      toast.error(err.response?.data?.message || "Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  const isPending = page.approvalStatus === 'pending';
  const hasContactChanges =
    formData.phone !== page.phone ||
    formData.email !== page.email ||
    formData.address !== page.address;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1050
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h5 style={{ color: '#495057', margin: 0 }}>Edit Page</h5>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6c757d'
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.5rem' }}>
            {loadingCategories ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                Loading data...
              </div>
            ) : (
              <>
                {isPending && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffecb5',
                    borderRadius: '5px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem'
                  }}>
                    This page is under admin review. Editing is disabled until review is complete.
                  </div>
                )}

                {hasContactChanges && !isPending && (
                  <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffecb5',
                    borderRadius: '5px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem'
                  }}>
                    Contact detail changes require admin approval.
                  </div>
                )}

                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Page Name <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white'
                        }}
                        value={formData.pageName}
                        onChange={(e) => setFormData(prev => ({ ...prev, pageName: e.target.value }))}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Username
                      </label>
                      <div style={{ display: 'flex' }}>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#e9ecef',
                          border: '1px solid #ced4da',
                          borderRight: 'none',
                          borderRadius: '0.25rem 0 0 0.25rem'
                        }}>@</span>
                        <input
                          type="text"
                          style={{
                            flex: 1,
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '0 0.25rem 0.25rem 0',
                            backgroundColor: isPending ? '#f8f9fa' : 'white'
                          }}
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Description <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem',
                        backgroundColor: isPending ? '#f8f9fa' : 'white'
                      }}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isPending}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Category <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <select
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#020B14FF' : 'white'
                        }}
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        disabled={isPending}
                      >
                        <option value="">Choose category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white'
                        }}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white'
                        }}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Business Address
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white'
                        }}
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            <button
              type="button"
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: (loading || isPending) ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.25rem',
                cursor: (loading || isPending) ? 'not-allowed' : 'pointer',
                opacity: (loading || isPending) ? 0.6 : 1
              }}
              disabled={loading || isPending}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyPagesSection;
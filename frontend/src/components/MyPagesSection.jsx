import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const MyPagesSection = ({ onViewPagePosts }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserPages();
  }, []);

  const fetchUserPages = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await axiosInstance.get("/pages/my-pages");
      } catch (error) {
        res = await axiosInstance.get("/pages/my");
      }
      
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
      let res;
      try {
        res = await axiosInstance.put(`/pages/${pageId}/publish`);
      } catch (error) {
        res = await axiosInstance.post(`/pages/${pageId}/publish`);
      }
      
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
      let res;
      try {
        res = await axiosInstance.delete(`/pages/${pageId}`);
      } catch (error) {
        res = await axiosInstance.post(`/pages/${pageId}/delete`);
      }
      
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
    const pageId = getPageId(page);
    navigate(`/page/${pageId}`);
  };

  const getStatusBadge = (page) => {
    const status = page.displayStatus || getDisplayStatus(page);
    const badgeStyles = {
      published: { backgroundColor: '#28a745', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
      approved: { backgroundColor: '#17a2b8', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
      pending: { backgroundColor: '#ffc107', color: '#212529', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
      rejected: { backgroundColor: '#dc3545', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
      banned: { backgroundColor: '#343a40', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' },
      default: { backgroundColor: '#6c757d', color: 'white', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }
    };
    
    switch (status) {
      case "published":
        return <span style={badgeStyles.published}>Published</span>;
      case "approved":
        return <span style={badgeStyles.approved}>Approved - Ready to Publish</span>;
      case "pending":
        return <span style={badgeStyles.pending}>Pending Admin Approval</span>;
      case "rejected":
        return <span style={badgeStyles.rejected}>Rejected by Admin</span>;
      case "banned":
        return <span style={badgeStyles.banned}>Banned</span>;
      default:
        return <span style={badgeStyles.default}>Draft</span>;
    }
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
    const status = page.displayStatus || getDisplayStatus(page);
    
    switch (status) {
      case "published":
        return "Your page is live and visible to everyone";
      case "approved":
        return "Your page has been approved by admin. You can now publish it!";
      case "pending":
        return "Your page is under admin review. You'll be notified once it's approved.";
      case "rejected":
        return page.reviewNote || "Your page was rejected by admin. Please check the feedback and make necessary changes.";
      case "banned":
        return page.banReason || "This page has been banned by admin.";
      default:
        return "Complete your page setup and submit for approval";
    }
  };

  const canPublish = (page) => {
    return page.approvalStatus === 'approved' && !page.isPublished && !page.isBanned;
  };

  const canEdit = (page) => {
    return !page.isBanned && page.approvalStatus !== 'pending';
  };

  const getPageId = (page) => page?.id || page?._id;

  const statusIconStyle = (status) => {
    const baseStyle = { marginRight: '4px' };
    switch (status) {
      case 'published': return { ...baseStyle, color: '#28a745' };
      case 'approved': return { ...baseStyle, color: '#17a2b8' };
      case 'pending': return { ...baseStyle, color: '#ffc107' };
      case 'rejected': return { ...baseStyle, color: '#dc3545' };
      case 'banned': return { ...baseStyle, color: '#343a40' };
      default: return { ...baseStyle, color: '#6c757d' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: '#495057' }}>
        <div>
          Loading your pages...
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
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
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h5 style={{ color: '#495057', marginBottom: '0.25rem' }}>My Pages</h5>
          <p style={{ color: '#6c757d', marginBottom: '0' }}>Manage your pages and track their performance</p>
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
          Create New Page
        </button>
      </div>

      {/* Pages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {pages.map((page, index) => {
          const pageId = getPageId(page);
          const status = page.displayStatus || getDisplayStatus(page);
          const statusMessage = getStatusMessage(page);
          
          return (
            <div key={pageId}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Page Header */}
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
                    <h6 style={{ color: '#495057', fontWeight: 'bold', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {page.pageName}
                    </h6>
                    {page.username && (
                      <p style={{ color: '#17a2b8', marginBottom: '0.25rem', fontSize: '0.875rem' }}>@{page.username}</p>
                    )}
                    <div style={{ marginBottom: '0.5rem' }}>
                      {getStatusBadge(page)}
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}>
                  <small style={{ color: '#6c757d', display: 'block' }}>
                    <span style={statusIconStyle(status)}>●</span>
                    {statusMessage}
                  </small>
                </div>

                {/* Page Description */}
                <p style={{
                  color: '#6c757d',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {page.description || "No description available"}
                </p>

                {/* Page Stats */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '5px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div>
                    <div style={{ color: '#495057', fontWeight: 'bold' }}>{page.followersCount || page.followers?.length || 0}</div>
                    <div style={{ color: '#6c757d', fontSize: '0.75rem' }}>Followers</div>
                  </div>
                  <div style={{ borderLeft: '1px solid #dee2e6', margin: '0 1rem' }}></div>
                  <div>
                    <div style={{ color: '#495057', fontWeight: 'bold' }}>{page.postsCount || 0}</div>
                    <div style={{ color: '#6c757d', fontSize: '0.75rem' }}>Posts</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* View Page Button - Only for published pages */}
                  {status === 'published' && (
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
                      title="View Page Webpage"
                    >
                      View Page
                    </button>
                  )}
                  
                  {/* Posts Management Button - For published pages */}
                  {status === 'published' && (
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
                      title="Manage Posts"
                    >
                      Posts
                    </button>
                  )}
                  
                  {/* Publish Button - Only for approved but unpublished pages */}
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
                      title="Publish Page"
                    >
                      Publish Now
                    </button>
                  )}

                  {/* Edit Button */}
                  {canEdit(page) && (
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#6c757d',
                        border: '1px solid #6c757d',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: status === 'pending' ? 'not-allowed' : 'pointer',
                        opacity: status === 'pending' ? 0.6 : 1
                      }}
                      onClick={() => {
                        setSelectedPage(page);
                        setShowEditModal(true);
                      }}
                      title="Edit Page"
                      disabled={status === 'pending'}
                    >
                      Edit
                    </button>
                  )}

                  {/* Delete Button */}
                  {status !== 'banned' && (
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: '#dc3545',
                        border: '1px solid #dc3545',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleDelete(pageId)}
                      title="Delete Page"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Additional Info for Rejected Pages */}
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
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreatePageModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPageCreated={(newPage) => {
          setPages(prev => [newPage, ...prev]);
          setShowCreateModal(false);
        }}
      />

      <EditPageModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        page={selectedPage}
        onPageUpdated={(updatedPage) => {
          setPages(prev => prev.map(p => 
            getPageId(p) === getPageId(updatedPage) ? updatedPage : p
          ));
          setShowEditModal(false);
        }}
      />
    </div>
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
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (show) {
      fetchCategories();
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
      setImageFile(null);
      setImagePreview("");
    }
  }, [show]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      let res;
      try {
        res = await axiosInstance.get("/pages/categories");
      } catch (error) {
        res = await axiosInstance.get("/pages/categories/list");
      }
      
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
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({...prev, profilePicture: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.pageName.trim()) {
      toast.error("Page name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Business address is required");
      return false;
    }
    if (!formData.profilePicture) {
      toast.error("Profile image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form data being sent:", {
      ...formData,
      profilePicture: formData.profilePicture ? "Base64 data present" : "Missing"
    });
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/pages", formData);
      
      if (res?.data?.success) {
        toast.success("Page submitted for admin approval successfully!");
        onPageCreated(res.data.page);
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
        setImageFile(null);
        setImagePreview("");
      }
    } catch (err) {
      console.error('Error creating page:', err);
      console.error('Server response:', err.response?.data);
      toast.error(err.response?.data?.message || "Failed to create page");
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
          <h5 style={{ color: '#495057', margin: 0 }}>
            Create New Page
          </h5>
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
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: '#6c757d' }}>
                  Loading categories...
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  backgroundColor: '#d1ecf1',
                  border: '1px solid #bee5eb',
                  borderRadius: '5px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  All fields marked with <span style={{ color: '#dc3545' }}>*</span> are required. Your page will be submitted for admin approval and cannot be published until approved.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {/* Profile Image Upload */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                      Profile Image <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <input
                          type="file"
                          style={{
                            width: '100%',
                            padding: '0.375rem 0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '0.25rem',
                            backgroundColor: 'white'
                          }}
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                        />
                        <small style={{ color: '#6c757d' }}>Max file size: 5MB. Supported: JPG, PNG, GIF</small>
                      </div>
                      <div>
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              borderRadius: '50%',
                              border: '2px solid #e9ecef'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
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
                        onChange={(e) => setFormData(prev => ({...prev, pageName: e.target.value}))}
                        placeholder="Enter page name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>Username (Optional)</label>
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
                          onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                          placeholder="optional-username"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                      Description <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem',
                        resize: 'vertical'
                      }}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      placeholder="Tell people what your page is about..."
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                        Category <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <select
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: 'white'
                        }}
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        required
                      >
                        <option value="">Choose category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
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
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
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
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
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
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                        placeholder="123 Business Street, City, State"
                        required
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
              {loading ? 'Submitting...' : 'Submit for Approval'}
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
    address: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show && page) {
      setFormData({
        pageName: page.pageName || "",
        username: page.username || "",
        description: page.description || "",
        category: page.category || "",
        phone: page.phone || "",
        email: page.email || "",
        address: page.address || "",
      });
      fetchCategories();
    }
  }, [show, page]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      let res;
      try {
        res = await axiosInstance.get("/pages/categories");
      } catch (error) {
        res = await axiosInstance.get("/pages/categories/list");
      }
      
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
      let res;
      try {
        res = await axiosInstance.put(`/pages/${pageId}`, formData);
      } catch (error) {
        res = await axiosInstance.patch(`/pages/${pageId}`, formData);
      }
      
      if (res?.data?.success) {
        const message = res.data.needsApproval 
          ? "Page updated successfully. Contact details changes are pending admin approval."
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
          <h5 style={{ color: '#495057', margin: 0 }}>
            Edit Page
          </h5>
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
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ color: '#6c757d' }}>
                  Loading data...
                </div>
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
                    This page is currently under admin review. Editing is disabled until review is complete.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                        Page Name <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white',
                          color: isPending ? '#6c757d' : '#495057'
                        }}
                        value={formData.pageName}
                        onChange={(e) => setFormData(prev => ({...prev, pageName: e.target.value}))}
                        required
                        disabled={isPending}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>Username</label>
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
                            backgroundColor: isPending ? '#f8f9fa' : 'white',
                            color: isPending ? '#6c757d' : '#495057'
                          }}
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                          disabled={isPending}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                      Description <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <textarea
                      style={{
                        width: '100%',
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem',
                        resize: 'vertical',
                        backgroundColor: isPending ? '#f8f9fa' : 'white',
                        color: isPending ? '#6c757d' : '#495057'
                      }}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                      required
                      disabled={isPending}
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
                        Category <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <select
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white',
                          color: isPending ? '#6c757d' : '#495057'
                        }}
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        required
                        disabled={isPending}
                      >
                        <option value="">Choose category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>Phone Number</label>
                      <input
                        type="tel"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white',
                          color: isPending ? '#6c757d' : '#495057'
                        }}
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.phone !== page.phone && (
                        <small style={{ color: '#ffc107', display: 'block', marginTop: '0.25rem' }}>
                          Contact changes require admin approval
                        </small>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>Email Address</label>
                      <input
                        type="email"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white',
                          color: isPending ? '#6c757d' : '#495057'
                        }}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.email !== page.email && (
                        <small style={{ color: '#ffc107', display: 'block', marginTop: '0.25rem' }}>
                          Contact changes require admin approval
                        </small>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>Business Address</label>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem',
                          backgroundColor: isPending ? '#f8f9fa' : 'white',
                          color: isPending ? '#6c757d' : '#495057'
                        }}
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.address !== page.address && (
                        <small style={{ color: '#ffc107', display: 'block', marginTop: '0.25rem' }}>
                          Contact changes require admin approval
                        </small>
                      )}
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
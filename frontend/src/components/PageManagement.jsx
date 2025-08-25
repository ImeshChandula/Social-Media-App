import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

// Page Creation Modal Component
const PageCreationModal = ({ show, onClose, onPageCreated }) => {
  const [formData, setFormData] = useState({
    pageName: '',
    username: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/pages/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post('/pages', formData);
      if (res.data.success) {
        toast.success('Page created successfully!');
        onPageCreated(res.data.page);
        onClose();
        setFormData({
          pageName: '',
          username: '',
          description: '',
          category: '',
          phone: '',
          email: '',
          address: ''
        });
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(error.response?.data?.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        zIndex: 1050,
        backdropFilter: 'blur(5px)'
      }}
    >
      <div className="w-100 h-100 overflow-auto">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-11 col-md-8 col-lg-6">
              <motion.div
                className="bg-dark rounded-3 shadow-lg border border-secondary"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary">
                  <h4 className="text-white mb-0">
                    <i className="fas fa-plus-circle text-success me-2"></i>
                    Create New Page
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-outline-light btn-sm rounded-pill"
                    onClick={onClose}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-4">
                  {loadingCategories ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-success mb-3" role="status"></div>
                      <p className="text-white-50">Loading categories...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Basic Info */}
                      <div className="mb-4">
                        <h6 className="text-success mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Basic Information
                        </h6>
                        
                        <div className="mb-3">
                          <label className="form-label text-white">
                            Page Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-secondary text-white border-0 rounded-3"
                            name="pageName"
                            value={formData.pageName}
                            onChange={handleInputChange}
                            placeholder="Enter an awesome page name"
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">Username</label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-secondary text-white border-0">@</span>
                            <input
                              type="text"
                              className="form-control bg-secondary text-white border-0 rounded-end-3"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="optional-username"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control bg-secondary text-white border-0 rounded-3"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell people what your page is about..."
                            style={{ 
                              boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
                              resize: 'vertical'
                            }}
                          ></textarea>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select form-select-lg bg-secondary text-white border-0 rounded-3"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          >
                            <option value="">Choose category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mb-4">
                        <h6 className="text-info mb-3">
                          <i className="fas fa-address-book me-2"></i>
                          Contact Information (Optional)
                        </h6>
                        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-white">Phone</label>
                            <input
                              type="tel"
                              className="form-control bg-secondary text-white border-0 rounded-3"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 8900"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-white">Email</label>
                            <input
                              type="email"
                              className="form-control bg-secondary text-white border-0 rounded-3"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="contact@example.com"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="form-label text-white">Address</label>
                          <input
                            type="text"
                            className="form-control bg-secondary text-white border-0 rounded-3"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Business address or location"
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2 rounded-3" 
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-success px-4 py-2 rounded-3" 
                    onClick={handleSubmit} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-rocket me-2"></i>
                        Create Page
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page Edit Modal Component
const PageEditModal = ({ show, onClose, page, onPageUpdated }) => {
  const [formData, setFormData] = useState({
    pageName: '',
    username: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show && page) {
      setFormData({
        pageName: page.pageName || '',
        username: page.username || '',
        description: page.description || '',
        category: page.category || '',
        phone: page.phone || '',
        email: page.email || '',
        address: page.address || ''
      });
      fetchCategories();
    }
  }, [show, page]);

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/pages/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(`/pages/${page.id}`, formData);
      if (res.data.success) {
        toast.success(res.data.message);
        onPageUpdated(res.data.page);
        onClose();
      }
    } catch (error) {
      console.error('Error updating page:', error);
      toast.error(error.response?.data?.message || 'Failed to update page');
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.8)', 
        zIndex: 1050,
        backdropFilter: 'blur(5px)'
      }}
    >
      <div className="w-100 h-100 overflow-auto">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-11 col-md-8 col-lg-6">
              <motion.div
                className="bg-dark rounded-3 shadow-lg border border-secondary"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary">
                  <h4 className="text-white mb-0">
                    <i className="fas fa-edit text-primary me-2"></i>
                    Edit Page
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-outline-light btn-sm rounded-pill"
                    onClick={onClose}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-4">
                  {loadingCategories ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status"></div>
                      <p className="text-white-50">Loading data...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Basic Info */}
                      <div className="mb-4">
                        <h6 className="text-success mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Basic Information
                        </h6>
                        
                        <div className="mb-3">
                          <label className="form-label text-white">
                            Page Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg bg-secondary text-white border-0 rounded-3"
                            name="pageName"
                            value={formData.pageName}
                            onChange={handleInputChange}
                            placeholder="Enter an awesome page name"
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">Username</label>
                          <div className="input-group input-group-lg">
                            <span className="input-group-text bg-secondary text-white border-0">@</span>
                            <input
                              type="text"
                              className="form-control bg-secondary text-white border-0 rounded-end-3"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="optional-username"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control bg-secondary text-white border-0 rounded-3"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell people what your page is about..."
                            style={{ 
                              boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
                              resize: 'vertical'
                            }}
                          ></textarea>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-white">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select form-select-lg bg-secondary text-white border-0 rounded-3"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          >
                            <option value="">Choose category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="mb-4">
                        <h6 className="text-info mb-3">
                          <i className="fas fa-address-book me-2"></i>
                          Contact Information (Optional)
                        </h6>
                        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-white">Phone</label>
                            <input
                              type="tel"
                              className="form-control bg-secondary text-white border-0 rounded-3"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 8900"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-white">Email</label>
                            <input
                              type="email"
                              className="form-control bg-secondary text-white border-0 rounded-3"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="contact@example.com"
                              style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="form-label text-white">Address</label>
                          <input
                            type="text"
                            className="form-control bg-secondary text-white border-0 rounded-3"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Business address or location"
                            style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="d-flex justify-content-end gap-3 p-4 border-top border-secondary">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4 py-2 rounded-3" 
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary px-4 py-2 rounded-3" 
                    onClick={handleSubmit} 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page Management Component
const PageManagement = ({ user }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchUserPages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/pages/my-pages');
      if (res.data.success) {
        setPages(res.data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchUserPages();
    }
  }, [expanded]);

  const handleCreatePage = () => {
    setShowCreateModal(true);
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setShowEditModal(true);
  };

  const handlePublishPage = async (pageId) => {
    try {
      const res = await axiosInstance.put(`/pages/${pageId}/publish`);
      if (res.data.success) {
        toast.success('Page published successfully!');
        fetchUserPages();
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      toast.error(error.response?.data?.message || 'Failed to publish page');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) return;
    
    try {
      const res = await axiosInstance.delete(`/pages/${pageId}`);
      if (res.data.success) {
        toast.success('Page deleted successfully!');
        fetchUserPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error(error.response?.data?.message || 'Failed to delete page');
    }
  };

  const handlePageCreated = (newPage) => {
    setPages(prev => [newPage, ...prev]);
  };

  const handlePageUpdated = (updatedPage) => {
    setPages(prev => prev.map(page => 
      page.id === updatedPage.id ? updatedPage : page
    ));
  };

  const getStatusInfo = (page) => {
    if (!page.isPublished) {
      return { 
        badge: <span className="badge bg-warning text-dark">Draft</span>,
        color: 'warning'
      };
    }
    
    switch (page.approvalStatus) {
      case 'approved':
        return { 
          badge: <span className="badge bg-success">Live</span>,
          color: 'success'
        };
      case 'pending':
        return { 
          badge: <span className="badge bg-info">Under Review</span>,
          color: 'info'
        };
      case 'rejected':
        return { 
          badge: <span className="badge bg-danger">Rejected</span>,
          color: 'danger'
        };
      default:
        return { 
          badge: <span className="badge bg-secondary">Unknown</span>,
          color: 'secondary'
        };
    }
  };

  return (
    <div className="my-5">
      {/* Header Card */}
      <div className="card bg-dark border-0 shadow-lg rounded-4 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-3 bg-primary bg-opacity-10 p-3">
                <i className="fas fa-layer-group text-primary fs-4"></i>
              </div>
              <div>
                <h5 className="text-white mb-1">My Pages</h5>
                <p className="text-white-50 mb-0 small">Create and manage your business pages</p>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn ${expanded ? 'btn-outline-primary' : 'btn-primary'} rounded-3 px-4`}
                onClick={() => setExpanded(!expanded)}
              >
                <i className={`fas fa-${expanded ? 'eye-slash' : 'eye'} me-2`}></i>
                {expanded ? 'Hide' : 'View'} Pages ({pages.length})
              </button>
              <button 
                className="btn btn-success rounded-3 px-4" 
                onClick={handleCreatePage}
              >
                <i className="fas fa-plus me-2"></i>
                Create New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {loading ? (
              <div className="card bg-dark border-0 shadow rounded-4">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status"></div>
                  <p className="text-white-50">Loading your pages...</p>
                </div>
              </div>
            ) : pages.length === 0 ? (
              <div className="card bg-dark border-0 shadow rounded-4">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-4 mx-auto" style={{ width: 'fit-content' }}>
                      <i className="fas fa-layer-group text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                  </div>
                  <h6 className="text-white mb-3">No pages yet</h6>
                  <p className="text-white-50 mb-4">Create your first page to start building your online presence</p>
                  <button className="btn btn-primary rounded-3 px-4" onClick={handleCreatePage}>
                    <i className="fas fa-plus me-2"></i>
                    Create Your First Page
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {pages.map((page, index) => {
                  const statusInfo = getStatusInfo(page);
                  return (
                    <div key={page.id} className="col-12 col-md-6 col-xl-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card bg-dark border-0 shadow rounded-4 h-100 hover-card"
                        style={{ transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="card-body p-4 d-flex flex-column">
                          {/* Header */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1">
                              <h6 className="text-white mb-2 fw-bold">
                                {page.pageName}
                              </h6>
                              {statusInfo.badge}
                            </div>
                          </div>
                          
                          {/* Username */}
                          {page.username && (
                            <p className="text-info small mb-2">
                              <i className="fas fa-at me-1"></i>
                              {page.username}
                            </p>
                          )}
                          
                          {/* Description */}
                          <p className="text-white-50 small mb-3 flex-grow-1">
                            {page.description?.length > 120 
                              ? `${page.description.substring(0, 120)}...`
                              : page.description || 'No description'
                            }
                          </p>
                          
                          {/* Stats */}
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="d-flex align-items-center text-muted small">
                              <i className="fas fa-users me-2"></i>
                              <span>{page.followersCount || 0} followers</span>
                            </div>
                            <span className="badge bg-secondary bg-opacity-50 px-3 py-2 rounded-pill">
                              {page.category?.charAt(0).toUpperCase() + page.category?.slice(1) || 'Uncategorized'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-outline-primary btn-sm rounded-3 flex-fill"
                              onClick={() => handleEditPage(page)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </button>
                            
                            {!page.isPublished && (
                              <button
                                className="btn btn-success btn-sm rounded-3 flex-fill"
                                onClick={() => handlePublishPage(page.id)}
                              >
                                <i className="fas fa-rocket me-1"></i>
                                Publish
                              </button>
                            )}
                            
                            <button
                              className="btn btn-outline-danger btn-sm rounded-3"
                              onClick={() => handleDeletePage(page.id)}
                              style={{ minWidth: '45px' }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <PageCreationModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onPageCreated={handlePageCreated}
          />
        )}
        
        {showEditModal && (
          <PageEditModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            page={selectedPage}
            onPageUpdated={handlePageUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageManagement;
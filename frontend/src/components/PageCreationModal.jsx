import React, { useState, useEffect } from 'react';

// Simulated axios instance for demo
const axiosInstance = {
  get: async () => ({ data: { success: true, categories: ['business', 'education', 'entertainment', 'technology', 'lifestyle'] } }),
  post: async (url, data) => ({ data: { success: true, page: data } })
};

// Simulated toast for demo
const toast = {
  error: (msg) => console.log('Error:', msg),
  success: (msg) => console.log('Success:', msg)
};

// ============================================
// PAGE CREATION MODAL COMPONENT (CLEANED)
// ============================================
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

  // Fetch categories when modal opens
  useEffect(() => {
    if (show) {
      fetchCategories();
    }
  }, [show]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      pageName: '',
      username: '',
      description: '',
      category: '',
      phone: '',
      email: '',
      address: ''
    });
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
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error(error.response?.data?.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        backdropFilter: 'blur(5px)'
      }}
      onClick={handleBackdropClick}
    >
      <div className="w-100 h-100 overflow-auto p-3">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="bg-white rounded shadow-lg border">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                  <h4 className="mb-0 fw-bold">
                    <i className="fas fa-plus-circle text-primary me-2"></i>
                    Create New Page
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                  ></button>
                </div>

                {/* Body */}
                <div className="p-4">
                  {loadingCategories ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading categories...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Basic Info */}
                      <div className="mb-4">
                        <h6 className="text-primary mb-3 fw-semibold">
                          <i className="fas fa-info-circle me-2"></i>
                          Basic Information
                        </h6>

                        <div className="mb-3">
                          <label className="form-label">
                            Page Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="pageName"
                            value={formData.pageName}
                            onChange={handleInputChange}
                            placeholder="Enter page name"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Username</label>
                          <div className="input-group">
                            <span className="input-group-text">@</span>
                            <input
                              type="text"
                              className="form-control"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="optional-username"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell people what your page is about..."
                          ></textarea>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
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
                        <h6 className="text-secondary mb-3 fw-semibold">
                          <i className="fas fa-address-book me-2"></i>
                          Contact Information (Optional)
                        </h6>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input
                              type="tel"
                              className="form-control"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="form-label">Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="123 Main St, City, Country"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!loadingCategories && (
                  <div className="p-4 border-top d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Create Page
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PARENT COMPONENT EXAMPLE (HOW TO USE IT)
// ============================================
const PageManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [pages, setPages] = useState([]);

  const handlePageCreated = (newPage) => {
    setPages(prev => [...prev, newPage]);
    console.log('New page created:', newPage);
  };

  return (
    <div className="container mt-5">
      <div className="text-center">
        <h2 className="mb-4">Page Management</h2>

        {/* THIS IS THE BUTTON THAT OPENS THE MODAL */}
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus-circle me-2"></i>
          Create Your First Page
        </button>

        {pages.length > 0 && (
          <div className="mt-4">
            <h5>Created Pages:</h5>
            <ul className="list-group mt-3">
              {pages.map((page, index) => (
                <li key={index} className="list-group-item">
                  <strong>{page.pageName}</strong> - {page.category}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* THE MODAL COMPONENT */}
      <PageCreationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onPageCreated={handlePageCreated}
      />
    </div>
  );
};

export default PageManagement;
// PageCreationModal.jsx
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

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
        backgroundColor: 'rgba(0,0,0,0.5)', 
        zIndex: 1050,
        backdropFilter: 'blur(5px)'
      }}
    >
      <div className="w-100 h-100 overflow-auto">
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-11 col-md-8 col-lg-6">
              <div className="bg-white rounded shadow border">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                  <h4 className="text-dark mb-0">
                    <i className="fas fa-plus-circle text-primary me-2"></i>
                    Create New Page
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-sm rounded-pill"
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
                      <p className="text-muted">Loading categories...</p>
                    </div>
                  ) : (
                    <div>
                      {/* Basic Info */}
                      <div className="mb-4">
                        <h6 className="text-primary mb-3">
                          <i className="fas fa-info-circle me-2"></i>
                          Basic Information
                        </h6>
                        
                        <div className="mb-3">
                          <label className="form-label text-dark">
                            Page Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control bg-light text-dark border rounded"
                            name="pageName"
                            value={formData.pageName}
                            onChange={handleInputChange}
                            placeholder="Enter an awesome page name"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-dark">Username</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-dark border">@</span>
                            <input
                              type="text"
                              className="form-control bg-light text-dark border rounded-end"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="optional-username"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-dark">
                            Description <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control bg-light text-dark border rounded"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Tell people what your page is about..."
                          ></textarea>
                        </div>

                        <div className="mb-3">
                          <label className="form-label text-dark">
                            Category <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select bg-light text-dark border rounded"
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
                        <h6 className="text-info mb-3">
                          <i className="fas fa-address-book me-2"></i>
                          Contact Information (Optional)
                        </h6>
                        
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label text-dark">Phone</label>
                            <input
                              type="tel"
                              className="form-control bg-light text-dark border rounded"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-dark">Email</label>
                            <input
                              type="email"
                              className="form-control bg-light text-dark border rounded"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="contact@example.com"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="form-label text-dark">Address</label>
                          <input
                            type="text"
                            className="form-control bg-light text-dark border rounded"
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
                <div className="p-4 border-top d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary rounded px-4"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary rounded px-4"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    ) : (
                      <i className="fas fa-save me-2"></i>
                    )}
                    Create Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageCreationModal;
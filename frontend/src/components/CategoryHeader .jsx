import React, { useState } from 'react';
import toast from "react-hot-toast";
import CategoryService from '../services/categoryService';
import '../styles/CategoryHeader.css';

const CategoryHeader  = ({ setShowButtons }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        categoryFor: '',
        name: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }
        
        if (!formData.categoryFor) {
            newErrors.categoryFor = 'Category type is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        
        try {
            const result = await CategoryService.createCategory(formData);

            if (result.success) {
                setFormData({
                    categoryFor: '',
                    name: '',
                    description: ''
                });
                setShowPopup(false);
                setShowButtons(true); // Show tabs after creation
                setErrors({});
                toast.success(result.message || 'Category created successfully!');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong while creating category';
                
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            categoryFor: '',
            name: '',
            description: ''
        });
        setErrors({});
        setShowPopup(false);
        setShowButtons(true); // Show tabs when canceling
    };

    const handleCreateClick = () => {
        setShowPopup(true);
        setShowButtons(false); // Hide tabs when creating
    };


  return (
    <div className="ct-container">
            <div className="ct-header">
                <h2 className="ct-title">Category Management</h2>
                <button
                    className="ct-add-button"
                    onClick={handleCreateClick}
                >
                    + Add New Category
                </button>
            </div>

            {showPopup && (
                <div className="ct-overlay">
                    <div className="ct-popup">
                        <div className="ct-popup-header">
                            <h3 className="ct-popup-title">Create New Category</h3>
                            <button className="ct-close-button" onClick={handleCancel}>×</button>
                        </div>

                        <form className="ct-form" onSubmit={handleSubmit}>
                            <div className="ct-form-group">
                                <label className="ct-label">Category For *</label>
                                <select
                                    name="categoryFor"
                                    value={formData.categoryFor}
                                    onChange={handleInputChange}
                                    className={`ct-select ${errors.categoryFor ? 'ct-input-error' : ''}`}
                                >
                                    <option value="">Select category type</option>
                                    <option value="job_role">Job Role</option>
                                    <option value="marketplace">Marketplace</option>
                                    <option value="pages">Pages</option>
                                </select>
                                {errors.categoryFor && <span className="ct-error-text">{errors.categoryFor}</span>}
                            </div>

                            <div className="ct-form-group">
                                <label className="ct-label">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    className={`ct-input ${errors.name ? 'ct-input-error' : ''}`}
                                />
                                {errors.name && <span className="ct-error-text">{errors.name}</span>}
                            </div>

                            <div className="ct-form-group">
                                <label className="ct-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter category description (optional)"
                                    rows="3"
                                    className="ct-textarea"
                                />
                            </div>

                            <div className="ct-form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="ct-cancel-button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`ct-submit-button ${loading ? 'ct-submit-disabled' : ''}`}
                                >
                                    {loading ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
  )
}


export default CategoryHeader
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CategoryService from '../services/categoryService';
import '../styles/CategoryList.css';

const CategoryListPages = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const result = await CategoryService.getAllCategories('pages');
            if (result.success) {
                setCategories(result.data);
            }
        } catch (error) {
            console.error('Error fetching page categories:', error);
            toast.error('Failed to load page categories');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category.id);
        setEditFormData({
            name: category.name,
            description: category.description || ''
        });
        setErrors({});
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditFormData({ name: '', description: '' });
        setErrors({});
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
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

    const validateEditForm = () => {
        const newErrors = {};
        if (!editFormData.name.trim()) {
            newErrors.name = 'Category name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateCategory = async (categoryId) => {
        if (!validateEditForm()) {
            return;
        }

        setEditLoading(true);
        try {
            const result = await CategoryService.updateCategory(categoryId, editFormData);
            if (result.success) {
                toast.success(result.message || 'Page category updated successfully!');
                setEditingCategory(null);
                fetchCategories(); // Refetch to get updated data
            }
        } catch (error) {
            console.error('Error updating category:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to update category';
            toast.error(message);
        } finally {
            setEditLoading(false);
        }
    };

    const handleToggleActive = async (categoryId, isActive) => {
        setActionLoading(prev => ({ ...prev, [categoryId]: true }));
        try {
            const result = isActive 
                ? await CategoryService.deactivateCategory(categoryId)
                : await CategoryService.activateCategory(categoryId);
            
            if (result.success) {
                toast.success(result.message || `Page category ${isActive ? 'deactivated' : 'activated'} successfully!`);
                fetchCategories(); // Refetch to get updated data
            }
        } catch (error) {
            console.error('Error toggling category status:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to update category status';
            toast.error(message);
        } finally {
            setActionLoading(prev => ({ ...prev, [categoryId]: false }));
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this page category? This action cannot be undone.')) {
            setActionLoading(prev => ({ ...prev, [categoryId]: true }));
            try {
                const result = await CategoryService.deleteCategory(categoryId);
                if (result.success) {
                    toast.success(result.message || 'Page category deleted successfully!');
                    fetchCategories(); // Refetch to get updated data
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                const message = error?.response?.data?.message || error?.message || 'Failed to delete category';
                toast.error(message);
            } finally {
                setActionLoading(prev => ({ ...prev, [categoryId]: false }));
            }
        }
    };

    if (loading) {
        return (
            <div className="category-list-container">
                <div className="ct-loading-container">
                    <div className="ct-loading-spinner"></div>
                    <p>Loading page categories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="category-list-container">
            <div className="category-list-header">
                <h3>Page Categories ({categories.length})</h3>
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <p>No page categories found. Create your first page category!</p>
                </div>
            ) : (
                <div className="category-grid">
                    {categories.map((category) => (
                        <div key={category.id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
                            {editingCategory === category.id ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Category Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditInputChange}
                                            className={`form-input ${errors.name ? 'error' : ''}`}
                                            placeholder="Enter category name"
                                        />
                                        {errors.name && <span className="error-text">{errors.name}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditInputChange}
                                            className="form-textarea"
                                            placeholder="Enter description (optional)"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="edit-actions">
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="btn-cancel"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateCategory(category.id)}
                                            disabled={editLoading}
                                            className="btn-save"
                                        >
                                            {editLoading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="category-header">
                                        <h4 className="category-name">{category.name}</h4>
                                        <div className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    
                                    {category.description && (
                                        <p className="category-description">{category.description}</p>
                                    )}
                                    
                                    <div className="category-meta">
                                        <div className="author-info">
                                            <img 
                                                src={category.author.profilePicture} 
                                                alt={category.author.username}
                                                className="author-avatar"
                                            />
                                            <span className="author-name">{category.author.username}</span>
                                        </div>
                                        <span className="created-date">
                                            {new Date(category.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="category-actions">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="btn-edit"
                                            disabled={actionLoading[category.id]}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(category.id, category.isActive)}
                                            className={`btn-toggle ${category.isActive ? 'deactivate' : 'activate'}`}
                                            disabled={actionLoading[category.id]}
                                        >
                                            {actionLoading[category.id] 
                                                ? 'Loading...' 
                                                : category.isActive ? 'Deactivate' : 'Activate'
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="btn-delete"
                                            disabled={actionLoading[category.id]}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryListPages;
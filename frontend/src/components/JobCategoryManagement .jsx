import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import jobCategoryService from '../services/jobCategoryService';
import styles from '../styles/JobCategoryStyle';

const JobCategoryManagement  = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            const response = await jobCategoryService.getAllCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            
            const message =
                error?.response?.data?.message || // Backend-sent message
                error?.message ||                 // General JS error
                'Something went wrong while fetching categories';
            
            toast.error(message);
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                const res = await jobCategoryService.updateCategory(editingCategory.id, formData);
                if(res.success){
                    toast.success("Job role Updated successfully");
                }
            } else {
                const res = await jobCategoryService.createCategory(formData);
                if(res.success){
                    toast.success("Job role created successfully");
                }
            }
            
            setShowModal(false);
            setFormData({ name: '', description: '' });
            setEditingCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            const message =
                error?.response?.data?.message || // Backend-sent message
                error?.message ||                 // General JS error
                'Something went wrong while fetching categories';
            
            toast.error(message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const res = await jobCategoryService.deleteCategory(id);
                if(res.success){
                    toast.success("Job role deleted successfully");
                }
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                const message =
                    error?.response?.data?.message || // Backend-sent message
                    error?.message ||                 // General JS error
                    'Something went wrong while fetching categories';
                
                toast.error(message);
            }
        }
    };

    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || 
                            (filterStatus === 'active' && category.isActive) ||
                            (filterStatus === 'inactive' && !category.isActive);
        return matchesSearch && matchesFilter;
    });

    // Media queries for responsive design
    const isMobile = window.innerWidth <= 768;



  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Job Category Management</h2>
          <button
            style={styles.addButton}
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }}
          >
            + Add New Category
          </button>
        </div>

        <div style={styles.filterSection}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchInput,
              ':focus': {
                borderColor: '#667eea',
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div>Loading categories...</div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No categories found</h3>
            <p>Try adjusting your search or filter criteria, or add a new category.</p>
          </div>
        ) : isMobile ? (
          // Mobile card view
          <div>
            {filteredCategories.map((category) => (
              <div key={category.id} style={styles.mobileCard}>
                <div style={styles.mobileCardTitle}>{category.name}</div>
                <div style={styles.mobileCardDescription}>
                  {category.description || 'No description'}
                </div>
                <div style={styles.mobileCardFooter}>
                  <div style={styles.authorInfo}>
                    {category.author?.profilePicture ? (
                      <img
                        src={category.author.profilePicture}
                        alt={category.author.username}
                        style={styles.avatar}
                      />
                    ) : (
                      <div style={styles.avatarFallback}>
                        {category.author?.username?.charAt(0) || 'A'}
                      </div>
                    )}
                    <span style={{ fontSize: '12px', color: '#4a5568' }}>
                      {category.author?.username || 'Unknown'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={styles.statusBadge(category.isActive)}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleEdit(category)}
                        style={{
                          ...styles.actionButton('#667eea'),
                          background: 'rgba(102, 126, 234, 0.1)'
                        }}
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(category.id)}
                        style={{
                          ...styles.actionButton('#f56565'),
                          background: 'rgba(245, 101, 101, 0.1)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop table view
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>Author</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600' }}>{category.name}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {category.description || 'No description'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.authorInfo}>
                        {category.author?.profilePicture ? (
                          <img
                            src={category.author.profilePicture}
                            alt={category.author.username}
                            style={styles.avatar}
                          />
                        ) : (
                          <div style={styles.avatarFallback}>
                            {category.author?.username?.charAt(0) || 'A'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {category.author?.username || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#4a5568' }}>
                            {category.author?.email || ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusBadge(category.isActive)}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(category)}
                          style={styles.actionButton('#667eea')}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                          }}
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(category.id)}
                          style={styles.actionButton('#f56565')}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(245, 101, 101, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={styles.modal} onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setFormData({ name: '', description: '' });
              setEditingCategory(null);
            }
          }}>
            <div style={styles.modalContent}>
              <h3 style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={styles.input}
                    placeholder="Enter category name"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={styles.textarea}
                    placeholder="Enter category description (optional)"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div style={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ name: '', description: '' });
                      setEditingCategory(null);
                    }}
                    style={styles.cancelButton}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#cbd5e0';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#e2e8f0';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobCategoryManagement 
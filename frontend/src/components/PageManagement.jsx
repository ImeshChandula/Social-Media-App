// PageManagement.jsx
import React, { useState, useEffect } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import PageCreationModal from './PageCreationModal'; // New separate modal file
import PageEditModal from './PageEditModal'; // New separate modal file
import PageDetail from './PageDetail'; // New component for page details

const PageManagement = ({ user }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageDetail, setShowPageDetail] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserPages();
    }
  }, [user]);

  const fetchUserPages = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/pages/my-pages');
      if (res.data.success) {
        setPages(res.data.pages || []);
      } else {
        toast.error(res.data.message || 'Failed to load pages');
      }
    } catch (error) {
      console.error('Error fetching user pages:', error);
      toast.error('Failed to load your pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => setShowCreateModal(true);

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setShowEditModal(true);
  };

  const handleViewPage = (pageId) => {
    setSelectedPageId(pageId);
    setShowPageDetail(true);
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
          badge: <span className="badge bg-success text-white">Live</span>,
          color: 'success'
        };
      case 'pending':
        return { 
          badge: <span className="badge bg-info text-white">Under Review</span>,
          color: 'info'
        };
      case 'rejected':
        return { 
          badge: <span className="badge bg-danger text-white">Rejected</span>,
          color: 'danger'
        };
      default:
        return { 
          badge: <span className="badge bg-secondary text-white">Unknown</span>,
          color: 'secondary'
        };
    }
  };

  return (
    <div className="my-5">
      {/* Header Card */}
      <div className="card bg-white border shadow rounded mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded bg-primary-subtle p-3">
                <i className="fas fa-layer-group text-primary fs-4"></i>
              </div>
              <div>
                <h5 className="text-dark mb-1">My Pages</h5>
                <p className="text-muted mb-0 small">Create and manage your business pages</p>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn ${expanded ? 'btn-outline-primary' : 'btn-primary'} rounded px-4`}
                onClick={() => setExpanded(!expanded)}
              >
                <i className={`fas fa-${expanded ? 'eye-slash' : 'eye'} me-2`}></i>
                {expanded ? 'Hide' : 'View'} Pages ({pages.length})
              </button>
              <button 
                className="btn btn-primary rounded px-4" 
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
              <div className="card bg-white border shadow rounded">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary mb-3" role="status"></div>
                  <p className="text-muted">Loading your pages...</p>
                </div>
              </div>
            ) : pages.length === 0 ? (
              <div className="card bg-white border shadow rounded">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <div className="rounded-circle bg-primary-subtle p-4 mx-auto" style={{ width: 'fit-content' }}>
                      <i className="fas fa-layer-group text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                  </div>
                  <h6 className="text-dark mb-3">No pages yet</h6>
                  <p className="text-muted mb-4">Create your first page to start building your online presence</p>
                  <button className="btn btn-primary rounded px-4" onClick={handleCreatePage}>
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
                        className="card bg-white border shadow rounded h-100"
                        style={{ transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div className="card-body p-4 d-flex flex-column">
                          {/* Header */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="flex-grow-1">
                              <h6 className="text-dark mb-2 fw-bold">
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
                          <p className="text-muted small mb-3 flex-grow-1">
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
                            <span className="badge bg-secondary px-3 py-2 rounded-pill">
                              {page.category?.charAt(0).toUpperCase() + page.category?.slice(1) || 'Uncategorized'}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              className="btn btn-outline-primary btn-sm rounded flex-fill"
                              onClick={() => handleViewPage(page.id)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              View
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm rounded flex-fill"
                              onClick={() => handleEditPage(page)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </button>
                            
                            {!page.isPublished && (
                              <button
                                className="btn btn-success btn-sm rounded flex-fill"
                                onClick={() => handlePublishPage(page.id)}
                              >
                                <i className="fas fa-rocket me-1"></i>
                                Publish
                              </button>
                            )}
                            
                            <button
                              className="btn btn-outline-danger btn-sm rounded"
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

        {showPageDetail && (
          <PageDetail
            show={showPageDetail}
            onClose={() => setShowPageDetail(false)}
            pageId={selectedPageId}
            isOwner={true} // Since it's from my pages
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageManagement;
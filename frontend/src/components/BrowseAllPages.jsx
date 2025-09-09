import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const BrowseAllPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "" });
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageDetail, setShowPageDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchAllPages();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAllPages(), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchCategories = async () => {
    try {
      let res;
      try {
        res = await axiosInstance.get("/pages/categories");
      } catch (error) {
        try {
          res = await axiosInstance.get("/pages/categories/list");
        } catch (error2) {
          res = await axiosInstance.get("/categories");
        }
      }
      
      if (res?.data?.success) {
        setCategories(res.data.categories || res.data.data || []);
      } else if (res?.data) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories(['business', 'entertainment', 'education', 'technology', 'sports', 'news']);
    }
  };

  const fetchAllPages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);

      let res;
      try {
        res = await axiosInstance.get(`/pages?${params.toString()}`);
      } catch (error) {
        try {
          res = await axiosInstance.get(`/pages/list?${params.toString()}`);
        } catch (error2) {
          try {
            res = await axiosInstance.get(`/pages/browse?${params.toString()}`);
          } catch (error3) {
            res = await axiosInstance.get(`/pages/all?${params.toString()}`);
          }
        }
      }
      
      if (res?.data?.success) {
        setPages(res.data.pages || res.data.data || []);
      } else if (res?.data) {
        const pageData = res.data.pages || res.data.data || res.data || [];
        setPages(Array.isArray(pageData) ? pageData : []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      console.error('Response:', err.response?.data);
      toast.error(err.response?.data?.message || "Failed to load pages. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleViewPage = (page) => {
    setSelectedPage(page);
    setShowPageDetail(true);
  };

  const handleViewPageWebsite = (page) => {
    const pageId = page?.id || page?._id;
    navigate(`/page/${pageId}`);
  };

  const handleFollowPage = async (pageId) => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/follow`);
      if (res?.data?.success) {
        toast.success("Followed page successfully!");
        setPages(prev => prev.map(page => 
          (page.id === pageId || page._id === pageId) 
            ? { ...page, isFollowing: true, followersCount: (page.followersCount || 0) + 1 }
            : page
        ));
        // Update selected page if it's the same page
        if (selectedPage && (selectedPage.id === pageId || selectedPage._id === pageId)) {
          setSelectedPage(prev => ({
            ...prev,
            isFollowing: true,
            followersCount: (prev.followersCount || 0) + 1
          }));
        }
      }
    } catch (err) {
      console.error('Error following page:', err);
      toast.error(err.response?.data?.message || "Failed to follow page");
    }
  };

  const handleUnfollowPage = async (pageId) => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/unfollow`);
      if (res?.data?.success) {
        toast.success("Unfollowed page successfully!");
        setPages(prev => prev.map(page => 
          (page.id === pageId || page._id === pageId) 
            ? { ...page, isFollowing: false, followersCount: Math.max(0, (page.followersCount || 0) - 1) }
            : page
        ));
        // Update selected page if it's the same page
        if (selectedPage && (selectedPage.id === pageId || selectedPage._id === pageId)) {
          setSelectedPage(prev => ({
            ...prev,
            isFollowing: false,
            followersCount: Math.max(0, (prev.followersCount || 0) - 1)
          }));
        }
      }
    } catch (err) {
      console.error('Error unfollowing page:', err);
      toast.error(err.response?.data?.message || "Failed to unfollow page");
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#00193143", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-light mb-2 fw-bold">Discover Pages</h2>
        <p className="text-muted-light mb-0">Find and follow pages that interest you</p>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="position-relative">
            <input
              type="text"
              className="form-control bg-white border-light ps-5 shadow-sm"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="🔍Search pages..."
              style={{
                borderRadius: "12px",
                border: "2px solid #e9ecef",
                fontSize: "15px",
                height: "48px"
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select bg-white border-light shadow-sm"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{
              borderRadius: "12px",
              border: "2px solid #e9ecef",
              fontSize: "15px",
              height: "48px"
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted mt-3">Loading pages...</div>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-search text-muted" style={{ fontSize: "4rem" }}></i>
          </div>
          <h4 className="text-dark mb-3">No Pages Found</h4>
          <p className="text-muted">Try adjusting your search or filters to find more pages.</p>
        </div>
      ) : (
        <div className="row g-4">
          {pages.map((page, index) => {
            const pageId = page?.id || page?._id;
            return (
              <div key={pageId} className="col-md-6 col-lg-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card border-0 h-100 shadow-sm hover-shadow"
                  style={{
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff"
                  }}
                  onClick={() => handleViewPage(page)}
                >
                  <div className="card-body d-flex flex-column p-4">
                    {/* Page Header */}
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={page.profilePicture || "/default-page-avatar.png"}
                        alt={page.pageName}
                        className="rounded-circle me-3 shadow-sm"
                        style={{ 
                          width: "64px", 
                          height: "64px", 
                          objectFit: "cover",
                          border: "3px solid #e9ecef"
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <h5 className="text-dark fw-bold mb-1 text-truncate">
                          {page.pageName}
                        </h5>
                        {page.username && (
                          <p className="text-primary mb-2 small fw-medium">@{page.username}</p>
                        )}
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1" 
                              style={{ borderRadius: "20px", fontSize: "12px" }}>
                          {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                        </span>
                      </div>
                    </div>

                    {/* Page Description */}
                    <p className="text-muted small mb-3 flex-grow-1" 
                       style={{
                         display: "-webkit-box",
                         WebkitLineClamp: "3",
                         WebkitBoxOrient: "vertical",
                         overflow: "hidden",
                         lineHeight: "1.5"
                       }}>
                      {page.description || "No description available"}
                    </p>

                    {/* Page Stats */}
                    <div className="text-center mb-3 py-3 px-3 rounded-3"
                         style={{ backgroundColor: "#f8f9fa" }}>
                      <div className="text-dark fw-bold fs-5">{page.followersCount || page.followers?.length || 0}</div>
                      <div className="text-muted small">Followers</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-fill fw-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPageWebsite(page);
                        }}
                        style={{ 
                          borderRadius: "10px",
                          height: "40px",
                          fontSize: "14px"
                        }}
                      >
                        View Page
                      </button>
                      
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPage(page);
                        }}
                        style={{ 
                          borderRadius: "10px",
                          height: "40px",
                          minWidth: "50px"
                        }}
                      >
                        Details
                      </button>
                      
                      {!page.isOwner && (
                        <button
                          className={`btn btn-sm ${page.isFollowing ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            page.isFollowing ? handleUnfollowPage(pageId) : handleFollowPage(pageId);
                          }}
                          style={{ 
                            borderRadius: "10px",
                            height: "40px",
                            minWidth: "90px",
                            fontSize: "13px"
                          }}
                        >
                          {page.isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Page Detail Modal */}
      <PageDetailModal 
        show={showPageDetail}
        onClose={() => setShowPageDetail(false)}
        page={selectedPage}
        onFollow={handleFollowPage}
        onUnfollow={handleUnfollowPage}
      />

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          transform: translateY(-2px);
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

// IMPROVED AND RESPONSIVE Page Detail Modal Component
const PageDetailModal = ({ show, onClose, page, onFollow, onUnfollow }) => {
  if (!show || !page) return null;

  const pageId = page?.id || page?._id;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop fade show"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1050
            }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" 
                 style={{ maxWidth: '600px', margin: '1rem' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px", overflow: 'hidden' }}
              >
                {/* Header */}
                <div className="modal-header border-0 bg-gradient-primary text-white px-4 py-3"
                     style={{ 
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                       borderRadius: '20px 20px 0 0'
                     }}>
                  <h5 className="modal-title fw-bold mb-0">
                    
                    Page Details
                  </h5>
                  <button 
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={onClose}
                  />
                </div>
                
                {/* Body */}
                <div className="modal-body p-0 bg-white">
                  {/* Profile Section */}
                  <div className="text-center p-4 border-bottom">
                    <div className="position-relative d-inline-block">
                      <img
                        src={page.profilePicture || "/default-page-avatar.png"}
                        alt={page.pageName}
                        className="rounded-circle shadow-lg mb-3"
                        style={{ 
                          width: "100px", 
                          height: "100px", 
                          objectFit: "cover",
                          border: "4px solid #fff",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.15)"
                        }}
                      />
                      {page.isVerified && (
                        <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1"
                             style={{ width: '28px', height: '28px' }}>
                          
                        </div>
                      )}
                    </div>
                    
                    <h4 className="fw-bold text-dark mb-1">{page.pageName}</h4>
                    {page.username && (
                      <p className="text-primary mb-3 fw-medium">@{page.username}</p>
                    )}
                    
                    <div className="d-inline-block">
                      <span className="badge px-3 py-2 text-white fw-medium"
                            style={{ 
                              backgroundColor: '#667eea',
                              borderRadius: '25px',
                              fontSize: '13px'
                            }}>
                        
                        {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="px-4 py-3 bg-light">
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="text-primary fw-bold fs-4">{page.followersCount || 0}</div>
                        <div className="text-muted small">Followers</div>
                      </div>
                      <div className="col-4">
                        <div className="text-primary fw-bold fs-4">{page.postsCount || 0}</div>
                        <div className="text-muted small">Posts</div>
                      </div>
                      <div className="col-4">
                        <div className="text-primary fw-bold fs-4">
                          {page.isPublished ? 'Live' : 'Draft'}
                        </div>
                        <div className="text-muted small">Status</div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 border-bottom">
                    <h6 className="text-primary fw-bold mb-3">
                      About
                    </h6>
                    <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                      {page.description || "No description available"}
                    </p>
                  </div>

                  {/* Contact Information */}
                  {(page.phone || page.email || page.address) && (
                    <div className="p-4 border-bottom">
                      <h6 className="text-primary fw-bold mb-3">
                        Contact Information
                      </h6>
                      <div className="row g-3">
                        {page.phone && (
                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              
                              <div>
                                <strong className="text-dark">Phone:</strong>
                                <div className="text-muted">{page.phone}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {page.email && (
                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              
                              <div>
                                <strong className="text-dark">Email:</strong>
                                <div className="text-muted">{page.email}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {page.address && (
                          <div className="col-12">
                            <div className="d-flex align-items-start">
                             
                              <div>
                                <strong className="text-dark">Address:</strong>
                                <div className="text-muted">{page.address}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Owner Information */}
                  {page.owner && (
                    <div className="p-4">
                      <h6 className="text-primary fw-bold mb-3">
                       Page Owner
                      </h6>
                      <div className="d-flex align-items-center p-3 rounded-3 bg-light">
                        <img
                          src={page.owner.profilePicture || "/default-avatar.png"}
                          alt={`${page.owner.firstName || ''} ${page.owner.lastName || ''}`}
                          className="rounded-circle me-3 shadow-sm"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <div className="text-dark fw-bold">
                            {page.owner.firstName && page.owner.lastName 
                              ? `${page.owner.firstName} ${page.owner.lastName}`
                              : 'Page Owner'
                            }
                          </div>
                          {page.owner.username && (
                            <div className="text-primary small">@{page.owner.username}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 bg-light px-4 py-3">
                  <div className="d-flex gap-2 w-100">
                    {!page.isOwner && (
                      <button
                        className={`btn flex-grow-1 fw-medium ${
                          page.isFollowing 
                            ? 'btn-outline-danger' 
                            : 'btn-primary'
                        }`}
                        onClick={() => page.isFollowing ? onUnfollow(pageId) : onFollow(pageId)}
                        style={{ 
                          borderRadius: '12px',
                          height: '48px'
                        }}
                      >
                       
                        {page.isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    )}
                    <button 
                      className="btn btn-secondary fw-medium"
                      onClick={onClose}
                      style={{ 
                        borderRadius: '12px',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BrowseAllPages;
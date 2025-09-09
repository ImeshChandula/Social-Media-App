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
      // Try multiple possible endpoints for categories
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
      // Set some default categories if API fails
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
      // Try multiple possible endpoints for pages
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
        // Handle different response structures
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
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-primary btn-sm flex-fill fw-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPageWebsite(page);
                        }}
                        style={{ 
                          borderRadius: "10px",
                          height: "40px",
                          width: "40px",
                          fontSize: "14px"
                        }}
                      >
                        {/* <i className="fas fa-globe me-2"></i> */}
                        View Page
                      </button>
                      
                      <button
                        className="btn btn-outline-secondary btn-sm px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPage(page);
                        }}
                        style={{ 
                          borderRadius: "10px",
                          height: "40px",
                          width: "40px"
                        }}
                      >
                        {/* <i className="fas fa-info"></i> */}
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
    padding: "0 10px", // adjust side spacing
    minWidth: "90px",  // optional, to keep it consistent
    fontSize: "13px"   // makes text look neat
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

// Page Detail Modal Component
const PageDetailModal = ({ show, onClose, page, onFollow, onUnfollow }) => {
  if (!show || !page) return null;

  const pageId = page?.id || page?._id;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0" style={{ borderRadius: "16px" }}>
          <div className="modal-header border-bottom border-light bg-light" 
               style={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
            <h5 className="modal-title text-dark fw-bold">
              
              📘Page Details
            </h5>
            <button 
              className="btn-close" 
              onClick={onClose}
              style={{ fontSize: "14px" }}
            ></button>
          </div>
          
          <div className="modal-body bg-white p-4">
            <div className="row">
              {/* Left Column - Basic Info */}
              <div className="col-lg-4">
                <div className="text-center mb-4">
                  <img
                    src={page.profilePicture || "/default-page-avatar.png"}
                    alt={page.pageName}
                    className="rounded-3 mb-3 shadow-sm"
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      objectFit: "cover",
                      border: "3px solid #e9ecef"
                    }}
                  />
                  <h4 className="text-dark mb-2 fw-bold">{page.pageName}</h4>
                  {page.username && (
                    <p className="text-primary mb-3 fw-medium">@{page.username}</p>
                  )}
                  
                  <div className="d-flex justify-content-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-dark fw-bold fs-4">{page.followersCount || 0}</div>
                      <div className="text-muted small">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-dark fw-bold fs-4">{page.postsCount || 0}</div>
                      <div className="text-muted small">Posts</div>
                    </div>
                  </div>

                  {!page.isOwner && (
                    <button
                      className={`btn w-100 fw-medium ${page.isFollowing ? 'btn-outline-danger' : 'btn-primary'}`}
                      onClick={() => page.isFollowing ? onUnfollow(pageId) : onFollow(pageId)}
                      style={{ borderRadius: "12px", height: "48px" }}
                    >
                      <i className={`fas ${page.isFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-2`}></i>
                      {page.isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="col-lg-8">
                <div className="mb-4">
                  <h6 className="text-primary mb-3 fw-bold">
                    
                     ℹ️About
                  </h6>
                  <div className="p-4 rounded-3 bg-light">
                    <p className="text-muted mb-0" style={{ lineHeight: "1.6" }}>
                      {page.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-primary mb-3 fw-bold">
                    
                   🏷️Details
                  </h6>
                  <div className="p-4 rounded-3 bg-light">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <strong className="text-dark">Category:</strong>
                        <div className="text-muted mt-1">
                          {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                        </div>
                      </div>
                      {page.phone && (
                        <div className="col-sm-6">
                          <strong className="text-dark">Phone:</strong>
                          <div className="text-muted mt-1">{page.phone}</div>
                        </div>
                      )}
                      {page.email && (
                        <div className="col-sm-6">
                          <strong className="text-dark">Email:</strong>
                          <div className="text-muted mt-1">{page.email}</div>
                        </div>
                      )}
                      {page.address && (
                        <div className="col-12">
                          <strong className="text-dark">Address:</strong>
                          <div className="text-muted mt-1">{page.address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {page.owner && (
                  <div className="mb-4">
                    <h6 className="text-primary mb-3 fw-bold">
                    
                       👤Page Owner
                    </h6>
                    <div className="p-4 rounded-3 bg-light">
                      <div className="d-flex align-items-center">
                        <img
                          src={page.owner.profilePicture || "/default-avatar.png"}
                          alt={`${page.owner.firstName} ${page.owner.lastName}`}
                          className="rounded-circle me-3 shadow-sm"
                          style={{ width: "56px", height: "56px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="text-dark fw-bold">
                            {page.owner.firstName} {page.owner.lastName}
                          </div>
                          {page.owner.username && (
                            <div className="text-primary small">@{page.owner.username}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-top border-light bg-light" 
               style={{ borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}>
            <button 
              className="btn btn-secondary fw-medium" 
              onClick={onClose}
              style={{ borderRadius: "10px", paddingLeft: "24px", paddingRight: "24px" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseAllPages;
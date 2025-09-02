// BrowseAllPages.jsx - Component to browse all pages
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const BrowseAllPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", search: "" });
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPageDetail, setShowPageDetail] = useState(false);

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
        res = await axiosInstance.get("/pages/categories/list");
      }
      
      if (res?.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
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
        res = await axiosInstance.get(`/pages/list?${params.toString()}`);
      }
      
      if (res?.data?.success) {
        setPages(res.data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      toast.error("Failed to load pages");
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

  const handleFollowPage = async (pageId) => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/follow`);
      if (res?.data?.success) {
        toast.success("Followed page successfully!");
        // Update the page in the list
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
        // Update the page in the list
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
    <div>
      {/* Header */}
      <div className="mb-4">
        <h5 className="text-white mb-2">Discover Pages</h5>
        <p className="text-white-50 mb-0">Find and follow pages that interest you</p>
      </div>

      {/* Filters */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="position-relative">
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary ps-5"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search pages..."
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select bg-dark text-white border-secondary"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
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
          <div className="text-white normal-loading-spinner">
            Loading pages<span className="dot-flash">.</span>
            <span className="dot-flash">.</span>
            <span className="dot-flash">.</span>
          </div>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-search text-white-50" style={{ fontSize: "3rem" }}></i>
          </div>
          <h5 className="text-white mb-3">No Pages Found</h5>
          <p className="text-white-50">Try adjusting your search or filters to find more pages.</p>
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
                  className="card bg-dark border-secondary h-100 shadow-lg"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    cursor: "pointer"
                  }}
                  onClick={() => handleViewPage(page)}
                />
                  <div className="card-body d-flex flex-column">
                    {/* Page Header */}
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={page.profilePicture || "/default-page-avatar.png"}
                        alt={page.pageName}
                        className="rounded-circle me-3"
                        style={{ 
                          width: "60px", 
                          height: "60px", 
                          objectFit: "cover",
                          border: "2px solid rgba(255, 255, 255, 0.3)"
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="text-white fw-bold mb-1 text-truncate">
                          {page.pageName}
                        </h6>
                        {page.username && (
                          <p className="text-info mb-1 small">@{page.username}</p>
                        )}
                        <span className="badge bg-info">
                          {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                        </span>
                      </div>
                    </div>

                    {/* Page Description */}
                    <p className="text-white-50 small mb-3 flex-grow-1" 
                       style={{
                         display: "-webkit-box",
                         WebkitLineClamp: "3",
                         WebkitBoxOrient: "vertical",
                         overflow: "hidden"
                       }}>
                      {page.description || "No description available"}
                    </p>

                    {/* Page Stats */}
                    <div className="text-center mb-3 py-2 px-3 rounded"
                         style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                      <div className="text-white fw-bold">{page.followersCount || 0}</div>
                      <div className="text-white-50 small">Followers</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-info btn-sm flex-fill"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPage(page);
                        }}
                      >
                        <i className="fas fa-eye me-1"></i>
                        View
                      </button>
                      
                      {!page.isOwner && (
                        <button
                          className={`btn btn-sm ${page.isFollowing ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            page.isFollowing ? handleUnfollowPage(pageId) : handleFollowPage(pageId);
                          }}
                        >
                          <i className={`fas ${page.isFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-1`}></i>
                          {page.isFollowing ? 'Unfollow' : 'Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              //</div>
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
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="fas fa-layer-group me-2 text-info"></i>
              Page Details
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* Left Column - Basic Info */}
              <div className="col-lg-4">
                <div className="text-center mb-4">
                  <img
                    src={page.profilePicture || "/default-page-avatar.png"}
                    alt={page.pageName}
                    className="rounded-3 mb-3"
                    style={{ 
                      width: "120px", 
                      height: "120px", 
                      objectFit: "cover",
                      border: "3px solid rgba(255, 255, 255, 0.3)"
                    }}
                  />
                  <h5 className="text-white mb-2">{page.pageName}</h5>
                  {page.username && (
                    <p className="text-info mb-3">@{page.username}</p>
                  )}
                  
                  <div className="d-flex justify-content-center gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-white fw-bold fs-5">{page.followersCount || 0}</div>
                      <div className="text-white-50 small">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white fw-bold fs-5">{page.postsCount || 0}</div>
                      <div className="text-white-50 small">Posts</div>
                    </div>
                  </div>

                  {!page.isOwner && (
                    <button
                      className={`btn ${page.isFollowing ? 'btn-outline-secondary' : 'btn-success'} w-100`}
                      onClick={() => page.isFollowing ? onUnfollow(pageId) : onFollow(pageId)}
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
                  <h6 className="text-info mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    About
                  </h6>
                  <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <p className="text-white-50 mb-0">
                      {page.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-info mb-3">
                    <i className="fas fa-tag me-2"></i>
                    Details
                  </h6>
                  <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <strong className="text-white-50">Category:</strong>
                        <div className="text-white">
                          {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
                        </div>
                      </div>
                      {page.phone && (
                        <div className="col-sm-6">
                          <strong className="text-white-50">Phone:</strong>
                          <div className="text-white">{page.phone}</div>
                        </div>
                      )}
                      {page.email && (
                        <div className="col-sm-6">
                          <strong className="text-white-50">Email:</strong>
                          <div className="text-white">{page.email}</div>
                        </div>
                      )}
                      {page.address && (
                        <div className="col-12">
                          <strong className="text-white-50">Address:</strong>
                          <div className="text-white">{page.address}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {page.owner && (
                  <div className="mb-4">
                    <h6 className="text-info mb-3">
                      <i className="fas fa-user-circle me-2"></i>
                      Page Owner
                    </h6>
                    <div className="p-3 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                      <div className="d-flex align-items-center">
                        <img
                          src={page.owner.profilePicture || "/default-avatar.png"}
                          alt={`${page.owner.firstName} ${page.owner.lastName}`}
                          className="rounded-circle me-3"
                          style={{ width: "50px", height: "50px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="text-white fw-bold">
                            {page.owner.firstName} {page.owner.lastName}
                          </div>
                          {page.owner.username && (
                            <div className="text-info small">@{page.owner.username}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-secondary">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseAllPages;
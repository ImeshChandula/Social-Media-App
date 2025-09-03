import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Add this import
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const MyPagesSection = ({ onViewPagePosts }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const navigate = useNavigate(); // Add this line

  useEffect(() => {
    fetchUserPages();
  }, []);

  const fetchUserPages = async () => {
    setLoading(true);
    try {
      // Try multiple endpoints for resilience
      let res;
      try {
        res = await axiosInstance.get("/pages/my-pages");
      } catch (error) {
        // Fallback endpoint
        res = await axiosInstance.get("/pages/my");
      }
      
      if (res?.data?.success) {
        setPages(res.data.pages || []);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      toast.error("Failed to load your pages");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (pageId) => {
    try {
      let res;
      try {
        res = await axiosInstance.put(`/pages/${pageId}/publish`);
      } catch (error) {
        // Fallback endpoint
        res = await axiosInstance.post(`/pages/${pageId}/publish`);
      }
      
      if (res?.data?.success) {
        toast.success("Page published successfully");
        fetchUserPages();
      }
    } catch (err) {
      console.error('Error publishing page:', err);
      toast.error(err.response?.data?.message || "Failed to publish page");
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      return;
    }

    try {
      let res;
      try {
        res = await axiosInstance.delete(`/pages/${pageId}`);
      } catch (error) {
        // Fallback endpoint
        res = await axiosInstance.post(`/pages/${pageId}/delete`);
      }
      
      if (res?.data?.success) {
        toast.success("Page deleted successfully");
        fetchUserPages();
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      toast.error(err.response?.data?.message || "Failed to delete page");
    }
  };

  // Add this new function
  const handleViewPage = (page) => {
    const pageId = getPageId(page);
    navigate(`/page/${pageId}`);
  };

  const getStatusBadge = (page) => {
    const status = page.displayStatus || getDisplayStatus(page);
    
    switch (status) {
      case "published":
        return <span className="badge bg-success">Published</span>;
      case "approved":
        return <span className="badge bg-info">Approved - Ready to Publish</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">Pending Admin Approval</span>;
      case "rejected":
        return <span className="badge bg-danger">Rejected by Admin</span>;
      case "banned":
        return <span className="badge bg-dark">Banned</span>;
      default:
        return <span className="badge bg-secondary">Draft</span>;
    }
  };

  const getDisplayStatus = (page) => {
    if (page.isBanned) return 'banned';
    if (page.isPublished && page.approvalStatus === 'approved') return 'published';
    if (!page.isPublished && page.approvalStatus === 'approved') return 'approved';
    if (page.approvalStatus === 'pending') return 'pending';
    if (page.approvalStatus === 'rejected') return 'rejected';
    return 'draft';
  };

  const getStatusMessage = (page) => {
    const status = page.displayStatus || getDisplayStatus(page);
    
    switch (status) {
      case "published":
        return "Your page is live and visible to everyone";
      case "approved":
        return "Your page has been approved by admin. You can now publish it!";
      case "pending":
        return "Your page is under admin review. You'll be notified once it's approved.";
      case "rejected":
        return page.reviewNote || "Your page was rejected by admin. Please check the feedback and make necessary changes.";
      case "banned":
        return page.banReason || "This page has been banned by admin.";
      default:
        return "Complete your page setup and submit for approval";
    }
  };

  const canPublish = (page) => {
    return page.approvalStatus === 'approved' && !page.isPublished && !page.isBanned;
  };

  const canEdit = (page) => {
    return !page.isBanned && page.approvalStatus !== 'pending';
  };

  const getPageId = (page) => page?.id || page?._id;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="text-white normal-loading-spinner">
          Loading your pages<span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-5"
      >
        <div className="mb-4">
          <i className="fas fa-layer-group text-white-50" style={{ fontSize: "3rem" }}></i>
        </div>
        <h5 className="text-white mb-3">No Pages Yet</h5>
        <p className="text-white-50 mb-4">
          Create your first page to start building your brand presence and connecting with your audience.
          Your page will need admin approval before it can be published.
        </p>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create Your First Page
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-white mb-1">My Pages</h5>
          <p className="text-white-50 mb-0">Manage your pages and track their performance</p>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create New Page
        </button>
      </div>

      {/* Pages Grid */}
      <div className="row g-4">
        {pages.map((page, index) => {
          const pageId = getPageId(page);
          const status = page.displayStatus || getDisplayStatus(page);
          const statusMessage = getStatusMessage(page);
          
          return (
            <div key={pageId} className="col-md-6 col-lg-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card bg-dark border-secondary h-100 shadow"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}
              >
                <div className="card-body d-flex flex-column">
                  {/* Page Header */}
                  <div className="d-flex align-items-start mb-3">
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
                      <div className="mb-2">
                        {getStatusBadge(page)}
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mb-3 p-2 rounded" 
                       style={{ 
                         backgroundColor: "rgba(255, 255, 255, 0.05)",
                         border: "1px solid rgba(255, 255, 255, 0.1)"
                       }}>
                    <small className="text-white-50 d-block">
                      <i className={`fas ${
                        status === 'published' ? 'fa-check-circle text-success' :
                        status === 'approved' ? 'fa-thumbs-up text-info' :
                        status === 'pending' ? 'fa-clock text-warning' :
                        status === 'rejected' ? 'fa-times-circle text-danger' :
                        status === 'banned' ? 'fa-ban text-dark' :
                        'fa-edit text-secondary'
                      } me-1`}></i>
                      {statusMessage}
                    </small>
                  </div>

                  {/* Page Description */}
                  <p className="text-white-50 small mb-3 flex-grow-1" 
                     style={{
                       display: "-webkit-box",
                       WebkitLineClamp: "2",
                       WebkitBoxOrient: "vertical",
                       overflow: "hidden"
                     }}>
                    {page.description || "No description available"}
                  </p>

                  {/* Page Stats */}
                  <div className="d-flex justify-content-between text-center mb-3 py-2 px-3 rounded"
                       style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
                    <div>
                      <div className="text-white fw-bold">{page.followersCount || 0}</div>
                      <div className="text-white-50 small">Followers</div>
                    </div>
                    <div className="border-start border-secondary mx-2"></div>
                    <div>
                      <div className="text-white fw-bold">{page.postsCount || 0}</div>
                      <div className="text-white-50 small">Posts</div>
                    </div>
                  </div>

                  {/* Action Buttons - UPDATED */}
                  <div className="d-flex gap-2 flex-wrap">
                    {/* View Page Button - Only for published pages */}
                    {status === 'published' && (
                      <button
                        className="btn btn-outline-info btn-sm flex-fill"
                        onClick={() => handleViewPage(page)}
                        title="View Page Webpage"
                      >
                        <i className="fas fa-globe me-1"></i>
                        View Page
                      </button>
                    )}
                    
                    {/* Posts Management Button - For published pages */}
                    {status === 'published' && (
                      <button
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={() => onViewPagePosts && onViewPagePosts(page)}
                        title="Manage Posts"
                      >
                        <i className="fas fa-edit me-1"></i>
                        Posts
                      </button>
                    )}
                    
                    {/* Publish Button - Only for approved but unpublished pages */}
                    {canPublish(page) && (
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => handlePublish(pageId)}
                        title="Publish Page"
                      >
                        <i className="fas fa-rocket me-1"></i>
                        Publish Now
                      </button>
                    )}

                    {/* Edit Button */}
                    {canEdit(page) && (
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setSelectedPage(page);
                          setShowEditModal(true);
                        }}
                        title="Edit Page"
                        disabled={status === 'pending'}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    )}

                    {/* Delete Button */}
                    {status !== 'banned' && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(pageId)}
                        title="Delete Page"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>

                  {/* Additional Info for Rejected Pages */}
                  {status === 'rejected' && page.reviewNote && (
                    <div className="mt-3 p-2 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25">
                      <small className="text-danger">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        <strong>Admin Feedback:</strong> {page.reviewNote}
                      </small>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreatePageModal 
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPageCreated={(newPage) => {
          setPages(prev => [newPage, ...prev]);
          setShowCreateModal(false);
        }}
      />

      <EditPageModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        page={selectedPage}
        onPageUpdated={(updatedPage) => {
          setPages(prev => prev.map(p => 
            getPageId(p) === getPageId(updatedPage) ? updatedPage : p
          ));
          setShowEditModal(false);
        }}
      />
    </div>
  );
};

// // CreatePageModal Component
// const CreatePageModal = ({ show, onClose, onPageCreated }) => {
//   const [formData, setFormData] = useState({
//     pageName: "",
//     username: "",
//     description: "",
//     category: "",
//     phone: "",
//     email: "",
//     address: "",
//     profilePicture: ""
//   });
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingCategories, setLoadingCategories] = useState(true);
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");

//   useEffect(() => {
//     if (show) {
//       fetchCategories();
//       // Reset form when modal opens
//       setFormData({
//         pageName: "",
//         username: "",
//         description: "",
//         category: "",
//         phone: "",
//         email: "",
//         address: "",
//         profilePicture: ""
//       });
//       setImageFile(null);
//       setImagePreview("");
//     }
//   }, [show]);

//   const fetchCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       let res;
//       try {
//         res = await axiosInstance.get("/pages/categories");
//       } catch (error) {
//         res = await axiosInstance.get("/pages/categories/list");
//       }
      
//       if (res?.data?.success) {
//         setCategories(res.data.categories || []);
//       }
//     } catch (err) {
//       console.error('Error fetching categories:', err);
//       toast.error("Failed to load categories");
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         toast.error("Image size should be less than 5MB");
//         return;
//       }

//       setImageFile(file);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({...prev, profilePicture: reader.result}));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateForm = () => {
//     if (!formData.pageName.trim()) {
//       toast.error("Page name is required");
//       return false;
//     }
//     if (!formData.description.trim()) {
//       toast.error("Description is required");
//       return false;
//     }
//     if (!formData.category) {
//       toast.error("Category is required");
//       return false;
//     }
//     if (!formData.phone.trim()) {
//       toast.error("Phone number is required");
//       return false;
//     }
//     if (!formData.email.trim()) {
//       toast.error("Email address is required");
//       return false;
//     }
//     if (!formData.address.trim()) {
//       toast.error("Business address is required");
//       return false;
//     }
//     if (!formData.profilePicture) {
//       toast.error("Profile image is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       let res;
//       try {
//         res = await axiosInstance.post("/pages", formData);
//       } catch (error) {
//         res = await axiosInstance.put("/pages", formData);
//       }
      
//       if (res?.data?.success) {
//         toast.success("Page submitted for admin approval successfully!");
//         onPageCreated(res.data.page);
//         setFormData({
//           pageName: "",
//           username: "",
//           description: "",
//           category: "",
//           phone: "",
//           email: "",
//           address: "",
//           profilePicture: ""
//         });
//         setImageFile(null);
//         setImagePreview("");
//       }
//     } catch (err) {
//       console.error('Error creating page:', err);
//       toast.error(err.response?.data?.message || "Failed to create page");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!show) return null;

//   return (
//     <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
//       <div className="modal-dialog modal-lg">
//         <div className="modal-content bg-dark text-white">
//           <div className="modal-header border-secondary">
//             <h5 className="modal-title">
//               <i className="fas fa-plus-circle me-2 text-success"></i>
//               Create New Page
//             </h5>
//             <button className="btn-close btn-close-white" onClick={onClose}></button>
//           </div>
          
//           <form onSubmit={handleSubmit}>
//             <div className="modal-body">
//               {loadingCategories ? (
//                 <div className="text-center py-4">
//                   <div className="text-white normal-loading-spinner">
//                     Loading categories<span className="dot-flash">.</span>
//                     <span className="dot-flash">.</span>
//                     <span className="dot-flash">.</span>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="alert alert-info bg-info bg-opacity-10 border border-info border-opacity-25 mb-4">
//                     <small>
//                       <i className="fas fa-info-circle me-2"></i>
//                       All fields are required. Your page will be submitted for admin approval and cannot be published until approved.
//                     </small>
//                   </div>

//                   <div className="row g-3">
//                     {/* Profile Image Upload */}
//                     <div className="col-12">
//                       <label className="form-label">
//                         Profile Image <span className="text-danger">*</span>
//                       </label>
//                       <div className="row align-items-center">
//                         <div className="col-md-8">
//                           <input
//                             type="file"
//                             className="form-control bg-dark text-white border-secondary"
//                             accept="image/*"
//                             onChange={handleImageChange}
//                             required
//                           />
//                           <small className="text-white-50">Max file size: 5MB. Supported: JPG, PNG, GIF</small>
//                         </div>
//                         <div className="col-md-4">
//                           {imagePreview && (
//                             <img
//                               src={imagePreview}
//                               alt="Preview"
//                               className="rounded-circle"
//                               style={{ width: "80px", height: "80px", objectFit: "cover" }}
//                             />
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Page Name <span className="text-danger">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control bg-dark text-white border-secondary"
//                         value={formData.pageName}
//                         onChange={(e) => setFormData(prev => ({...prev, pageName: e.target.value}))}
//                         placeholder="Enter page name"
//                         required
//                       />
//                     </div>
                    
//                     <div className="col-md-6">
//                       <label className="form-label">Username (Optional)</label>
//                       <div className="input-group">
//                         <span className="input-group-text bg-dark text-white border-secondary">@</span>
//                         <input
//                           type="text"
//                           className="form-control bg-dark text-white border-secondary"
//                           value={formData.username}
//                           onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
//                           placeholder="optional-username"
//                         />
//                       </div>
//                     </div>

//                     <div className="col-12">
//                       <label className="form-label">
//                         Description <span className="text-danger">*</span>
//                       </label>
//                       <textarea
//                         className="form-control bg-dark text-white border-secondary"
//                         rows="3"
//                         value={formData.description}
//                         onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
//                         placeholder="Tell people what your page is about..."
//                         required
//                       ></textarea>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Category <span className="text-danger">*</span>
//                       </label>
//                       <select
//                         className="form-select bg-dark text-white border-secondary"
//                         value={formData.category}
//                         onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
//                         required
//                       >
//                         <option value="">Choose category</option>
//                         {categories.map((category) => (
//                           <option key={category} value={category}>
//                             {category.charAt(0).toUpperCase() + category.slice(1)}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Phone Number <span className="text-danger">*</span>
//                       </label>
//                       <input
//                         type="tel"
//                         className="form-control bg-dark text-white border-secondary"
//                         value={formData.phone}
//                         onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
//                         placeholder="+1 (555) 123-4567"
//                         required
//                       />
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Email Address <span className="text-danger">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         className="form-control bg-dark text-white border-secondary"
//                         value={formData.email}
//                         onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
//                         placeholder="contact@example.com"
//                         required
//                       />
//                     </div>

//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Business Address <span className="text-danger">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control bg-dark text-white border-secondary"
//                         value={formData.address}
//                         onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
//                         placeholder="123 Business Street, City, State"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="modal-footer border-secondary">
//               <button type="button" className="btn btn-secondary" onClick={onClose}>
//                 Cancel
//               </button>
//               <button type="submit" className="btn btn-success" disabled={loading}>
//                 {loading ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2"></span>
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-paper-plane me-2"></i>
//                     Submit for Approval
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// Updated CreatePageModal Component with proper profilePicture handling
const CreatePageModal = ({ show, onClose, onPageCreated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: "",
    profilePicture: "" // Make sure this is initialized
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (show) {
      fetchCategories();
      // Reset form when modal opens
      setFormData({
        pageName: "",
        username: "",
        description: "",
        category: "",
        phone: "",
        email: "",
        address: "",
        profilePicture: "" // Reset this too
      });
      setImageFile(null);
      setImagePreview("");
    }
  }, [show]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
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
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // IMPORTANT: Update formData with the base64 string
        setFormData(prev => ({...prev, profilePicture: reader.result}));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.pageName.trim()) {
      toast.error("Page name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Business address is required");
      return false;
    }
    if (!formData.profilePicture) {
      toast.error("Profile image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("Form data being sent:", {
      ...formData,
      profilePicture: formData.profilePicture ? "Base64 data present" : "Missing"
    }); // Debug log
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("/pages", formData);
      
      if (res?.data?.success) {
        toast.success("Page submitted for admin approval successfully!");
        onPageCreated(res.data.page);
        // Reset form
        setFormData({
          pageName: "",
          username: "",
          description: "",
          category: "",
          phone: "",
          email: "",
          address: "",
          profilePicture: ""
        });
        setImageFile(null);
        setImagePreview("");
      }
    } catch (err) {
      console.error('Error creating page:', err);
      console.error('Server response:', err.response?.data);
      toast.error(err.response?.data?.message || "Failed to create page");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="fas fa-plus-circle me-2 text-success"></i>
              Create New Page
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {loadingCategories ? (
                <div className="text-center py-4">
                  <div className="text-white normal-loading-spinner">
                    Loading categories<span className="dot-flash">.</span>
                    <span className="dot-flash">.</span>
                    <span className="dot-flash">.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="alert alert-info bg-info bg-opacity-10 border border-info border-opacity-25 mb-4">
                    <small>
                      <i className="fas fa-info-circle me-2"></i>
                      All fields marked with <span className="text-danger">*</span> are required. Your page will be submitted for admin approval and cannot be published until approved.
                    </small>
                  </div>

                  <div className="row g-3">
                    {/* Profile Image Upload - FIXED */}
                    <div className="col-12">
                      <label className="form-label">
                        Profile Image <span className="text-danger">*</span>
                      </label>
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <input
                            type="file"
                            className="form-control bg-dark text-white border-secondary"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                          />
                          <small className="text-white-50">Max file size: 5MB. Supported: JPG, PNG, GIF</small>
                        </div>
                        <div className="col-md-4">
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="rounded-circle"
                              style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Page Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.pageName}
                        onChange={(e) => setFormData(prev => ({...prev, pageName: e.target.value}))}
                        placeholder="Enter page name"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Username (Optional)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-white border-secondary">@</span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                          placeholder="optional-username"
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        placeholder="Tell people what your page is about..."
                        required
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        required
                      >
                        <option value="">Choose category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Business Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                        placeholder="123 Business Street, City, State"
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit for Approval
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// EditPageModal Component
const EditPageModal = ({ show, onClose, page, onPageUpdated }) => {
  const [formData, setFormData] = useState({
    pageName: "",
    username: "",
    description: "",
    category: "",
    phone: "",
    email: "",
    address: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (show && page) {
      setFormData({
        pageName: page.pageName || "",
        username: page.username || "",
        description: page.description || "",
        category: page.category || "",
        phone: page.phone || "",
        email: page.email || "",
        address: page.address || "",
      });
      fetchCategories();
    }
  }, [show, page]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
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
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pageName || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const pageId = page?.id || page?._id;
    
    try {
      let res;
      try {
        res = await axiosInstance.put(`/pages/${pageId}`, formData);
      } catch (error) {
        res = await axiosInstance.patch(`/pages/${pageId}`, formData);
      }
      
      if (res?.data?.success) {
        const message = res.data.needsApproval 
          ? "Page updated successfully. Contact details changes are pending admin approval."
          : "Page updated successfully";
        toast.success(message);
        onPageUpdated(res.data.page);
      }
    } catch (err) {
      console.error('Error updating page:', err);
      toast.error(err.response?.data?.message || "Failed to update page");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  const isPending = page.approvalStatus === 'pending';

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="fas fa-edit me-2 text-info"></i>
              Edit Page
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {loadingCategories ? (
                <div className="text-center py-4">
                  <div className="text-white normal-loading-spinner">
                    Loading data<span className="dot-flash">.</span>
                    <span className="dot-flash">.</span>
                    <span className="dot-flash">.</span>
                  </div>
                </div>
              ) : (
                <>
                  {isPending && (
                    <div className="alert alert-warning bg-warning bg-opacity-10 border border-warning border-opacity-25 mb-4">
                      <small>
                        <i className="fas fa-clock me-2"></i>
                        This page is currently under admin review. Editing is disabled until review is complete.
                      </small>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Page Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.pageName}
                        onChange={(e) => setFormData(prev => ({...prev, pageName: e.target.value}))}
                        required
                        disabled={isPending}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <div className="input-group">
                        <span className="input-group-text bg-dark text-white border-secondary">@</span>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                          disabled={isPending}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control bg-dark text-white border-secondary"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        required
                        disabled={isPending}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        required
                        disabled={isPending}
                      >
                        <option value="">Choose category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.phone !== page.phone && (
                        <small className="text-warning">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Contact changes require admin approval
                        </small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.email !== page.email && (
                        <small className="text-warning">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Contact changes require admin approval
                        </small>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Business Address</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                        disabled={isPending}
                      />
                      {formData.address !== page.address && (
                        <small className="text-warning">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Contact changes require admin approval
                        </small>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={loading || isPending}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPagesSection;
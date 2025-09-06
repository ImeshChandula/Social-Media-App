import React, { useState, useEffect } from "react";
import moment from "moment";
import StoriesPopup from "./StoriesPopup";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Stories = ({
  post,
  isUserPost = false,
  onDelete,
  onStoriesUpdate,
  isPreview = false,
  onOpen
}) => {
  /* ─────────────────── state ─────────────────── */
  const [showPopup, setShowPopup] = useState(false);  // ⋮ menu
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [editCaption, setEditCaption] = useState(post?.caption || "");
  const [error, setError] = useState("");
  const [user, setUser] = useState(post?.user || null);
  const [isLoading, setIsLoading] = useState(false);

  /** NEW: full‑screen viewer toggle */
  const [showFull, setShowFull] = useState(false);

  // DEBUG: Log the props to help identify the issue
  useEffect(() => {
    console.log("Stories Component Debug Info:");
    console.log("isUserPost:", isUserPost);
    console.log("post:", post);
    console.log("post.userId:", post?.userId);
    console.log("user from post:", post?.user);
    console.log("user state:", user);
  }, [isUserPost, post, user]);

  /* ───────────────── fetch missing user data (unchanged) ───────────────── */
  useEffect(() => {
    const fetchUser = async () => {
      if (!post?.userId || user?.username) return; // already complete
      try {
        const ep = isUserPost ? "/users/myProfile" : `/users/getUserById/${post.userId}`;
        const { data } = await axiosInstance.get(ep);
        const u = isUserPost ? data.user : data.user;
        setUser({
          id: u.id ?? post.userId,
          username: u.username ?? "Unknown",
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          profilePicture: u.profilePicture ?? "https://via.placeholder.com/40",
        });
      } catch {
        toast.error("Failed to load user details");
      }
    };
    fetchUser();
  }, [post?.userId, user, isUserPost]);

  /* ───────────────── helpers (delete / update) ───────────────── */
  const handleDelete = async () => {
    // Allow deletion if it's user's post or current user's story
    if (!isUserPost && !isCurrentUserStory()) {
      toast.error("You can only delete your own stories");
      return;
    }
    
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/stories/delete/${post._id}`);
      onDelete?.(post._id);
      setShowPopup(false);
      toast.success("Story deleted successfully");
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    // Allow update if it's user's post or current user's story
    if (!isUserPost && !isCurrentUserStory()) {
      toast.error("You can only edit your own stories");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const updateData = {};
      
      // Get original values with proper fallbacks
      const originalContent = post.content || '';
      const originalCaption = post.caption || '';
      
      // Only include fields that have changed
      if (post.type === 'text' && editContent.trim() !== originalContent.trim()) {
        updateData.content = editContent.trim();
      }
      
      // Always check caption for all story types
      if (editCaption.trim() !== originalCaption.trim()) {
        updateData.caption = editCaption.trim();
      }
      
      console.log('Stories Update comparison:', {
        postType: post.type,
        originalContent: originalContent.trim(),
        editContent: editContent.trim(),
        originalCaption: originalCaption.trim(),
        editCaption: editCaption.trim(),
        updateData
      });
      
      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        setIsEditing(false);
        return;
      }
      
      console.log('Sending update request with:', updateData);
      
      const { data } = await axiosInstance.patch(`/stories/update/${post._id}`, updateData);
      
      console.log('Update response:', data);
      
      // Update local state with the new data
      const updatedStory = {
        ...post,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      onStoriesUpdate?.(updatedStory);
      setIsEditing(false);
      setShowPopup(false);
      toast.success("Story updated successfully");
    } catch (err) {
      console.error('Update error:', err);
      const msg = err.response?.data?.message || "Update failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post?.content || "");
    setEditCaption(post?.caption || "");
    setShowPopup(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(post?.content || "");
    setEditCaption(post?.caption || "");
    setShowPopup(false);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && !event.target.closest('.options-menu-container')) {
        setShowPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  /* ───────────────── render media helper ───────────────── */
  const renderMedia = (full = false) => {
    // full=false : 120×160 preview   •  full=true : large view / feed card
    const height = full ? "400px" : "160px";

    if (post.type === "image" && post.media) {
      return (
        <img
          src={post.media}
          alt={post.caption || "Story"}
          className="img-fluid rounded"
          style={{ width: "100%", height, objectFit: "cover" }}
          onError={(e) => (e.target.src = "https://via.placeholder.com/120")}
        />
      );
    }

    if (post.type === "video" && post.media) {
      return (
        <video
          className={`rounded ${full ? "w-100" : ""}`}
          style={{ height, objectFit: "cover" }}
          controls={full}
          muted={!full}
        >
          <source src={post.media} type="video/mp4" />
        </video>
      );
    }

    if (post.type === "text" && post.content) {
      return (
        <div
          className="d-flex align-items-center justify-content-center rounded"
          style={{
            height,
            background: "linear-gradient(45deg,#405de6,#5851db,#833ab4,#c13584)",
          }}
        >
          <p
            className="text-white mb-0"
            style={{ fontSize: full ? "1.2rem" : "0.9rem", fontWeight: 500 }}
          >
            {full ? post.content : post.content.slice(0, 30) + (post.content.length > 30 ? "…" : "")}
          </p>
        </div>
      );
    }

    return <div style={{ height, background: "#333" }} />;
  };

  // Helper function to check if user can edit/delete - FIXED
  const canModifyStory = () => {
    // Always show for user's own posts - remove all restrictions for debugging
    return isUserPost;
  };

  // Helper function to check if this is the current user's story
  const isCurrentUserStory = () => {
    // Check multiple ways to determine if this is the user's story
    if (isUserPost) return true;
    
    // Additional check: if user data is available, compare IDs
    if (user?.id && post?.userId) {
      return user.id === post.userId;
    }
    
    return false;
  };

  /* ───────────────── preview card (120px) ───────────────── */
  if (isPreview) {
    return (
      <>
        {/* tiny story tile */}
        <div
          className="position-relative text-white"
          style={{ width: 120, cursor: "pointer" }}
          onClick={() => (onOpen ? onOpen() : setShowFull(true))} /* ← OPEN FULLSCREEN */
        >
          <div
            className="rounded overflow-hidden"
            style={{
              border: `2px solid ${post.viewCount ? "#6c757d" : "#3897f0"}`,
              padding: 2,
            }}
          >
            {renderMedia(false)}
          </div>

          {/* avatar */}
          <img
            src={user?.profilePicture || "https://via.placeholder.com/40"}
            alt="pfp"
            className="rounded-circle position-absolute"
            style={{
              width: 32,
              height: 32,
              objectFit: "cover",
              top: 4,
              left: 4,
              border: "2px solid #fff",
            }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
          />

          {/* name */}
          <div className="text-center mt-1" style={{ fontSize: "0.8rem" }}>
            {user?.username || user?.firstName || user?.lastName || "Unknown"}
          </div>
        </div>

        {/* ───── FULL‑SCREEN OVERLAY ───── */}
        {showFull && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              background: "rgba(0,0,0,.9)",
              zIndex: 1055,
              backdropFilter: "blur(4px)",
            }}
          >
            {/* close btn */}
            <button
              onClick={() => setShowFull(false)}
              className="btn btn-light position-absolute"
              style={{ top: 20, right: 20, zIndex: 1060 }}
            >
              ✕
            </button>

            {/* reuse SAME component in "full card" mode */}
            <div
              className="rounded shadow-lg bg-dark text-white"
              style={{
                width: "100%",
                maxWidth: "400px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "1rem",
                borderRadius: "12px",
              }}
            >
              {/* everything below identical to non‑preview render */}
              <div className="card bg-dark text-white border-0 shadow-sm">
                <div className="p-3">
                  {/* header */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          user?.profilePicture ||
                          "https://via.placeholder.com/40"
                        }
                        alt="pfp"
                        className="rounded-circle me-2"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="mb-0" style={{ fontWeight: 600 }}>
                          {user?.username ||
                            user?.firstName ||
                            user?.lastName ||
                            "Unknown"}
                        </h6>
                        <small className="text-muted">
                          {moment(post.createdAt).fromNow()} •{" "}
                          {post.privacy === "friends" ? "👥 Friends" : "🌎 Public"}
                        </small>
                      </div>
                    </div>

                    {(isUserPost || isCurrentUserStory()) && (
                      <div className="position-relative options-menu-container">
                        <button
                          className="btn btn-sm text-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPopup((p) => !p);
                          }}
                          disabled={isLoading}
                          style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            padding: '4px 8px'
                          }}
                        >
                          ⋮
                        </button>
                        {showPopup && (
                          <StoriesPopup
                            onDelete={handleDelete}
                            onEdit={handleEditClick}
                            isLoading={isLoading}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {renderMedia(true)}

                  <div className="mt-3">
                    {isEditing ? (
                      <>
                        {/* Content editor - only show for text stories */}
                        {post.type === 'text' && (
                          <div className="mb-3">
                            <label className="form-label text-white">Content:</label>
                            <textarea
                              className="form-control mb-2"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              placeholder="What's on your mind?"
                              style={{ backgroundColor: '#495057', color: 'white', border: '1px solid #6c757d' }}
                            />
                          </div>
                        )}
                        
                        {/* Caption editor - always show */}
                        <div className="mb-3">
                          <label className="form-label text-white">Caption:</label>
                          <textarea
                            className="form-control mb-2"
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            rows={2}
                            placeholder="Add a caption..."
                            style={{ backgroundColor: '#495057', color: 'white', border: '1px solid #6c757d' }}
                          />
                        </div>
                        
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={handleUpdate}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={handleCancelEdit}
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-1">{post.caption || "No caption"}</p>
                        {post.viewCount > 0 && (
                          <small className="text-muted">
                            Viewed by {post.viewCount}{" "}
                            {post.viewCount === 1 ? "person" : "people"}
                          </small>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ───────────────── normal feed card ───────────────── */
  return (
    <div
      className="card bg-dark text-white mb-4 position-relative border-0 shadow-sm"
      style={{ borderRadius: 10 }}
    >
      {error && (
        <div className="alert alert-danger alert-dismissible m-3">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          />
        </div>
      )}

      <div className="p-3">
        {/* header */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <img
              src={user?.profilePicture || "https://via.placeholder.com/40"}
              alt="pfp"
              className="rounded-circle me-2"
              style={{ width: 40, height: 40, objectFit: "cover" }}
            />
            <div>
              <h6 className="mb-0" style={{ fontWeight: 600 }}>
                {user?.username || user?.firstName || user?.lastName || "Unknown"}
              </h6>
              <small className="text-muted">
                {moment(post.createdAt).fromNow()} •{" "}
                {post.privacy === "friends" ? "👥 Friends" : "🌎 Public"}
                {post.updatedAt && post.updatedAt !== post.createdAt && (
                  <span className="text-info"> • Edited</span>
                )}
              </small>
            </div>
          </div>

          {(isUserPost || isCurrentUserStory()) && (
            <div className="position-relative options-menu-container">
              <button
                className="btn btn-sm text-light"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup((p) => !p);
                }}
                disabled={isLoading}
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '4px 8px'
                }}
              >
                ⋮
              </button>
              {showPopup && (
                <StoriesPopup
                  onDelete={handleDelete}
                  onEdit={handleEditClick}
                  isLoading={isLoading}
                />
              )}
            </div>
          )}
        </div>

        {renderMedia(true)}

        <div className="mt-3">
          {isEditing ? (
            <>
              {/* Content editor - only for text stories */}
              {post.type === 'text' && (
                <div className="mb-3">
                  <label className="form-label text-white">Content:</label>
                  <textarea
                    className="form-control mb-2"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    placeholder="What's on your mind?"
                  />
                </div>
              )}
              
              {/* Caption editor */}
              <div className="mb-3">
                <label className="form-label text-white">Caption:</label>
                <textarea
                  className="form-control mb-2"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={2}
                  placeholder="Add a caption..."
                />
              </div>
              
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-sm btn-success" 
                  onClick={handleUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-1">{post.caption || "No caption"}</p>
              {post.viewCount > 0 && (
                <small className="text-muted">
                  Viewed by {post.viewCount}{" "}
                  {post.viewCount === 1 ? "person" : "people"}
                </small>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
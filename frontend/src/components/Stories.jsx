import React, { useState, useEffect } from "react";
import moment from "moment";
import StoriesPopup from "./StoriesPopup";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

/**
 * Shows a story either as a tiny preview (in the horizontal bar)
 * or, when tapped, as a full‑screen “story view” just like Facebook.
 *
 * prop isPreview=true  → tiny card
 * prop isPreview=false → normal feed card (edit / delete etc.)
 */
const Stories = ({
  post,
  isUserPost = false,
  onDelete,
  onStoriesUpdate,
  isPreview = false,
  onOpen
}) => {
  /* ─────────────────── state ─────────────────── */
  const [showPopup, setShowPopup]     = useState(false);  // ⋮ menu
  const [isEditing, setIsEditing]     = useState(false);
  const [caption, setCaption]         = useState(post?.caption || "");
  const [error,   setError]           = useState("");
  const [user,    setUser]            = useState(post?.user || null);

  /** NEW: full‑screen viewer toggle */
  const [showFull, setShowFull]       = useState(false);

  /* ───────────────── fetch missing user data (unchanged) ───────────────── */
  useEffect(() => {
    const fetchUser = async () => {
      if (!post?.userId || user?.username) return;           // already complete
      try {
        const ep = isUserPost ? "/users/myProfile"
                              : `/users/getUserById/${post.userId}`;
        const { data } = await axiosInstance.get(ep);
        const u = isUserPost ? data.user : data.user;
        setUser({
          id:         u.id            ?? post.userId,
          username:   u.username      ?? "Unknown",
          firstName:  u.firstName     ?? "",
          lastName:   u.lastName      ?? "",
          profilePicture:
            u.profilePicture ?? "https://via.placeholder.com/40",
        });
      } catch {
        toast.error("Failed to load user details");
      }
    };
    fetchUser();
  }, [post?.userId, user, isUserPost]);

  /* ───────────────── helpers (delete / update) ───────────────── */
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/stories/delete/${post._id}`);
      onDelete?.(post._id);
      setShowPopup(false);
      toast.success("Story deleted");
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleUpdate = async () => {
    try {
      const { data } = await axiosInstance.patch(`/stories/update/${post._id}`, {
        caption: caption.trim() || undefined,
      });
      onStoriesUpdate?.(data.story);
      setIsEditing(false);
      toast.success("Story updated");
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed";
      setError(msg);
      toast.error(msg);
    }
  };

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
            background:
              "linear-gradient(45deg,#405de6,#5851db,#833ab4,#c13584)",
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

  /* ───────────────── preview card (120px) ───────────────── */
  if (isPreview) {
    return (
      <>
        {/* tiny story tile */}
        <div
          className="position-relative text-white"
          style={{ width: 120, cursor: "pointer" }}
          onClick={() => (onOpen ? onOpen() : setShowFull(true))}   /* ← OPEN FULLSCREEN */
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

            {/* reuse SAME component in “full card” mode */}
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

                    {isUserPost && (
                      <div className="position-relative">
                        <button
                          className="btn btn-sm text-light"
                          onClick={() => setShowPopup((p) => !p)}
                        >
                          ⋮
                        </button>
                        {showPopup && (
                          <StoriesPopup
                            onDelete={handleDelete}
                            onEdit={() => {
                              setIsEditing(true);
                              setShowPopup(false);
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {renderMedia(true)}

                  <div className="mt-3">
                    {isEditing ? (
                      <>
                        <textarea
                          className="form-control mb-2"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          rows={2}
                        />
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={handleUpdate}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setCaption(post.caption || "");
                            }}
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

  /* ───────────────── normal feed card (unchanged) ───────────────── */
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
              </small>
            </div>
          </div>

          {isUserPost && (
            <div className="position-relative">
              <button
                className="btn btn-sm text-light"
                onClick={() => setShowPopup((p) => !p)}
              >
                ⋮
              </button>
              {showPopup && (
                <StoriesPopup
                  onDelete={handleDelete}
                  onEdit={() => {
                    setIsEditing(true);
                    setShowPopup(false);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {renderMedia(true)}

        <div className="mt-3">
          {isEditing ? (
            <>
              <textarea
                className="form-control mb-2"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
              />
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success" onClick={handleUpdate}>
                  Save
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setCaption(post.caption || "");
                  }}
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

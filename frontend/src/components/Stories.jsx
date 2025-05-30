import React, { useState } from "react";
import moment from "moment";
import StoriesPopup from "./StoriesPopup";
import { axiosInstance } from "../lib/axios";

const Stories = ({ post, isUserPost = false, onDelete, onUpdate }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/stories/delete/${post._id}`);
      onDelete?.(post._id);
    } catch (err) {
      console.error("Failed to delete story:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axiosInstance.patch(`/stories/update/${post._id}`, {
        caption,
      });
      onUpdate?.(res.data.story);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update story:", err);
    }
  };

  const renderMedia = () => {
    if (post.type === "image") {
      return <img src={post.mediaUrl} alt="story" className="img-fluid rounded" />;
    } else if (post.type === "video") {
      return (
        <video controls className="w-100 rounded">
          <source src={post.mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  return (
    <div className="card bg-dark text-white mb-4 position-relative p-3">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-0">{post.user?.username || "Unknown User"}</h6>
          <small className="text-muted">{moment(post.createdAt).fromNow()}</small>
        </div>

        {isUserPost && (
          <div className="position-relative">
            <button
              className="btn btn-sm text-light"
              onClick={() => setShowPopup((prev) => !prev)}
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

      {renderMedia()}

      <div className="mt-3">
        {isEditing ? (
          <div>
            <textarea
              className="form-control mb-2"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <button className="btn btn-sm btn-success me-2" onClick={handleUpdate}>
              Save
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <p className="mt-2">{post.caption}</p>
        )}
      </div>
    </div>
  );
};

export default Stories;

// PostCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt, FaShare } from "react-icons/fa";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";

const PostCard = ({ post, isUserPost = false, onLikeUpdate, onDeletePost }) => {
  const navigate = useNavigate();

  const postId = post._id || post.id;
  const mediaArray = Array.isArray(post.media)
    ? post.media
    : post.media
    ? [post.media]
    : [];

  const [showComments, setShowComments] = useState(false);

  const handleNavigateToProfile = () => {
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  const renderMedia = (url, idx) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    return isVideo ? (
      <video
        key={idx}
        src={url}
        controls
        className="rounded"
        style={{
          maxHeight: "300px",
          maxWidth: "100%",
          objectFit: "cover",
        }}
      />
    ) : (
      <img
        key={idx}
        src={url}
        className="img-fluid rounded"
        alt={`Post media ${idx + 1}`}
        style={{
          maxHeight: "300px",
          maxWidth: "100%",
          objectFit: "cover",
        }}
        loading="lazy"
      />
    );
  };

  return (
    <div className="card bg-white border-secondary text-black mb-4 shadow-sm rounded-4">
      {/* Header */}
      <div className="card-header bg-white d-flex align-items-center justify-content-between p-3 rounded-top-4 border-bottom border-white-50">
        <div className="d-flex align-items-center gap-3" onClick={handleNavigateToProfile} style={{ cursor: "pointer" }}>
          <img
            src={post.author?.profilePicture}
            alt="Profile"
            className="rounded-circle border border-primary border-3"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
          <div className="flex-grow-1 text-start">
            <h6 className="mb-0 fw-bold text-black">
              {`${post.author?.firstName || ""} ${post.author?.lastName || ""}`}
            </h6>
            <small className="text-dark">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
            </small>
          </div>
        </div>
        {isUserPost && (
          <PostDropdown
            postId={postId}
            onDelete={{ postId, handler: onDeletePost }}
          />
        )}
      </div>

      {/* Content */}
      <div className="card-body bg-white p-4">
        <p className="text-black mb-3 text-start">{post.content}</p>
        {mediaArray.length > 0 && (
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            {mediaArray.map(renderMedia)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer bg-white d-flex justify-content-between text-black small rounded-bottom-4 border-top border-white-50">
        <div className="d-flex align-items-center gap-1">
          <PostLikeButton
            postId={postId}
            initialIsLiked={post.isLiked}
            initialLikeCount={post.likeCount}
            onLikeUpdate={onLikeUpdate}
          />
        </div>
        <div
          className="d-flex align-items-center gap-1 cursor-pointer"
          onClick={() => {
            console.log("Toggling comments");
            setShowComments((prev) => !prev);
          }}
        >
          <FaCommentAlt />
          <span>{post.comments?.length || 0} Comments</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <FaShare />
          <span>{post.shares?.length || 0} Shares</span>
        </div>
      </div>

      {showComments && <PostComment postId={postId} />}
    </div>
  );
};

export default PostCard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt, FaShare, FaChevronRight } from "react-icons/fa";
import LikesPopup from "./LikesPopup";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";
import { axiosInstance } from "../lib/axios";

const PostCard = ({ post, isUserPost = false, onLikeUpdate, onDeletePost, disableNavigation = false }) => {
  const navigate = useNavigate();
  const postId = post._id || post.id;

  const mediaArray = Array.isArray(post.media)
    ? post.media
    : post.media
      ? [post.media]
      : [];

  const [showComments, setShowComments] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likes, setLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const handleNavigateToProfile = () => {
    if (disableNavigation) return;
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  const fetchLikes = async () => {
    try {
      setLoadingLikes(true);
      const res = await axiosInstance.get(`/likes/getAllLikedUsers/post/${postId}`);
      setLikes(res.data.data.users || []);
    } catch (error) {
      console.error("Failed to fetch likes", error);
      setLikes([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleOpenLikesPopup = () => {
    fetchLikes();
    setShowLikesPopup(true);
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
        <div
          className="d-flex align-items-center gap-3"
          onClick={handleNavigateToProfile}
          style={{ cursor: disableNavigation ? "default" : "pointer" }}
        >
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
          <PostDropdown postId={postId} onDelete={{ postId, handler: onDeletePost }} />
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
      <div className="card-footer px-4 bg-white d-flex justify-content-between text-black small rounded-bottom-4 border-top border-white-50">
        <div className="d-flex align-items-center gap-1">
          <PostLikeButton
            postId={postId}
            initialIsLiked={post.isLiked}
            initialLikeCount={post.likeCount}
            onLikeUpdate={onLikeUpdate}
          />
          <FaChevronRight
            className="text-black"
            title="View Likes"
            onClick={handleOpenLikesPopup}
            style={{ cursor: "pointer", fontSize: "0.9rem" }}
          />
        </div>

        <div
          className="d-flex align-items-center gap-1"
          onClick={() => setShowComments((prev) => !prev)}
          style={{ cursor: "pointer", fontSize: "0.9rem" }}
        >
          <FaCommentAlt />
          <span>
            {post.comments?.length || 0}
          </span>
        </div>

        <div
          className="d-flex align-items-center gap-1"
          style={{ cursor: "pointer", fontSize: "0.9rem" }}
        >
          <FaShare />
          <span>
            {post.shares?.length || 0}
          </span>
        </div>
      </div>

      {showComments && <PostComment postId={postId} />}

      {/* Likes Popup */}
      <LikesPopup
        show={showLikesPopup}
        onClose={() => setShowLikesPopup(false)}
        likes={likes}
        loading={loadingLikes}
      />
    </div>
  );
};

export default PostCard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt, FaShare, FaChevronRight } from "react-icons/fa";
import LikesPopup from "./LikesPopup";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";
import PostComment from "./PostComment";
import { axiosInstance } from "../lib/axios";
import useAuthStore from "../store/authStore";
import ShareButton from "./ShareButton"; 

const PostCard = ({
  post,
  isUserPost = false,
  onLikeUpdate,
  onDeletePost,
  disableNavigation = false,
}) => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const postId = post._id || post.id;

  const mediaArray = Array.isArray(post.media)
    ? post.media
    : post.media
      ? [post.media]
      : [];

  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showLikesPopup, setShowLikesPopup] = useState(false);
  const [likes, setLikes] = useState([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [postId]);

  const handleNavigateToProfile = () => {
    if (disableNavigation) return;
    const authorId = post.author?.id || post.author?._id;
    const currentUserId = authUser?._id || authUser?.id;
    if (!authorId) return;
    navigate(authorId === currentUserId ? "/profile" : `/profile/${authorId}`);
  };

  const fetchLikes = async () => {
    try {
      setLoadingLikes(true);
      const res = await axiosInstance.get(
        `/likes/getAllLikedUsers/post/${postId}`
      );
      setLikes(res.data.data.users || []);
    } catch (error) {
      console.error("Failed to fetch likes", error);
      setLikes([]);
    } finally {
      setLoadingLikes(false);
    }
  };
  const updatePostLike = (postId, isLiked, likeCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId || post.id === postId
                    ? { ...post, isLiked, likeCount }
                    : post
            )
        );
    };

  const handleOpenLikesPopup = () => {
    fetchLikes();
    setShowLikesPopup(true);
  };

  const renderMedia = (url, idx) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
    const mediaStyles = {
      width: "100%",
      height: "clamp(200px, 30vw, 400px)", // responsive height
      objectFit: "contain",
      borderRadius: "0.75rem",
    };

    return isVideo ? (
      <video
        key={idx}
        src={url}
        controls
        className="w-100"
        style={mediaStyles}
      />
    ) : (
      <img
        key={idx}
        src={url}
        className="w-100"
        alt={`Post media ${idx + 1}`}
        loading="lazy"
        style={mediaStyles}
      />
    );
  };

  return (
    <div className="container px-0">
      <div
        className="card bg-white border-secondary text-black mb-4 shadow-sm rounded-4 mx-auto"
      >
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
                {post.author?.firstName && post.author?.lastName
                  ? `${post.author.firstName} ${post.author.lastName}`
                  : post.author?.username || "Unknown User"}
              </h6>
              <small className="text-dark">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleString()
                  : ""}
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

        {/* Body */}
        <div className="card-body bg-white p-4">
          <p className="text-black mb-3 text-start">{post.content}</p>

          {mediaArray.length > 0 && (
            <div className="position-relative text-center">
              {mediaArray.length > 1 ? (
                <>
                  <div className="d-flex justify-content-center align-items-center position-relative">
                    <button
                      className="bg-dark text-white position-absolute top-50 start-0 translate-middle-y z-1 fw-bold"
                      style={{ fontSize: '20px' }}
                      onClick={() =>
                        setCurrentMediaIndex(
                          (prev) =>
                            (prev - 1 + mediaArray.length) % mediaArray.length
                        )
                      }
                    >
                      ‹
                    </button>

                    {renderMedia(mediaArray[currentMediaIndex], currentMediaIndex)}

                    <button
                      className="bg-dark text-white position-absolute top-50 end-0 translate-middle-y z-1 fw-bold"
                      style={{ fontSize: '20px' }}
                      onClick={() =>
                        setCurrentMediaIndex(
                          (prev) => (prev + 1) % mediaArray.length
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                  <div className="mt-2 small text-muted">
                    {currentMediaIndex + 1} / {mediaArray.length}
                  </div>
                </>
              ) : (
                renderMedia(mediaArray[0], 0)
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer px-4 bg-white d-flex justify-content-between text-black small rounded-bottom-4 border-top border-white-50 ">
          <div className="d-flex align-items-center gap-1">
            <PostLikeButton
              postId={postId}
              initialIsLiked={post.isLiked}
              initialLikeCount={post.likeCount}
              onLikeUpdate={updatePostLike}
            />
            <FaChevronRight
              className="text-black"
              title="View Likes"
              onClick={handleOpenLikesPopup}
              style={{ cursor: "pointer", fontSize: "0.9rem" }}
            />
          </div>

          <div
            className="btn btn-light d-flex align-items-center px-3 py-1"
            onClick={() => setShowComments((prev) => !prev)}
            style={{ cursor: "pointer", fontSize: "0.9rem" }}
          >
            <FaCommentAlt />
            <span>{post.comments?.length || 0}</span>
            comments
          </div>

          {/* Share */}
          <ShareButton postId={postId} />
        </div>

        {showComments && <PostComment postId={postId} />}

        <LikesPopup
          show={showLikesPopup}
          onClose={() => setShowLikesPopup(false)}
          likes={likes}
          loading={loadingLikes}
        />
      </div>
    </div>
  );
};

export default PostCard;

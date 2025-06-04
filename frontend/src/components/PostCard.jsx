import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt, FaShare } from "react-icons/fa";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";

const PostCard = ({ post, isUserPost = false, onLikeUpdate, onDeletePost }) => {

    const navigate = useNavigate();

    const mediaArray = Array.isArray(post.media)
        ? post.media
        : post.media
            ? [post.media]
            : [];

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
                className="rounded"
                controls
                style={{
                    maxHeight: "300px",
                    maxWidth: "100%",
                    objectFit: "cover",
                    border: "1px solid #444",
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
                    border: "1px solid #444",
                }}
                loading="lazy"
            />
        );
    };

    return (
        <div className="card bg-secondary bg-opacity-10 border-secondary text-white mb-4 shadow-sm rounded-4">
            {/* Header */}
            <div className="card-header bg-dark d-flex align-items-center justify-content-between p-3 rounded-top-4 border-bottom border-secondary">
                <div className="d-flex align-items-center gap-3" onClick={handleNavigateToProfile}>
                    <img
                        src={post.author?.profilePicture}
                        alt="Profile"
                        className="rounded-circle border border-secondary cursor-pointer"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                    <div className="flex-grow-1 text-start">
                        <h6 className="mb-0 fw-bold text-white cursor-pointer">
                            {`${post.author?.firstName || ""} ${post.author?.lastName || ""}`}
                        </h6>
                        <small className="text-white-50">
                            {post.createdAt
                                ? new Date(post.createdAt).toLocaleString()
                                : ""}
                        </small>
                    </div>
                </div>
                {isUserPost && (
                    <PostDropdown
                        onUpdate={() => navigate(`/posts/edit/${post._id || post.id}`)}
                        onDelete={{ postId: post._id || post.id, handler: onDeletePost }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="card-body bg-dark p-4 rounded-bottom-4">
                <p className="text-white mb-3 text-start">{post.content}</p>

                {mediaArray.length > 0 && (
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {mediaArray.map(renderMedia)}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-dark d-flex justify-content-between text-white-50 small rounded-bottom-4 border-top border-secondary">
                <div className="d-flex align-items-center gap-1">
                    <PostLikeButton
                        postId={post._id || post.id}
                        initialIsLiked={post.isLiked}
                        initialLikeCount={post.likeCount}
                        onLikeUpdate={onLikeUpdate}
                    />
                </div>
                <div className="d-flex align-items-center gap-1">
                    <FaCommentAlt />
                    <span>{post.comments?.length || 0} Comments</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <FaShare />
                    <span>{post.shares?.length || 0} Shares</span>
                </div>
            </div>
        </div>
    );
};

export default PostCard;

import React from "react";
import { FaThumbsUp, FaCommentAlt, FaShare } from "react-icons/fa";

const PostCard = ({ post }) => {
    return (
        <div className="card bg-secondary bg-opacity-10 border-secondary text-white mb-4 shadow-sm rounded-4">
            {/* Header */}
            <div className="card-header bg-dark d-flex align-items-center gap-3 p-3 rounded-top-4 border-bottom border-secondary">
                <img
                    src={post.author?.profilePicture}
                    alt="Profile"
                    className="rounded-circle border border-secondary"
                    style={{ width: 50, height: 50, objectFit: "cover" }}
                />
                <div className="flex-grow-1 text-start">
                    <h6 className="mb-0 fw-bold text-white">
                        {`${post.author?.firstName || ""} ${post.author?.lastName || ""}`}
                    </h6>
                    <small className="text-white-50">
                        {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : ""}
                    </small>
                </div>
            </div>

            {/* Content */}
            <div className="card-body bg-dark p-4 rounded-bottom-4">
                <p className="text-white mb-3 text-start">{post.content}</p>

                {/* Media Preview */}
                {post.media && post.media.length > 0 && (
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {post.media.map((url, idx) => (
                            <img
                                key={idx}
                                src={url}
                                className="img-fluid rounded"
                                style={{
                                    maxHeight: "300px",
                                    maxWidth: "100%",
                                    objectFit: "cover",
                                    border: "1px solid #444",
                                }}
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-dark d-flex justify-content-between text-white-50 small rounded-bottom-4 border-top border-secondary">
                <div className="d-flex align-items-center gap-1">
                    <FaThumbsUp />
                    <span>{post.likes?.length || 0} Likes</span>
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

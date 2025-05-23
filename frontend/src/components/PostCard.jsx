import React, { useState, useRef, useEffect } from "react";
import { FaThumbsUp, FaCommentAlt, FaShare } from "react-icons/fa";

const PostCard = ({ post, isUserPost = false }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="card bg-secondary bg-opacity-10 border-secondary text-white mb-4 shadow-sm rounded-4">
            {/* Header */}
            <div className="card-header bg-dark d-flex align-items-center justify-content-between p-3 rounded-top-4 border-bottom border-secondary">
                <div className="d-flex align-items-center gap-3">
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

                {/* Dropdown Menu for User's Posts */}
                {isUserPost && (
                    <div className="position-relative" ref={dropdownRef}>
                        <button
                            className="btn btn-sm btn-outline-light"
                            onClick={() => setShowDropdown((prev) => !prev)}
                        >
                            •••
                        </button>

                        {showDropdown && (
                            <ul
                                className="dropdown-menu show bg-dark border border-secondary shadow rounded-3 p-0"
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    zIndex: 1000,
                                    minWidth: "120px",
                                }}
                            >
                                <li>
                                    <button
                                        className="dropdown-item text-warning"
                                        onClick={() => alert("Update clicked")}
                                    >
                                        Update
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger"
                                        onClick={() => alert("Delete clicked")}
                                    >
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                )}

            </div>

            {/* Content */}
            <div className="card-body bg-dark p-4 rounded-bottom-4">
                <p className="text-white mb-3 text-start">{post.content}</p>

                {/* Media Preview */}
                {Array.isArray(post.media) && post.media.length > 0 && (
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {post.media.map((url, idx) =>
                            url ? (
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
                            ) : null
                        )}
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

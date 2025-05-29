import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCommentAlt, FaShare } from "react-icons/fa";
import PostDropdown from "./PostDropdown";
import PostLikeButton from "./PostLikeButton";

const Stories = ({ stories, isUserPost = false, onLikeUpdate }) => {

    const navigate = useNavigate();

    const mediaArray = Array.isArray(stories.media)
        ? stories.media
        : stories.media
            ? [stories.media]
            : [];

    const handleNavigateToProfile = () => {
        if (stories.author?.username) {
            navigate(`/profile/${stories.author.username}`);
        }
    };

    return (
        <div className="card bg-secondary bg-opacity-10 border-secondary text-white mb-4 shadow-sm rounded-4">
            {/* Header */}
            <div className="card-header bg-dark d-flex align-items-center justify-content-between p-3 rounded-top-4 border-bottom border-secondary">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src={stories.author?.profilePicture}
                        alt="Profile"
                        className="rounded-circle border border-secondary"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                    <div className="flex-grow-1 text-start">
                        <h6 className="mb-0 fw-bold text-white cursor-pointer" onClick={handleNavigateToProfile} >
                            {`${stories.author?.firstName || ""} ${stories.author?.lastName || ""}`}
                        </h6>
                        <small className="text-white-50">
                            {stories.createdAt
                                ? new Date(stories.createdAt).toLocaleString()
                                : ""}
                        </small>
                    </div>
                </div>
                {isUserPost && (
                    <PostDropdown
                        onUpdate={() => alert(`Update post ${stories._id}`)}
                        onDelete={() => alert(`Delete post ${stories._id}`)}
                    />
                )}
            </div>

            {/* Content */}
            <div className="card-body bg-dark p-4 rounded-bottom-4">
                <p className="text-white mb-3 text-start">{stories.content}</p>

                {mediaArray.length > 0 && (
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {mediaArray.map((url, idx) =>
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
                                    alt={`Post media ${idx + 1}`}
                                />
                            ) : null
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="card-footer bg-dark d-flex justify-content-between text-white-50 small rounded-bottom-4 border-top border-secondary">
                <div className="d-flex align-items-center gap-1">
                    <PostLikeButton
                        postId={stories._id || stories.id}
                        initialIsLiked={stories.isLiked}
                        initialLikeCount={stories.likeCount}
                        onLikeUpdate={onLikeUpdate}
                    />
                </div>
                <div className="d-flex align-items-center gap-1">
                    <FaCommentAlt />
                    <span>{stories.comments?.length || 0} Comments</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                    <FaShare />
                    <span>{stories.shares?.length || 0} Shares</span>
                </div>
            </div>
        </div>
    );
};

export default Stories;

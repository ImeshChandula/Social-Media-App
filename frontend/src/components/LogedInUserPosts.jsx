import React, { useEffect, useState } from "react";
import { FaThumbsUp, FaCommentAlt, FaShare } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";

function UserPosts() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axiosInstance.get("/posts/me");
                setPosts(res.data.posts || res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch posts.");
            }
        };

        fetchPosts();
    }, []);

    if (error) return <div className="alert alert-warning">{error}</div>;
    if (posts.length === 0) return <p className="text-center">No posts to show.</p>;

    return (
        <div className="container mt-4">
            {posts.map((post, index) => (
                <motion.div
                    key={post._id || index}
                    className="card shadow-sm mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    {/* Header */}
                    <div className="card-header bg-dark d-flex">
                        <img
                            src={post.author?.profilePicture}
                            alt="Profile"
                            className="rounded-circle me-3 border border-secondary"
                            style={{ width: "45px", height: "45px", objectFit: "cover" }}
                        />
                        <div>
                            <h6 className="mb-0 fw-bold text-white text-start">{`${post.author?.firstName || ""} ${post.author?.lastName || ""}`}</h6>
                            <small className="text-white-50 text-start">{new Date(post.createdAt).toLocaleString()}</small>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="card-body bg-dark">
                        <p className="text-start text-white">{post.content}</p>

                        {/* Media if available */}
                        {post.media && post.media.length > 0 && (
                            <div className="mt-3 text-white">
                                {post.media.map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={""}
                                        className="img-fluid rounded mb-2"
                                        style={{ maxHeight: "400px", objectFit: "cover" }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="card-footer bg-dark">
                        <div className="d-flex justify-content-between text-white-50 small">
                            <div>
                                <FaThumbsUp className="me-1" /> {post.likes?.length} Likes
                            </div>
                            <div>
                                <FaCommentAlt className="me-1" /> {post.comments?.length} Comments
                            </div>
                            <div>
                                <FaShare className="me-1" /> {post.shares?.length} Shares
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default UserPosts;

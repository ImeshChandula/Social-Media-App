import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";
import PostCard from "./PostCard";

const favorites = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axiosInstance.get("/posts/favorites");
                setPosts(res.data.posts || res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to fetch posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleLikeUpdate = (postId, newLikeCount, newIsLiked) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId || post.id === postId
                    ? {
                        ...post,
                        likeCount: newLikeCount,
                        isLiked: newIsLiked
                    }
                    : post
            )
        );
    };

    const handleDeletePost = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId && post.id !== postId));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white normal-loading-spinner">
                    Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
                </div>
            </div>
        );
    }

    if (error) return <div className="alert alert-warning">{error}</div>;
    if (posts.length === 0) return <p className="text-center text-white">No posts to show.</p>;

    return (
        <div className="my-3">
            {posts.map((post, index) => (
                <motion.div
                    key={post._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <PostCard
                        post={post}
                        isUserPost={true}
                        onLikeUpdate={handleLikeUpdate}
                        onDeletePost={handleDeletePost}
                        disableNavigation={true}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default favorites;

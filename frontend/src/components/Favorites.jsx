import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";
import PostCard from "./PostCard";

const Favorites = () => {
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
                setError(err.response?.data?.message || "Failed to fetch favorite posts.");
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

    const handleRemoveFromFavorites = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId && post.id !== postId));
    };

    if (loading) {
        return (
            <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
                Loading Favorites<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-warning text-start">
                {error}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-white text-center my-5 fs-5">
                No favorite posts to show.
            </div>
        );
    }

    return (
        <div className="container my-4">
            {posts.map((post, index) => (
                <motion.div
                    key={post._id || post.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-3"
                    style={{ textAlign: 'left' }}
                >
                    <PostCard
                        post={post}
                        isUserPost={false}
                        onLikeUpdate={handleLikeUpdate}
                        onDeletePost={handleDeletePost}
                        onRemoveFromFavorites={handleRemoveFromFavorites}
                        disableNavigation={true}
                        alignLeft={true}
                        showAsFavorite={true}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default Favorites;
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { motion } from "framer-motion";
import PostCard from "./PostCard";
import toast from "react-hot-toast";

const UserPosts = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // Track pending like updates to prevent conflicts
    const [pendingLikeUpdates, setPendingLikeUpdates] = useState(new Map());

    const fetchPosts = async (refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            console.log(`[DEBUG] Fetching user posts...`);
            const res = await axiosInstance.get("/posts/me");
            const fetchedPosts = res.data.posts || res.data;
            
            console.log(`[DEBUG] Received ${fetchedPosts.length} user posts`);

            setPosts(prevPosts => {
                // Apply any pending like updates to preserve recent changes
                const finalPosts = fetchedPosts.map(post => {
                    const postId = post._id || post.id;
                    const pendingUpdate = pendingLikeUpdates.get(postId);
                    
                    if (pendingUpdate) {
                        console.log(`[DEBUG] Applying pending like update for user post ${postId}:`, pendingUpdate);
                        return {
                            ...post,
                            isLiked: pendingUpdate.isLiked,
                            likeCount: pendingUpdate.likeCount
                        };
                    }
                    
                    // Ensure likeCount is properly set
                    return {
                        ...post,
                        likeCount: post.likeCount || 0,
                        isLiked: post.isLiked || false
                    };
                });

                return finalPosts;
            });
        } catch (err) {
            console.error('[DEBUG] UserPosts fetch error:', err);
            const errorMessage = err.response?.data?.message || "Failed to fetch posts.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLikeUpdate = (postId, newLikeCount, newIsLiked) => {
        console.log(`[DEBUG] UserPosts handleLikeUpdate called:`, {
            postId,
            newIsLiked,
            newLikeCount
        });
        
        // Store this update as pending to preserve it during refreshes
        setPendingLikeUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(postId, { isLiked: newIsLiked, likeCount: newLikeCount, timestamp: Date.now() });
            return newMap;
        });

        // Clear the pending update after a delay (assuming API call completes)
        setTimeout(() => {
            setPendingLikeUpdates(prev => {
                const newMap = new Map(prev);
                newMap.delete(postId);
                return newMap;
            });
        }, 3000); // Increased timeout to ensure API call completes

        setPosts(prevPosts =>
            prevPosts.map(post => {
                const currentPostId = post._id || post.id;
                if (currentPostId === postId) {
                    const updatedPost = {
                        ...post,
                        likeCount: Math.max(0, newLikeCount),
                        isLiked: newIsLiked
                    };
                    console.log(`[DEBUG] Updated user post ${postId}:`, {
                        oldIsLiked: post.isLiked,
                        newIsLiked: updatedPost.isLiked,
                        oldLikeCount: post.likeCount,
                        newLikeCount: updatedPost.likeCount
                    });
                    return updatedPost;
                }
                return post;
            })
        );
    };

    const handleDeletePost = (postId) => {
        console.log(`[DEBUG] Deleting user post ${postId}`);
        setPosts(prevPosts => prevPosts.filter(post => {
            const currentPostId = post._id || post.id;
            return currentPostId !== postId;
        }));
        
        // Remove from pending updates if exists
        setPendingLikeUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(postId);
            return newMap;
        });

        toast.success("Post deleted successfully");
    };

    const refreshPosts = async () => {
        console.log(`[DEBUG] Refreshing user posts manually`);
        // Clear pending updates before refresh to get fresh data
        setPendingLikeUpdates(new Map());
        await fetchPosts(true);
    };

    // Debug: Log current posts state
    useEffect(() => {
        console.log(`[DEBUG] UserPosts state updated:`, {
            totalPosts: posts.length,
            pendingUpdates: pendingLikeUpdates.size,
            firstPostLikeData: posts[0] ? {
                postId: posts[0]._id || posts[0].id,
                isLiked: posts[0].isLiked,
                likeCount: posts[0].likeCount
            } : 'No posts'
        });
    }, [posts, pendingLikeUpdates]);

    if (loading && posts.length === 0) {
        return (
            <div className="text-secondary text-center my-5 fs-5 normal-loading-spinner">
                Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (refreshing && posts.length === 0) {
        return (
            <div className="text-secondary text-center my-5 fs-5 normal-loading-spinner">
                Refreshing Posts<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="alert alert-warning text-start">
                {error}
                <div className="mt-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchPosts(true)}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (posts.length === 0 && !loading) {
        return (
            <div className="text-secondary text-center my-5 fs-5">
                No posts to show.
                <div className="mt-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={refreshPosts}
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Refresh Button */}
            <div className="text-center mb-3">
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={refreshPosts}
                    disabled={refreshing || loading}
                >
                    {refreshing ? 'Refreshing...' : '🔄 Refresh Posts'}
                </button>
            </div>

            <div className="text-start"> {/* Ensure left alignment for the entire container */}
                {posts.map((post, index) => (
                    <motion.div
                        key={post._id || post.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="mb-3" // Add margin between posts
                        style={{ textAlign: 'left' }} // Force left alignment
                    >
                        <PostCard
                            post={post}
                            isUserPost={true}
                            onLikeUpdate={handleLikeUpdate}
                            onDeletePost={handleDeletePost}
                            disableNavigation={true}
                            // Add props to ensure left alignment in PostCard
                            alignLeft={true}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default UserPosts;
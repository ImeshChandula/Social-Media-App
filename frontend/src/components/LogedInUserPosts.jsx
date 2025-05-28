import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
// eslint-disable-next-line no-unused-vars
import  {motion}  from "framer-motion";
import PostCard from "./PostCard";

const UserPosts = () => {
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

    // Handle like updates
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

    if (error) return <div className="alert alert-warning">{error}</div>;
    if (posts.length === 0) return <p className="text-center text-white">No posts to show.</p>;

    return (
        <div className="container my-4">
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
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default UserPosts;

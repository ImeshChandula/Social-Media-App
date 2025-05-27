import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";

const PostLikeButton = ({ postId, initialIsLiked = false, initialLikeCount = 0 }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [loading, setLoading] = useState(false);

    const toggleLike = async () => {
        if (loading) return;
        setLoading(true);

        console.log("Liking post with id:", postId);

        try {
            const res = await axiosInstance.post(`/likes/toPost/${postId}`);
            const { isLiked, likeCount } = res.data.data;
            setIsLiked(isLiked);
            setLikeCount(likeCount);
        } catch (error) {
            console.error("Error toggling like:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleLike}
            disabled={loading}
            className="btn btn-link text-danger d-flex align-items-center gap-1 p-0"
        >
            {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
            <span className="text-white-50">{likeCount}</span>
        </button>
    );
};

export default PostLikeButton;

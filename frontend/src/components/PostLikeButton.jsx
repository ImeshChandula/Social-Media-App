import React, { useState, useEffect  } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";

const PostLikeButton = ({ postId, initialIsLiked = false, initialLikeCount = 0, onLikeUpdate  }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [loading, setLoading] = useState(false);

    // Sync with props when they change (e.g., after page refresh)
    useEffect(() => {
        setIsLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
    }, [initialIsLiked, initialLikeCount]);

    const toggleLike = async () => {
        if (loading) return;
        setLoading(true);

        // Store current state for potential rollback
        const currentIsLiked = isLiked;
        const currentLikeCount = likeCount;

        // Optimistic update - update UI immediately
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
        
        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);
        
        // Update parent component immediately
        if (onLikeUpdate) {
            onLikeUpdate(postId, newIsLiked, newLikeCount);
        }

        console.log(`${newIsLiked ? 'Liking' : 'Un-liking'} post with id:`, postId);

        try {
            const res = await axiosInstance.post(`/likes/toPost/${postId}`);
            const { isLiked: serverIsLiked, likeCount: serverLikeCount } = res.data.data;
            
            // Update with server response (in case our optimistic update was wrong)
            setIsLiked(serverIsLiked);
            setLikeCount(serverLikeCount);

            if (onLikeUpdate) {
                onLikeUpdate(postId, serverIsLiked, serverLikeCount);
            }
        } catch (error) {
            console.error("Error toggling like:", error.response?.data || error.message);
            
            // Revert optimistic update on error
            setIsLiked(currentIsLiked);
            setLikeCount(currentLikeCount);
            
            if (onLikeUpdate) {
                onLikeUpdate(postId, isLiked, likeCount);
            }
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

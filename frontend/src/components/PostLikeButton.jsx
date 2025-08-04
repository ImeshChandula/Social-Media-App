//new ----------------------------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useCallback } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";

const PostLikeButton = ({ postId, initialIsLiked = false, initialLikeCount = 0, onLikeUpdate }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [loading, setLoading] = useState(false);
    const [pendingRequest, setPendingRequest] = useState(null);

    // Debug: Log initial props
    useEffect(() => {
        console.log(`[DEBUG] PostLikeButton initialized for post ${postId}:`, {
            initialIsLiked,
            initialLikeCount
        });
    }, [postId, initialIsLiked, initialLikeCount]);

    // Sync with props when they change (e.g., after page refresh or prop updates)
    useEffect(() => {
        console.log(`[DEBUG] Props updated for post ${postId}:`, {
            initialIsLiked,
            initialLikeCount,
            currentIsLiked: isLiked,
            currentLikeCount: likeCount
        });
        setIsLiked(initialIsLiked);
        setLikeCount(initialLikeCount);
    }, [initialIsLiked, initialLikeCount, postId]);

    // Debounced API call to handle rapid clicks
    const debouncedToggleLike = useCallback(async (targetState) => {
        if (pendingRequest) {
            clearTimeout(pendingRequest);
        }

        const timeoutId = setTimeout(async () => {
            try {
                console.log(`[DEBUG] Making API call for post ${postId}:`, {
                    targetState,
                    endpoint: `/likes/toPost/${postId}`
                });
                
                const res = await axiosInstance.post(`/likes/toPost/${postId}`);
                
                console.log(`[DEBUG] API response for post ${postId}:`, res.data);
                
                if (res.data && res.data.success) {
                    const { isLiked: serverIsLiked, likeCount: serverLikeCount } = res.data.data;
                    
                    console.log(`[DEBUG] Server response data for post ${postId}:`, {
                        serverIsLiked,
                        serverLikeCount
                    });
                    
                    // Update local state with server response
                    setIsLiked(serverIsLiked);
                    setLikeCount(serverLikeCount);
                    
                    // Update parent component
                    if (onLikeUpdate) {
                        console.log(`[DEBUG] Calling onLikeUpdate for post ${postId}:`, {
                            postId,
                            serverIsLiked,
                            serverLikeCount
                        });
                        onLikeUpdate(postId, serverIsLiked, serverLikeCount);
                    }
                } else {
                    console.error(`[DEBUG] API call failed for post ${postId}:`, res.data);
                    throw new Error(res.data?.message || 'Failed to update like');
                }
            } catch (error) {
                console.error(`[DEBUG] Error toggling like for post ${postId}:`, {
                    error: error.response?.data || error.message,
                    fullError: error
                });
                
                // Revert to previous state on error
                const revertedIsLiked = !targetState;
                const revertedLikeCount = targetState ? likeCount - 1 : likeCount + 1;
                
                console.log(`[DEBUG] Reverting state for post ${postId}:`, {
                    revertedIsLiked,
                    revertedLikeCount
                });
                
                setIsLiked(revertedIsLiked);
                setLikeCount(revertedLikeCount);
                
                if (onLikeUpdate) {
                    onLikeUpdate(postId, revertedIsLiked, revertedLikeCount);
                }
            } finally {
                setLoading(false);
                setPendingRequest(null);
            }
        }, 300); // 300ms debounce

        setPendingRequest(timeoutId);
    }, [postId, onLikeUpdate, likeCount, pendingRequest]);

    const toggleLike = async () => {
        if (loading) return;
        
        console.log(`[DEBUG] Like button clicked for post ${postId}:`, {
            currentIsLiked: isLiked,
            currentLikeCount: likeCount
        });
        
        setLoading(true);

        // Optimistic update - update UI immediately
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

        console.log(`[DEBUG] Optimistic update for post ${postId}:`, {
            newIsLiked,
            newLikeCount
        });

        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);

        // Update parent component immediately for better UX
        if (onLikeUpdate) {
            onLikeUpdate(postId, newIsLiked, newLikeCount);
        }

        // Make API call with debouncing
        await debouncedToggleLike(newIsLiked);
    };

    // Cleanup pending request on unmount
    useEffect(() => {
        return () => {
            if (pendingRequest) {
                clearTimeout(pendingRequest);
            }
        };
    }, [pendingRequest]);

    return (
        <button
            onClick={toggleLike}
            disabled={loading}
            className={`like-btn d-flex align-items-center gap-1 p-1 border-0 bg-transparent ${loading ? 'opacity-75' : ''}`}
            style={{ 
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
            }}
            title={isLiked ? 'Unlike this post' : 'Like this post'}
        >
            {isLiked ? (
                <FaHeart 
                    size={18} 
                    className="text-danger"
                    style={{ 
                        animation: loading ? 'none' : 'heartbeat 0.3s ease-in-out',
                        transform: loading ? 'scale(0.9)' : 'scale(1)'
                    }} 
                />
            ) : (
                <FaRegHeart 
                    size={18} 
                    className="text-danger"
                    style={{ 
                        transform: loading ? 'scale(0.9)' : 'scale(1)',
                        transition: 'transform 0.1s ease'
                    }} 
                />
            )}
            <span className="text-black fw-medium">
                {likeCount}
            </span>
            {loading && (
                <div 
                    className="spinner-border spinner-border-sm text-danger" 
                    role="status"
                    style={{ width: '0.8rem', height: '0.8rem' }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
            )}
        </button>
    );
};

export default PostLikeButton;
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import PostCard from "./PostCard";
import toast from "react-hot-toast";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [feedType, setFeedType] = useState('engagement'); // 'engagement' or 'recency' or 'trending'
    const [pagination, setPagination] = useState({
        page: 1,
        hasMore: false,
        totalPages: 0
    });

    useEffect(() => {
        fetchFeed();
    }, [feedType]); // Re-fetch when feedType changes

    const fetchFeed = async (refresh = false, pageNumber = 1, scrollToFirstNew = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
                setPagination({ page: 1, hasMore: false, totalPages: 0 });
            } else if (pageNumber > 1) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            setError(null);

            // Use dynamic parameters based on feedType
            const params = {
                page: pageNumber,
                limit: 20,
                refresh: refresh || pageNumber === 1,
            };

            // Set parameters based on feedType
            switch (feedType) {
                case 'engagement':
                    params.sort_by = 'engagement';
                    params.show_trending = false;
                    break;
                case 'recency':
                    params.sort_by = 'createdAt';
                    params.show_trending = false;
                    break;
                case 'trending':
                    params.sort_by = 'trending';
                    params.show_trending = true;
                    break;
                default:
                    params.sort_by = 'engagement';
                    params.show_trending = false;
            }

            const res = await axiosInstance.get("/feed/", { params });

            if (res.data.success) {
                const newPosts = res.data.posts || [];

                setPosts(prev => {
                    if (pageNumber === 1 || refresh) {
                        return newPosts;
                    } else {
                        // Avoid duplicates when loading more
                        const existingIds = prev.map(p => p._id || p.id);
                        const uniqueNewPosts = newPosts.filter(p => !existingIds.includes(p._id || p.id));
                        return [...prev, ...uniqueNewPosts];
                    }
                });

                // Scroll into view of first new post
                if (scrollToFirstNew && newPosts.length) {
                    setTimeout(() => {
                        const postElement = document.getElementById(`post-${newPosts[0]._id || newPosts[0].id}`);
                        if (postElement) {
                            postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 100);
                }

                if (res.data.pagination) {
                    setPagination({
                        page: res.data.pagination.page,
                        hasMore: res.data.pagination.hasMore,
                        totalPages: res.data.pagination.totalPages
                    });
                }
            } else {
                const errorMessage = res.data.message || "Failed to fetch posts";
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch posts";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Feed fetch error:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

   const updatePostLike = (postId, isLiked, likeCount) => {
    setPosts(prevPosts =>
        prevPosts.map(post =>
            (post._id === postId || post.id === postId)
                ? { ...post, isLiked, likeCount }
                : post
        )
    );
};



    // Load more posts function
    const loadMorePosts = async () => {
        if (!pagination.hasMore || loadingMore || loading) return;
        await fetchFeed(false, pagination.page + 1);
    };

    // Refresh feed function
    const refreshFeed = async () => {
        await fetchFeed(true, 1);
    };

    // Change feed type
    const changeFeedType = (newType) => {
        if (newType !== feedType) {
            setFeedType(newType);
            setPosts([]); // Clear posts immediately
            setPagination({ page: 1, hasMore: false, totalPages: 0 });
        }
    };

    // Handle post deletion
    const handleDeletePost = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => (post._id || post.id) !== postId));
    };

    if (loading && posts.length === 0) {
        return (
            <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
                Loading Feeds<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (refreshing && posts.length === 0) {
        return (
            <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
                Refreshing Feed<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="text-danger text-center my-5 fs-5">
                Error loading feed: {error}
                <div className="mt-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchFeed(true)}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!posts.length && !loading) {
        return (
            <div className="text-white text-center my-5 fs-5">
                No posts found
                <div className="mt-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchFeed(true)}
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Feed Type Selector */}
            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group" role="group">
                    <button
                        type="button"
                        className={`btn ${feedType === 'engagement' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changeFeedType('engagement')}
                        disabled={loading || refreshing}
                    >
                        For You
                    </button>
                    <button
                        type="button"
                        className={`btn ${feedType === 'recency' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changeFeedType('recency')}
                        disabled={loading || refreshing}
                    >
                        Recent
                    </button>
                    <button
                        type="button"
                        className={`btn ${feedType === 'trending' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changeFeedType('trending')}
                        disabled={loading || refreshing}
                    >
                        Trending
                    </button>
                </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center mb-3">
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={refreshFeed}
                    disabled={refreshing || loading}
                >
                    {refreshing ? 'Refreshing...' : '🔄 Refresh Feed'}
                </button>
            </div>

            {/* Loading indicator for feed type changes */}
            {loading && posts.length === 0 && (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Posts */}
            {posts.map((post, index) => (
                <div key={post._id || post.id || index} id={`post-${post._id || post.id}`}>
                    <PostCard
                        post={post}
                        isUserPost={post.isUserPost}
                        disableNavigation={true}
                        onLikeUpdate={updatePostLike}
                        onDeletePost={handleDeletePost}
                    />
                </div>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && feedType !== 'trending' && (
                <div className="text-center my-4">
                    <button
                        className="btn btn-primary"
                        onClick={loadMorePosts}
                        disabled={loadingMore || loading}
                    >
                        {loadingMore ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Loading...
                            </>
                        ) : (
                            'Load More Posts'
                        )}
                    </button>
                </div>
            )}

            {/* End of feed message */}
            {!pagination.hasMore && posts.length > 0 && (
                <div className="text-center my-4 text-muted">
                    <small>You've reached the end of the feed</small>
                </div>
            )}
        </div>
    );
};

export default Feed;
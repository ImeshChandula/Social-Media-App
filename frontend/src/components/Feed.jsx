import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import PostCard from "./PostCard";
import toast from "react-hot-toast";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [loadingMore, setLoadingMore] = useState(false);
    // eslint-disable-next-line no-unused-vars
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
    }, []);

    const fetchFeed = async (refresh = false, pageNumber = 1, scrollToFirstNew = false) => {
        try {
            if (!refresh && pageNumber > 1) setLoadingMore(true);
            else setLoading(true);

            setError(null);

            const res = await axiosInstance.get("/feed/", {
                params: {
                    page: 1,
                    limit: 20,
                    sort_by: 'engagement',
                    refresh: true,
                    show_trending: false
                }
            });

            if (res.data.success) {
                const newPosts = res.data.posts || [];

                setPosts(prev =>
                    pageNumber === 1 ? newPosts : [...prev, ...newPosts]
                );

                // Scroll into view of first new post
                if (scrollToFirstNew && newPosts.length) {
                    setTimeout(() => {
                        const postElement = document.getElementById(`post-${newPosts[0]._id || newPosts[0].id}`);
                        if (postElement) postElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100); // allow DOM to render
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
        }
    };

    // Feed.jsx
const updatePostLike = (postId, isLiked, likeCount) => {
  setPosts(prevPosts =>
    prevPosts.map(post => {
      const id = post._id ?? post.id;          // support either field
      if (id !== postId) return post;          // leave all other posts untouched

      return {
        ...post,
        isLiked,
        likeCount: Math.max(0, likeCount),     // extra guard: no negative counts
      };
    })
  );
};


    // Load more posts function
    const loadMorePosts = async () => {
        if (!pagination.hasMore || loadingMore || feedType === 'trending') return;
        await fetchFeed(false, pagination.page + 1);
    };

    // Refresh feed function
    const refreshFeed = async () => {
        setPagination({ page: 1, hasMore: false, totalPages: 0 });
        await fetchFeed(true);
    };

    // Change feed type
    const changeFeedType = (newType) => {
        if (newType !== feedType) {
            setFeedType(newType);
            setPagination({ page: 1, hasMore: false, totalPages: 0 });
        }
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
        return <div className="text-danger text-center my-5 fs-5">Error loading feed: {error}</div>;
    }

    if (!posts.length) {
        return <div className="text-white text-center my-5 fs-5">No posts found</div>;
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
                    >
                        For You
                    </button>
                    <button
                        type="button"
                        className={`btn ${feedType === 'recency' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changeFeedType('recency')}
                    >
                        Recent
                    </button>
                    <button
                        type="button"
                        className={`btn ${feedType === 'trending' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => changeFeedType('trending')}
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

            {/* Posts */}
            {posts.map((post, index) => (
                <div key={post._id || post.id || index} id={`post-${post._id || post.id}`}>
                    <PostCard
                        post={post}
                        isUserPost={post.isUserPost}
                        onLikeUpdate={updatePostLike}
                    />
                </div>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && feedType !== 'trending' && (
                <div className="text-center my-4">
                    <button
                        className="btn btn-primary"
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                    >
                        {loadingMore ? 'Loading...' : 'Load More Posts'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Feed;

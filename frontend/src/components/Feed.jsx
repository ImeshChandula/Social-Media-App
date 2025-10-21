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
    const [feedType, setFeedType] = useState('engagement');
    // Track pending like updates to prevent conflicts
    const [pendingLikeUpdates, setPendingLikeUpdates] = useState(new Map());
    // Track pending report operations
    const [pendingReports, setPendingReports] = useState(new Set());
    const [pagination, setPagination] = useState({
        page: 1,
        hasMore: false,
        totalPages: 0
    });

    useEffect(() => {
        fetchFeed();
    }, [feedType]);

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

            const params = {
                page: pageNumber,
                limit: 20,
                refresh: refresh || pageNumber === 1,
            };

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

            console.log(`[DEBUG] Fetching feed with params:`, params);

            const res = await axiosInstance.get("/feed/", { params });

            console.log(`[DEBUG] Feed API response:`, res.data);

            console.log(`[DEBUG] Feed API response:`, {
                success: res.data.success,
                postCount: res.data.posts?.length,
                posts: res.data.posts?.map(p => ({
                    id: p._id || p.id,
                    authorType: p.authorType,
                    author: p.author ? {
                        id: p.author.id,
                        pageName: p.author.pageName,
                        username: p.author.username,
                        isPage: p.author.isPage,
                        owner: p.author.owner ? {
                            firstName: p.author.owner.firstName,
                            lastName: p.author.owner.lastName
                        } : null
                    } : null
                }))
            });

            if (res.data.success) {
                const newPosts = res.data.posts || [];

                console.log(`[DEBUG] Received ${newPosts.length} posts from API`);

                setPosts(prev => {
                    let finalPosts;

                    if (pageNumber === 1 || refresh) {
                        console.log(`[DEBUG] Replacing all posts with ${newPosts.length} new posts`);
                        finalPosts = newPosts;
                    } else {
                        const existingIds = prev.map(p => p._id || p.id);
                        const uniqueNewPosts = newPosts.filter(p => !existingIds.includes(p._id || p.id));
                        console.log(`[DEBUG] Adding ${uniqueNewPosts.length} unique new posts to existing ${prev.length} posts`);
                        finalPosts = [...prev, ...uniqueNewPosts];
                    }

                    // Apply any pending like updates and ensure author displayName
                    finalPosts = finalPosts.map(post => {
                        let updatedPost = { ...post };

                        // Ensure consistent author data for page posts
                        if (post.authorType === 'page' && post.author) {
                            updatedPost.author = {
                                ...post.author,
                                displayName: post.author.pageName || post.author.username || post.author.firstName || "Unknown Page",
                                firstName: post.author.pageName || post.author.username || post.author.firstName || "Unknown Page",
                                lastName: '',
                                isPage: true
                            };
                        } else if (post.author) {
                            // For user posts, ensure displayName
                            updatedPost.author = {
                                ...post.author,
                                displayName: `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.username || "Unknown User",
                                isPage: false
                            };
                        }

                        const postId = updatedPost._id || updatedPost.id;
                        const pendingUpdate = pendingLikeUpdates.get(postId);

                        if (pendingUpdate) {
                            console.log(`[DEBUG] Applying pending like update for post ${postId}:`, pendingUpdate);
                            updatedPost = {
                                ...updatedPost,
                                isLiked: pendingUpdate.isLiked,
                                likeCount: pendingUpdate.likeCount
                            };
                        }

                        // Ensure likeCount is properly set
                        return {
                            ...updatedPost,
                            likeCount: updatedPost.likeCount || 0,
                            isLiked: updatedPost.isLiked || false
                        };
                    });

                    return finalPosts;
                });

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
            console.error('[DEBUG] Feed fetch error:', err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch posts";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
        }
    };

    // Enhanced updatePostLike function with pending updates tracking
    const updatePostLike = (postId, isLiked, likeCount) => {
        console.log(`[DEBUG] updatePostLike called:`, {
            postId,
            isLiked,
            likeCount
        });

        // Store this update as pending to preserve it during refreshes
        setPendingLikeUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(postId, { isLiked, likeCount, timestamp: Date.now() });
            return newMap;
        });

        // Clear the pending update after a delay (assuming API call completes)
        setTimeout(() => {
            setPendingLikeUpdates(prev => {
                const newMap = new Map(prev);
                newMap.delete(postId);
                return newMap;
            });
        }, 2000);

        setPosts(prevPosts => {
            const updatedPosts = prevPosts.map(post => {
                const currentPostId = post._id || post.id;
                if (currentPostId === postId) {
                    const updatedPost = {
                        ...post,
                        isLiked,
                        likeCount: Math.max(0, likeCount)
                    };
                    console.log(`[DEBUG] Updated post ${postId}:`, {
                        oldIsLiked: post.isLiked,
                        newIsLiked: updatedPost.isLiked,
                        oldLikeCount: post.likeCount,
                        newLikeCount: updatedPost.likeCount
                    });
                    return updatedPost;
                }
                return post;
            });
            return updatedPosts;
        });
    };

    // Report post functionality
    const reportPost = async (postId, reason) => {
        try {
            console.log(`[DEBUG] Reporting post ${postId} with reason:`, reason);

            // Check if post is already being reported
            if (pendingReports.has(postId)) {
                toast.error("Report is already in progress for this post");
                return { success: false, message: "Report already pending" };
            }

            // Add to pending reports
            setPendingReports(prev => new Set(prev).add(postId));

            // Validate reason
            if (!reason || reason.trim() === '') {
                setPendingReports(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
                toast.error("Reason is required for reporting a post");
                return { success: false, message: "Reason is required" };
            }

            const response = await axiosInstance.post(`/posts/report/${postId}`, {
                reason: reason.trim()
            });

            if (response.data.success) {
                console.log(`[DEBUG] Post ${postId} reported successfully`);

                // Remove the reported post from the feed immediately for better UX
                setPosts(prevPosts => prevPosts.filter(post => {
                    const currentPostId = post._id || post.id;
                    return currentPostId !== postId;
                }));

                toast.success("Post reported successfully. It has been removed from your feed.");

                return {
                    success: true,
                    message: "Post reported successfully",
                    reportId: response.data.reportId
                };
            } else {
                throw new Error(response.data.message || "Failed to report post");
            }
        } catch (error) {
            console.error(`[DEBUG] Report post error for ${postId}:`, error);

            let errorMessage = "Failed to report post";

            if (error.response?.status === 400) {
                errorMessage = error.response.data.message || "You have already reported this post";
            } else if (error.response?.status === 404) {
                errorMessage = "Post not found";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);

            return {
                success: false,
                message: errorMessage
            };
        } finally {
            // Remove from pending reports
            setPendingReports(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    // Check if post is being reported
    const isPostBeingReported = (postId) => {
        return pendingReports.has(postId);
    };

    const loadMorePosts = async () => {
        if (!pagination.hasMore || loadingMore || loading) return;
        await fetchFeed(false, pagination.page + 1);
    };

    const refreshFeed = async () => {
        console.log(`[DEBUG] Refreshing feed manually`);
        // Clear pending updates before refresh to get fresh data
        setPendingLikeUpdates(new Map());
        setPendingReports(new Set()); // Clear pending reports
        await fetchFeed(true, 1);
    };

    const changeFeedType = (newType) => {
        if (newType !== feedType) {
            console.log(`[DEBUG] Changing feed type from ${feedType} to ${newType}`);
            setFeedType(newType);
            setPosts([]);
            setPendingLikeUpdates(new Map()); // Clear pending updates
            setPendingReports(new Set()); // Clear pending reports
            setPagination({ page: 1, hasMore: false, totalPages: 0 });
        }
    };

    const handleDeletePost = (postId) => {
        setPosts(prevPosts => prevPosts.filter(post => (post._id || post.id) !== postId));
        // Remove from pending updates if exists
        setPendingLikeUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(postId);
            return newMap;
        });
        // Remove from pending reports if exists
        setPendingReports(prev => {
            const newSet = new Set(prev);
            newSet.delete(postId);
            return newSet;
        });
    };

    // Debug: Log current posts state
    useEffect(() => {
        console.log(`[DEBUG] Posts state updated:`, {
            totalPosts: posts.length,
            pendingUpdates: pendingLikeUpdates.size,
            pendingReports: pendingReports.size,
            firstPostLikeData: posts[0] ? {
                postId: posts[0]._id || posts[0].id,
                isLiked: posts[0].isLiked,
                likeCount: posts[0].likeCount,
                author: posts[0].author
            } : 'No posts'
        });
    }, [posts, pendingLikeUpdates, pendingReports]);

    if (loading && posts.length === 0) {
        return (
            <div className="text-secondary text-center my-5 fs-5 normal-loading-spinner">
                Loading Feeds<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        );
    }

    if (refreshing && posts.length === 0) {
        return (
            <div className="text-secondary text-center my-5 fs-5 normal-loading-spinner">
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
            <div className="text-secondary text-center my-5 fs-5">
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

    const fetchPageDetails = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/pages/${id}`);
            if (res?.data?.success) {
                const pageData = res.data.page;
                setPage(pageData);
                setIsFollowing(pageData.isFollowing || false);

                const ownershipCheck = pageData.isOwner ||
                    (authUser && (
                        pageData.owner === authUser.id ||
                        pageData.owner?.id === authUser.id
                    ));

                setIsOwner(ownershipCheck);
            }
        } catch (err) {
            console.error('Error fetching page:', err);
            if (err.response?.status === 404) {
                toast.error("Page not found");
                navigate("/profile");
            } else {
                toast.error("Failed to load page");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchPagePosts = async () => {
        setLoadingPosts(true);
        try {
            const res = await axiosInstance.get(`/pages/${id}/posts`);
            if (res?.data?.success) {
                setPosts(res.data.posts || []);
            }
        } catch (err) {
            console.error('Error fetching page posts:', err);
            toast.error("Failed to load page posts");
        } finally {
            setLoadingPosts(false);
        }
    };

    return (
        <div className="container my-4">
            {/* Feed Type Selector (Responsive & Scrollable) */}
            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group d-none d-md-inline-flex" role="group">
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

                {/* Mobile Scrollable Buttons */}
                <div className="d-md-none w-100 overflow-auto">
                    <div className="d-flex flex-nowrap justify-content-start gap-2 px-2">
                        <button
                            type="button"
                            className={`btn btn-sm ${feedType === 'engagement' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeFeedType('engagement')}
                            disabled={loading || refreshing}
                        >
                            For You
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${feedType === 'recency' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeFeedType('recency')}
                            disabled={loading || refreshing}
                        >
                            Recent
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${feedType === 'trending' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeFeedType('trending')}
                            disabled={loading || refreshing}
                        >
                            Trending
                        </button>
                    </div>
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

            {posts.map((post, index) => (
                <div key={post._id || post.id || index} id={`post-${post._id || post.id}`}>
                    <PostCard
                        post={post}
                        isUserPost={post.authorType !== 'page'}
                        isPagePost={post.authorType === 'page'}
                        pageId={post.author?.id}
                        disableNavigation={true}
                        onLikeUpdate={updatePostLike}
                        onDeletePost={handleDeletePost}
                        onReportPost={reportPost}
                        isBeingReported={isPostBeingReported(post._id || post.id)}
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
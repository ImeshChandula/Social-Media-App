import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import PostCard from "./PostCard";
import toast from "react-hot-toast";

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axiosInstance.get("/posts/feed", {
                    params: {
                        page: 1,
                        limit: 20,
                        sort_by: 'engagement',
                        refresh: true,
                        show_trending: false
                    }
                });
                const postsData = res.data.posts || res.data || [];

                if (res.data.success) {
                    setPosts(postsData);
                } else {
                    setError(res.data.message);
                    toast.error(res.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to fetch posts");
                toast.error(err.response?.data?.message || err.message || "Failed to fetch posts");
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const updatePostLike = (postId, isLiked, likeCount) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId || post.id === postId
                    ? { ...post, isLiked, likeCount }
                    : post
            )
        );
    };

    if (loading) {
        return (
            <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
                Loading Feeds<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        )
    }
    if (error) return <div className="text-danger text-center my-5 fs-5">Error loading feed: {error}</div>;
    if (!posts.length) return <div className="text-white text-center my-5 fs-5">No posts found</div>;

    return (
        <div className="container my-4">
            {posts.map((post, index) => (
                <PostCard
                    key={post._id || post.id || index}
                    post={post}
                    isUserPost={post.isUserPost}
                    onLikeUpdate={updatePostLike}
                />
            ))}
        </div>
    );
};

export default Feed;

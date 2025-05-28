import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import PostCard from "./PostCard";

const Feed = ({ type = "all" }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === "videos" ? "/posts/feed/videos" : "/posts/feed";
                const res = await axiosInstance.get(endpoint);
                const postsData = res.data.posts || res.data || [];

                setPosts(postsData);
            } catch (err) {
                setError(err.response?.data?.msg || err.message || "Failed to fetch posts");
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [type]);

    // Function to update like status for a specific post
    const updatePostLike = (postId, isLiked, likeCount) => {
        setPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === postId || post.id === postId
                    ? { ...post, isLiked, likeCount }
                    : post
            )
        );
    };

    if (loading) return <div className="text-white text-center my-5 fs-5 loading-spinner">Loading feed...</div>;
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

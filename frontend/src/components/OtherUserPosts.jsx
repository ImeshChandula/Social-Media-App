import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import PostCard from "./PostCard";

// eslint-disable-next-line no-unused-vars
const OtherUserPosts = ({ userId, type = "all" }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOtherUserPosts = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                const res = await axiosInstance.get(`/posts/getAllPostsByUserId/${userId}`);
                const postsData = res.data.posts || res.data || [];

                setPosts(postsData);
            } catch (err) {
                setError(err.response?.data?.msg || err.message || "Failed to fetch user's posts");
            } finally {
                setLoading(false);
            }
        };

        fetchOtherUserPosts();
    }, [userId]);

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
                Loading posts<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
            </div>
        )
    }
    if (error) return <div className="text-danger text-center my-5 fs-5">Error: {error}</div>;
    if (!posts.length) return <div className="text-white text-center my-5 fs-5">No posts found</div>;

    return (
        <div className="container">
            {posts.map((post, index) => (
                <PostCard
                    key={post._id || post.id || index}
                    post={post}
                    isUserPost={false}
                    onLikeUpdate={updatePostLike}
                />
            ))}
        </div>
    );
};

export default OtherUserPosts;

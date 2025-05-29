import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";

const Feed = ({ type = "all" }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                setLoading(true);
                setError(null);

                const endpoint = type === "/stories/feed";
                const res = await axiosInstance.get(endpoint);
                const storiesData = res.data.stories || res.data || [];

                setStories(storiesData);
            } catch (err) {
                setError(err.response?.data?.msg || err.message || "Failed to fetch stories");
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, [type]);

    if (loading) return <div className="text-white text-center my-5 fs-5 loading-spinner">Loading feed...</div>;
    if (error) return <div className="text-danger text-center my-5 fs-5">Error loading feed: {error}</div>;
    if (!stories.length) return <div className="text-white text-center my-5 fs-5">No stories found</div>;

    return (
        <div className="container my-4">
            {stories.map((stories, index) => (
                <Stories
                    key={stories._id || stories.id || index}
                    post={stories}
                    isUserPost={stories.isUserPost}
                    onLikeUpdate=""
                />
            ))}
        </div>
    );
};

export default Feed;

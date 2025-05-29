// src/components/Stories.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";

const Stories = () => {
    const [storyFeed, setStoryFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchStories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axiosInstance.get("/stories/feed");
                const storiesArray = res.data.stories || res.data || [];
                setStoryFeed(storiesArray);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to fetch stories");
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) return <div className="text-white text-center my-3 fs-5">Loading stories...</div>;
    if (error) return <div className="text-danger text-center my-3 fs-5">Error loading stories: {error}</div>;
    if (!storyFeed.length) return <div className="text-white text-center my-3 fs-5">No stories found</div>;

    
    
    return (
        <div className="mb-4">
            {storyFeed.map(({ user, stories }) => (
                stories.map((story) => (
                    <div key={story._id} className="card bg-dark text-white mb-4">
                        <div className="card-header d-flex align-items-center">
                            <img
                                src={stories.author?.username}
                                alt={user.username}
                                className="rounded-circle me-2"
                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                            />
                            <strong>{user.username}</strong>
                        </div>
                        <Link to={`/stories/${story._id}/view`} className="text-decoration-none">
                            <img
                                src={story.media}
                                alt="Story"
                                className="card-img-top"
                                style={{ maxHeight: "400px", objectFit: "cover" }}
                            />
                        </Link>
                        <div className="card-body">
                            <p className="card-text">Views: {story.viewCount || 0}</p>
                        </div>
                    </div>
                ))
            ))}
        </div>
    );
};

export default Stories;

// src/components/Stories.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";

const Stories = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axiosInstance.get("/stories/feed");
                setStories(res.data);
            } catch (err) {
                setError(err.response?.data?.msg || err.message || "Failed to fetch stories");
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    if (loading) return <div className="text-white text-center my-3 fs-5">Loading stories...</div>;
    if (error) return <div className="text-danger text-center my-3 fs-5">Error loading stories: {error}</div>;
    if (!stories.length) return <div className="text-white text-center my-3 fs-5">No stories found</div>;

    return (
        <div className="d-flex gap-3 overflow-auto mb-4">
            {stories.map((userStory) => {
                const user = userStory.user;
                const storyId = userStory.stories[0]?._id;
                const bg = userStory.stories[0]?.media || "https://via.placeholder.com/150";

                return (
                    <Link
                        to={`/stories/${storyId}/view`}
                        key={storyId}
                        className="text-decoration-none"
                    >
                        <div
                            className="position-relative rounded-4"
                            style={{
                                width: "110px",
                                height: "180px",
                                backgroundImage: `url(${bg})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                flex: "0 0 auto",
                                borderRadius: "15px",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={user.profilePic}
                                alt={user.username}
                                className="rounded-circle border border-2 border-primary"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                    objectFit: "cover",
                                }}
                            />
                            <div
                                className="position-absolute bottom-0 start-0 end-0 text-white text-center"
                                style={{
                                    background: "rgba(0, 0, 0, 0.4)",
                                    fontSize: "14px",
                                    padding: "5px",
                                }}
                            >
                                {user.username}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default Stories;

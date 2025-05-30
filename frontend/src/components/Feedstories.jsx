import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";

const Feedstories = ({ type = "all" }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "/stories/feed";
      if (type === "me") {
        endpoint = "/stories/me";
      }

      const res = await axiosInstance.get(endpoint);
      const storiesData = res.data.stories || res.data || [];

      setStories(storiesData);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [type]);

  const handleDelete = (storyId) => {
    setStories((prev) => prev.filter((story) => story._id !== storyId));
  };

  const handleUpdate = (updatedStory) => {
    setStories((prev) =>
      prev.map((story) => (story._id === updatedStory._id ? updatedStory : story))
    );
  };

  if (loading) return <div className="text-white text-center my-5 fs-5">Loading feed...</div>;
  if (error) return <div className="text-danger text-center my-5 fs-5">Error loading feed: {error}</div>;
  if (!stories.length) return <div className="text-white text-center my-5 fs-5">No stories found</div>;

  return (
    <div className="container my-4">
      {stories.map((story, index) => (
        <Stories
          key={story._id || story.id || index}
          post={story}
          isUserPost={type === "me"}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
};

export default Feedstories;

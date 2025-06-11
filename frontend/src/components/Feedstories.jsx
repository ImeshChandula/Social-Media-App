import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";

const Feedstories = ({ type = "all" }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stories
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint = "/stories/feed";
        if (type === "me") {
          endpoint = "/stories/me";
        }

        const res = await axiosInstance.get(endpoint);
        const storiesFromApi = res.data?.stories || res.data;
        const storiesArray = Array.isArray(storiesFromApi) ? storiesFromApi : [];
        setStories(storiesArray);

        // ✅ After setting stories, mark them as viewed
        storiesArray.forEach((story) => {
          markStoryAsViewed(story._id);
        });

      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch stories");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [type]);

  // Function to mark story as viewed
  const markStoryAsViewed = async (storyId) => {
    try {
      await axiosInstance.put(`/stories/${storyId}/view`);
    } catch (err) {
      console.error(`Failed to mark story ${storyId} as viewed:`, err.message);
    }
  };

  const handleDelete = (storyId) => {
    setStories((prev) => prev.filter((story) => story._id !== storyId));
  };

  const handleUpdate = (updatedStory) => {
    setStories((prev) =>
      prev.map((story) => (story._id === updatedStory._id ? updatedStory : story))
    );
  };

  if (loading)
    return <div className="text-white text-center my-5 fs-5">Loading stories...</div>;
  if (error)
    return (
      <div className="text-danger text-center my-5 fs-5">
        Error loading stories: {error}
      </div>
    );
  if (!stories.length)
    return <div className="text-white text-center my-5 fs-5">No stories found</div>;

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

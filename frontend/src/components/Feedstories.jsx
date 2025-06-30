
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";

const Feedstories = ({ type = "all" }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching stories from endpoint: ${type === "me" ? "/stories/me" : "/stories/feed"}`);

        const endpoint = type === "me" ? "/stories/me" : "/stories/feed";
        const res = await axiosInstance.get(endpoint);

        console.log('Raw API response:', res.data);

        let processedStories = [];
        if (type === "me") {
          // Handle "me" endpoint response
          const userStories = Array.isArray(res.data.stories) ? res.data.stories : [];
          processedStories = userStories.map(story => ({
            ...story,
            _id: story._id || story.id, // Normalize ID field
            user: story.user || {
              id: story.userId || 'unknown',
              username: story.user?.username || 'Unknown User',
              profilePicture: story.user?.profilePicture || 'https://via.placeholder.com/40',
              firstName: story.user?.firstName || '',
              lastName: story.user?.lastName || ''
            }
          }));
          console.log('Processed user stories:', processedStories);
        } else {
          // Handle "feed" endpoint response
          const feedStories = Array.isArray(res.data.stories) ? res.data.stories : [];
          processedStories = feedStories.flatMap(group => {
            const groupStories = Array.isArray(group.stories) ? group.stories : [];
            return groupStories.map(story => ({
              ...story,
              _id: story._id || story.id, // Normalize ID field
              user: group.user || {
                id: story.userId || 'unknown',
                username: group.user?.username || 'Unknown User',
                profilePicture: group.user?.profilePicture || 'https://via.placeholder.com/40',
                firstName: group.user?.firstName || '',
                lastName: group.user?.lastName || ''
              }
            }));
          });

          // Filter for friends' and public stories
          processedStories = processedStories.filter(story =>
            story.privacy === 'friends' || story.privacy === 'public'
          );

          // Sort by createdAt (newest first)
          processedStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          console.log('Processed feed stories:', processedStories);
        }

        setStories(processedStories);

        // Mark stories as viewed for feed (not for "me")
        if (type !== "me" && processedStories.length > 0) {
          await Promise.all(
            processedStories.map(story =>
              story._id ? markStoryAsViewed(story._id) : Promise.resolve()
            )
          );
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to load stories. Please try again.";
        console.error("Fetch stories error:", err.response || err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [type]);

  const markStoryAsViewed = async (storyId) => {
    try {
      console.log(`Marking story ${storyId} as viewed`);
      const res = await axiosInstance.put(`/stories/${storyId}/view`);
      setStories(prev =>
        prev.map(story =>
          story._id === storyId
            ? { ...story, viewCount: res.data.viewCount || story.viewCount, viewers: res.data.viewers || story.viewers }
            : story
        )
      );
    } catch (err) {
      console.error(`Failed to mark story ${storyId} as viewed:`, err.response || err);
    }
  };

  const handleDelete = (storyId) => {
    console.log(`Deleting story ${storyId}`);
    setStories(prev => prev.filter(story => story._id !== storyId));
  };

  const handleUpdate = (updatedStory) => {
    console.log(`Updating story ${updatedStory._id}`);
    setStories(prev =>
      prev.map(story =>
        story._id === updatedStory._id ? { ...story, ...updatedStory } : story
      )
    );
  };

  console.log('Current state:', { loading, error, stories });

  return (
    <div className="container my-4">
      {loading && (
        <div className="d-flex align-items-center my-3">
          <div className="spinner-border text-light me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-white fs-5">Loading stories...</span>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center my-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && stories.length === 0 && (
        <div className="text-center my-3">
          <p className="text-white fs-5">
            {type === "me" ? "You haven't posted any stories yet" : "No stories to show"}
          </p>
        </div>
      )}

      {!loading && !error && stories.length > 0 && (
        <>
          <h2 className="text-white mb-3 fs-4">{type === "me" ? "Your Stories" : "Stories"}</h2>
          <div
            className="d-flex overflow-x-auto pb-3"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              minHeight: '160px'
            }}
          >
            {stories.map(story => (
              <div
                key={story._id || `story-${Math.random()}`}
                className="flex-shrink-0 mx-2"
                style={{ width: '120px', scrollSnapAlign: 'start' }}
              >
                <Stories
                  post={story}
                  isUserPost={type === "me"}
                  onDelete={handleDelete}
                  onStoriesUpdate={handleUpdate}
                  isPreview={true}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Feedstories;

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { axiosInstance } from "../lib/axios";

const IMAGE_DISPLAY_MS = 5000;

export default function StoryViewer() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const { data } = await axiosInstance.get(`/stories/${storyId}`);
        setStory(data.story);

        // Mark the story as viewed
        const viewResponse = await axiosInstance.put(`/stories/${storyId}/view`);
        setStory(prev => ({
          ...prev,
          viewCount: viewResponse.data.viewCount,
          viewers: viewResponse.data.viewers,
        }));

        // Fetch user profile
        const { data: userData } = await axiosInstance.get(
          `/users/getUserById/${data.story.userId}`
        );
        setUser(userData.user);
      } catch (err) {
        console.error(err);
        navigate(-1);
      }
    };

    fetchStory();
  }, [storyId, navigate]);

  useEffect(() => {
    if (!story || story.type === "video") return;

    setProgress(0);
    const step = 100 / (IMAGE_DISPLAY_MS / 100);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          clearInterval(id);
          navigate(-1);
        }
        return p + step;
      });
    }, 100);
    return () => clearInterval(id);
  }, [story, navigate]);

  const handleVideoProgress = (e) => {
    if (!e.target.duration) return;
    const percent = (e.target.currentTime / e.target.duration) * 100;
    setProgress(percent);
    if (percent >= 99) navigate(-1);
  };

  const handleTap = (e) => {
    e.stopPropagation();
    navigate(-1);
  };

  if (!story) return null;

  const renderMedia = () => {
    if (story.type === "image")
      return (
        <img
          src={story.media}
          alt={story.caption || "story"}
          className="w-100 h-100 object-fit-cover"
        />
      );

    if (story.type === "video")
      return (
        <video
          className="w-100 h-100"
          autoPlay
          muted
          onTimeUpdate={handleVideoProgress}
        >
          <source src={story.media} type="video/mp4" />
        </video>
      );

    if (story.type === "text")
      return (
        <div
          className="w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background:
              "linear-gradient(45deg,#405de6,#5851db,#833ab4,#c13584)",
          }}
        >
          <h2 className="text-white px-3 text-center">{story.content}</h2>
        </div>
      );

    return null;
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-black"
      style={{ zIndex: 1050 }}
      onClick={handleTap}
    >
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{ height: "3px", background: "rgba(255,255,255,0.3)" }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#fff",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      <div className="position-absolute top-0 start-0 p-3 d-flex align-items-center gap-2">
        <img
          src={user?.profilePicture || "https://via.placeholder.com/40"}
          alt="profile"
          className="rounded-circle"
          style={{ width: "32px", height: "32px", objectFit: "cover" }}
        />
        <span className="text-white fw-semibold">
          {user?.username || user?.firstName || user?.lastName || "Unknown"}
        </span>
        <span className="text-white-50 small">
          {moment(story.createdAt).fromNow()}
        </span>
      </div>

      <button
        className="btn btn-sm btn-light position-absolute top-0 end-0 m-3"
        onClick={(e) => {
          e.stopPropagation();
          navigate(-1);
        }}
      >
        ✕
      </button>

      <div className="w-100 h-100 d-flex align-items-center justify-content-center">
        {renderMedia()}
      </div>

      {story.caption && (
        <div
          className="position-absolute bottom-0 start-0 w-100 text-white p-3"
          style={{
            background:
              "linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 80%)",
          }}
        >
          {story.caption}
        </div>
      )}

      {story.viewCount > 0 && (
        <div className="position-absolute bottom-0 start-0 p-3 text-white-50 small">
          Viewed by {story.viewCount} {story.viewCount === 1 ? 'person' : 'people'}
        </div>
      )}
    </div>
  );
}
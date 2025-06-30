import { useEffect, useRef, useState } from "react";
import Stories from "./Stories";

/**
 * Full-screen story viewer with auto-advance.
 * - stories: array of story objects
 * - startIndex: index of the story that was clicked
 * - onClose: called when viewer should close
 */
const StoryCarousel = ({ stories, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const timerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false); // Pause auto-advance on user interaction

  // Validate inputs
  useEffect(() => {
    if (!stories || !Array.isArray(stories) || stories.length === 0) {
      console.error("StoryCarousel: Invalid or empty stories array");
      onClose();
    }
    if (startIndex < 0 || startIndex >= stories.length) {
      console.error("StoryCarousel: Invalid startIndex", startIndex);
      setIdx(0);
    }
  }, [stories, startIndex, onClose]);

  // Schedule auto-advance
  const scheduleNext = useCallback(() => {
    if (isPaused) return; // Skip if paused

    clearTimeout(timerRef.current);

    const current = stories[idx];
    const isVideo = current?.type === "video";
    const delay = isVideo ? 10000 : 5000; // 10s for videos, 5s for images/text

    timerRef.current = setTimeout(() => {
      if (idx < stories.length - 1) {
        setIdx((i) => i + 1);
      } else {
        onClose();
      }
    }, delay);
  }, [idx, stories, onClose, isPaused]);

  // Run scheduleNext when idx or isPaused changes
  useEffect(() => {
    scheduleNext();
    return () => clearTimeout(timerRef.current); // Cleanup on unmount or idx change
  }, [scheduleNext]);

  // Manual navigation
  const prev = () => {
    if (idx > 0) {
      setIsPaused(true); // Pause auto-advance
      setIdx((i) => i - 1);
      setTimeout(() => setIsPaused(false), 1000); // Resume after 1s
    }
  };

  const next = () => {
    if (idx < stories.length - 1) {
      setIsPaused(true);
      setIdx((i) => i + 1);
      setTimeout(() => setIsPaused(false), 1000);
    } else {
      onClose();
    }
  };

  // Pause on hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const cur = stories[idx];
  if (!cur) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0,0,0,0.88)", zIndex: 1055 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close button */}
      <button
        className="btn btn-light position-absolute"
        style={{ top: 18, right: 20 }}
        onClick={onClose}
      >
        ✕
      </button>

      {/* Prev/Next arrows */}
      {idx > 0 && (
        <button
          className="btn btn-light position-absolute"
          style={{ left: 10, top: "50%", transform: "translateY(-50%)" }}
          onClick={prev}
        >
          ‹
        </button>
      )}
      {idx < stories.length - 1 && (
        <button
          className="btn btn-light position-absolute"
          style={{ right: 10, top: "50%", transform: "translateY(-50%)" }}
          onClick={next}
        >
          ›
        </button>
      )}

      {/* Progress bar */}
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{ height: "4px", background: "rgba(255,255,255,0.3)" }}
      >
        <div
          className="h-100"
          style={{
            width: `${((idx + 1) / stories.length) * 100}%`,
            background: "#fff",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Story card */}
      <div
        className="bg-dark text-white rounded shadow-lg"
        style={{
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        <Stories
          post={cur}
          isPreview={false}
          onVideoEnded={next} // Trigger next when video ends
        />
      </div>
    </div>
  );
};

export default StoryCarousel;
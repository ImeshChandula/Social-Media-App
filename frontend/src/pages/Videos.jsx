import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios"; 

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Live", "Music", "News", "Technology"];

  useEffect(() => {
    const fetchMyVideos = async () => {
      try {
        const res = await axiosInstance.get("/posts/my-videos", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data && Array.isArray(res.data.posts)) {
          setVideos(res.data.posts);
        } else {
          console.error("Unexpected response:", res.data);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      }
    };

    fetchMyVideos();
  }, []);

  const filteredVideos = videos
    .filter((video) =>
      selectedCategory === "All" ? true : video.category === selectedCategory
    )
    .filter((video) =>
      video.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Videos</h2>

      {/* Search and Filter */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "5px",
          }}
        />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              margin: "5px",
              padding: "8px 15px",
              borderRadius: "20px",
              backgroundColor:
                selectedCategory === cat ? "#007bff" : "#e0e0e0",
              color: selectedCategory === cat ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div
              key={video._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <video
                width="100%"
                height="200"
                controls
                style={{ borderRadius: "8px", objectFit: "cover" }}
              >
                <source
                  src={
                    video.videoUrl.startsWith("http")
                      ? video.videoUrl
                      : `${import.meta.env.VITE_APP_API_URL}${video.videoUrl}`
                  }
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
              <h4>{video.title || "Untitled Video"}</h4>
              <p style={{ fontSize: "14px", color: "#666" }}>
                {video.views || 0} views · {video.time || "unknown"}
              </p>
            </div>
          ))
        ) : (
          <p>No videos found.</p>
        )}
      </div>
    </div>
  );
};

export default Videos;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';

const Videos = () => {
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ["For You", "Live", "Music", "News", "Technology"];

  const allVideos = [
    { title: "Full Body Workout", views: "1.2M views", time: "2 weeks ago", category: "For You" },
    { title: "Morning Yoga Routine", views: "900K views", time: "1 week ago", category: "For You" },
    { title: "Home Cardio Blast", views: "800K views", time: "5 days ago", category: "For You" },
    { title: "Evening Stretching", views: "1M views", time: "3 weeks ago", category: "For You" },
    { title: "Quick Fitness Tips", views: "1.5M views", time: "1 month ago", category: "For You" },
    { title: "Top 10 Workouts", views: "2M views", time: "2 months ago", category: "For You" },
    { title: "Live Concert Highlights", views: "500K views", time: "1 week ago", category: "Live" },
    { title: "Top Music Hits 2025", views: "3M views", time: "3 days ago", category: "Music" },
    { title: "Breaking News Update", views: "900K views", time: "1 day ago", category: "News" },
    { title: "Latest Tech Trends", views: "2M views", time: "5 days ago", category: "Technology" },
  ];

  const filteredVideos = allVideos.filter(
    (video) =>
      video.category === selectedCategory &&
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      {/* Top: Title and Search */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fs-2 mb-0">Videos</h2>
        <input
          type="text"
          placeholder="Search Videos"
          className="form-control"
          style={{
            width: "300px",
            height: "45px",
            borderRadius: "25px",
            fontSize: "16px",
            backgroundColor: "#f1f1f1",
            color: "#000",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="d-flex mb-4 gap-3 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`btn ${selectedCategory === cat ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ borderRadius: "25px", fontSize: "16px", padding: "8px 20px" }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Section */}
      <div className="row">
        {/* Left Sidebar */}
        <div className="col-md-3 mb-4">
          <div
            style={{
              backgroundColor: "#6A6A6AFF",
              borderRadius: "12px",
              padding: "20px",
              minHeight: "300px",
            }}
          >
            <h5 className="mb-4 text-dark">Your Videos</h5>
            <ul className="list-unstyled fs-6">
              <li className="mb-3">📌 Watch Later</li>
              <li className="mb-3">💾 Saved Videos</li>
              <li className="mb-3">❤️ Liked Videos</li>
            </ul>
          </div>
        </div>

        {/* Right Side - Videos */}
        <div className="col-md-9">
          <div className="row">
            <AnimatePresence>
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video, idx) => (
                  <motion.div
                    key={idx}
                    className="col-md-6 col-lg-4 mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="bg-success rounded position-relative" style={{ minHeight: "220px" }}>
                      <div
  className="text-dark p-3 rounded-bottom"
  style={{
    position: "absolute",
    bottom: "0",
    width: "100%",
    backgroundColor: "#d6d6d6"
  }}
>
  <p className="mb-1 fw-bold">{video.title}</p>
  <small>{video.views} • {video.time}</small>
</div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="fs-5 text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No videos found for "{selectedCategory}"
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;

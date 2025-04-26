import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Videos = () => {
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ["For You", "Live", "Music", "News", "Technology"];

  const allVideos = [
    // 6 Videos for 'For You'
    { title: "Full Body Workout", views: "1.2M views", time: "2 weeks ago", category: "For You" },
    { title: "Morning Yoga Routine", views: "900K views", time: "1 week ago", category: "For You" },
    { title: "Home Cardio Blast", views: "800K views", time: "5 days ago", category: "For You" },
    { title: "Evening Stretching", views: "1M views", time: "3 weeks ago", category: "For You" },
    { title: "Quick Fitness Tips", views: "1.5M views", time: "1 month ago", category: "For You" },
    { title: "Top 10 Workouts", views: "2M views", time: "2 months ago", category: "For You" },

    // Other categories
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
    <div className="container">
      <h2 className="mb-4 fs-1">Videos</h2>

      {/* Search Bar */}
      <div className="d-flex justify-content-end mb-4">
        <input
          type="text"
          placeholder="Search Videos"
          className="form-control"
          style={{
            width: "300px",
            height: "50px",
            borderRadius: "25px",
            fontSize: "18px",
            backgroundColor: "#f1f1f1",
            color: "#000",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="d-flex mb-5 gap-3 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`btn ${selectedCategory === cat ? 'btn-success' : 'btn-secondary'}`}
            style={{ borderRadius: "25px", fontSize: "18px", padding: "10px 20px" }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="row">
        {/* Left Side: Your Videos */}
        <div className="col-md-3 mb-4">
          <div className="p-4 bg-secondary rounded" style={{ minHeight: "300px" }}>
            <h4 className="mb-4">Your Videos</h4>
            <ul className="list-unstyled fs-5">
              <li className="mb-3">Watch Later</li>
              <li className="mb-3">Saved Videos</li>
              <li className="mb-3">Liked Videos</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Video Cards */}
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
                      <div className="bg-dark text-white p-3 rounded-bottom" style={{ position: "absolute", bottom: "0", width: "100%" }}>
                        <p className="mb-1 fw-bold">{video.title}</p>
                        <small>{video.views} • {video.time}</small>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.p
                  className="fs-4"
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

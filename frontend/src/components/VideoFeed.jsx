import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoCard from './VideoCard';

const VideoFeed = ({ videos, selectedCategory }) => {
  if (!videos.length) {
    return (
      <motion.p
        className="fs-5 text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No videos found for "{selectedCategory}"
      </motion.p>
    );
  }

  return (
    <div className="row">
      <AnimatePresence>
        {videos.map((video, idx) => (
          <motion.div
            key={idx}
            className="col-md-6 col-lg-4 mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <VideoCard video={video} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default VideoFeed;

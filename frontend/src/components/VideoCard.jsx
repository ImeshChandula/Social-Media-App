import React from 'react';

const VideoCard = ({ video }) => {
  return (
    <div
      className="position-relative rounded overflow-hidden"
      style={{ minHeight: "220px", backgroundColor: "#000" }}
    >
      {video.mediaUrl ? (
        <video
          src={video.mediaUrl}
          controls
          style={{ width: "100%", height: "220px", objectFit: "cover" }}
        />
      ) : (
        <div className="text-white d-flex align-items-center justify-content-center" style={{ height: "220px" }}>
          <p>No Video Available</p>
        </div>
      )}

      <div
        className="text-dark p-3 rounded-bottom"
        style={{ position: "absolute", bottom: "0", width: "100%", backgroundColor: "#d6d6d6" }}
      >
        <p className="mb-1 fw-bold">{video.title || 'Untitled Video'}</p>
        <small>{video.views || 0} views • {video.time || 'Unknown time'}</small>
      </div>
    </div>
  );
};

export default VideoCard;

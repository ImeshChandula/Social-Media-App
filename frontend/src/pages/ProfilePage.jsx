import React from "react";
import { motion } from "framer-motion";

function ProfilePage() {
  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-2 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="position-relative mb-5">
        {/* Cover Image */}
        <motion.img
          src="https://placehold.co/1000x200"
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
        />

        {/* Profile Picture */}
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="profile-pic-animate rounded-circle border border-white shadow"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* Name and Buttons */}
      <motion.div
        className="mt-5 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <h4 className="fw-bold">Shen Fernando</h4>
        <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
          <motion.button
            className="btn btn-success"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Edit Profile
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Story
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="row mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="col-4 col-md-2 offset-md-3">
          <div><strong>1234</strong></div>
          <div>Friends</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>468</strong></div>
          <div>Photos</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>15</strong></div>
          <div>Videos</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProfilePage;

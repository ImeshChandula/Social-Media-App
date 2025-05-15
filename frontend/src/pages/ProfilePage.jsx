import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { axiosInstance } from "../lib/axios";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosInstance.get('/users/myProfile');
        setProfile(res.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-5">Profile not found</div>;
  }
  
  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-5 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="position-relative mb-5">
        {/* Cover Image */}
        <motion.img
          src={profile.coverPic}
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
        />

        {/* Profile Picture */}
        <img
          src={profile.profilePic}
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
        <h4 className="fw-bold">{profile.firstName} {profile.firstName}</h4>
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
          <div><strong>{profile.friendsCount}</strong></div>
          <div>Friends</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>{profile.photosCount}</strong></div>
          <div>Photos</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>{profile.videosCount}</strong></div>
          <div>Videos</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProfilePage;

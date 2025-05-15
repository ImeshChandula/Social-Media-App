import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data); // Depending on backend response structure
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile. Please login.");
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-2 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Cover Image */}
          <div className="position-relative mb-5">
            <motion.img
              src={user?.coverPhoto ||"https://placehold.co/1000x200"}
              alt="Cover"
              className="img-fluid w-100 rounded"
              style={{ objectFit: "cover", height: "200px" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
            />

            {/* Profile Picture */}
            <img
              src={user?.profilePicture || "https://randomuser.me/api/portraits/men/32.jpg"}
              alt="Profile"
              className="rounded-circle border border-white shadow"
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
            <h4 className="fw-bold">{user?.firstName || "User Name"}</h4>
            <p className="text-white-50">{user.email}</p>
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

          {/* Stats (can be real data if available) */}
          <motion.div
            className="row mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="col-4 col-md-2 offset-md-3">
              <div><strong>{user?.friends?.length || 0}</strong></div>
              <div>Friends</div>
            </div>
            <div className="col-4 col-md-2">
              <div><strong>{user?.photosCount || 0}</strong></div>
              <div>Photos</div>
            </div>
            <div className="col-4 col-md-2">
              <div><strong>{user?.videosCount || 0}</strong></div>
              <div>Videos</div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default ProfilePage;

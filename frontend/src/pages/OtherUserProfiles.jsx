import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Flag, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import OtherUserPosts from "../components/OtherUserPosts";
import EnhancedUserStats from "../components/EnhancedUserStats";
import EnhancedBioSection from "../components/EnhancedBioSection";
import FriendActionButton from "../components/FriendActionButton";
import UserInPrivateStatus from "../components/UserInPrivateStatus";
import ReportProfileModal from "../components/ReportProfileModal";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";

const OtherUserProfiles = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore(); // Extract authUser from the store
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const fetchData = async () => {
      await fetchStatus();
      await fetchUser();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`/users/getUserById/${id}`);
      const fetchedUser = res.data.user || res.data;
      setUser(fetchedUser);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axiosInstance.get(`/friends/friend-status/${id}`);
      if (res.data.success) {
        setFriendStatus(res.data.data.friendStatus);
      }
    } catch (err) {
      console.log("Error: " + err);
      toast.error("Failed to get friend status");
    }
  };

  if (loading) {
    return (
      <p className="text-secondary text-center mt-5 normal-loading-spinner">
        Loading user profile<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </p>
    );
  }

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!user) return <p className="text-secondary-50 text-center mt-5">User not found.</p>;

  // Helper function to determine if content should be shown
  const shouldShowContent = () => {
    if (user.isPublic === true) return true;
    if (user.isPublic === false && friendStatus === "friend") return true;
    return false;
  };

  // Check if this is the current user's own profile
  const isOwnProfile = authUser?.id === id;

  return (
    <motion.div
      className="text-center py-5 py-md-0 mt-5 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Cover Photo & Profile Picture */}
      <div className="position-relative mb-5 pt-3 mt-1 mt-md-0">
        <motion.img
          src={user.coverPhoto}
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
        />
        <motion.img
          src={user.profilePicture}
          alt="Profile"
          className={`rounded-circle border shadow profile-pic-animate ${isDarkMode ? "border-white" : "border-black"}`}
          whileHover={{ scale: 1.05 }}
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

      {/* User Info */}
      <motion.div
        className="mt-5 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className={`fw-bold ${isDarkMode ? "text-white" : "text-black"}`}>
          {user.firstName || user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unnamed User"}
        </h4>
        <p className="text-secondary">@{user.username}</p>

        <div className="d-flex justify-content-center align-items-center gap-3">
          <FriendActionButton userId={id} />

          {/* Options Menu - Only show for other users, not own profile */}
          {!isOwnProfile && (
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition
        ${isDarkMode
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-black/5 border-black/10 text-black hover:bg-black/10"}`}
              >
                <MoreVertical size={20} />
              </button>

              {showOptionsMenu && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 
          ${isDarkMode
                      ? "bg-neutral-900 border border-neutral-700"
                      : "bg-white border border-gray-200"}`}
                >
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setShowOptionsMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-2 rounded-md transition
            ${isDarkMode
                        ? "text-red-400 hover:bg-neutral-800"
                        : "text-red-600 hover:bg-gray-100"}`}
                  >
                    <Flag size={16} />
                    Report Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <EnhancedUserStats user={user} />

      {shouldShowContent() ? (
        <>
          {/* Bio */}
          <EnhancedBioSection user={user} />

          {/* Posts */}
          <div className="mt-3">
            <OtherUserPosts userId={user._id || id} />
          </div>
        </>
      ) : (
        <>
          {/* Private */}
          <UserInPrivateStatus />
        </>
      )}

      {/* Report Profile Modal */}
      <ReportProfileModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={id}
        userName={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
      />

      {/* Click outside to close options menu */}
      {showOptionsMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowOptionsMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default OtherUserProfiles;
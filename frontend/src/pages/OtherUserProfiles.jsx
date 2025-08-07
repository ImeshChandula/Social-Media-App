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

const OtherUserProfiles = () => {
  const { id } = useParams();
  const { authUser } = useAuthStore(); // Extract authUser from the store
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

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
      <p className="text-white-50 text-center mt-5 normal-loading-spinner">
        Loading user profile<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </p>
    );
  }

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!user) return <p className="text-white-50 text-center mt-5">User not found.</p>;

  // Helper function to determine if content should be shown
  const shouldShowContent = () => {
    if (user.isPublic === true) return true;
    if (user.isPublic === false && friendStatus === "friend") return true;
    return false;
  };

  // Check if this is the current user's own profile
  const isOwnProfile = authUser?.id === id;

  const optionsMenuStyles = {
    container: {
      position: 'relative',
      display: 'inline-block'
    },
    button: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      transition: 'all 0.2s ease'
    },
    menu: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#1f1f1f',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '8px 0',
      minWidth: '180px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      marginTop: '4px'
    },
    menuItem: {
      padding: '12px 16px',
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left'
    },
    menuItemHover: {
      backgroundColor: '#333'
    },
    reportItem: {
      color: '#ef4444'
    }
  };

  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-5 mt-md-0"
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
          className="rounded-circle border border-white shadow profile-pic-animate"
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
        <h4 className="fw-bold text-white">
          {user.firstName || user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unnamed User"}
        </h4>
        <p className="text-white-50">@{user.username}</p>

        <div className="d-flex justify-content-center align-items-center gap-3">
          <FriendActionButton userId={id} />

          {/* Options Menu - Only show for other users, not own profile */}
          {!isOwnProfile && (
            <div style={optionsMenuStyles.container}>
              <button
                style={optionsMenuStyles.button}
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <MoreVertical size={20} />
              </button>
              
              {showOptionsMenu && (
                <div style={optionsMenuStyles.menu}>
                  <button
                    style={{...optionsMenuStyles.menuItem, ...optionsMenuStyles.reportItem}}
                    onClick={() => {
                      setShowReportModal(true);
                      setShowOptionsMenu(false);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
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
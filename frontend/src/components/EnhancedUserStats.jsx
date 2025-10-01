// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import styles from '../styles/UserStatesStyles';
import useThemeStore from "../store/themeStore";

const EnhancedUserStats = ({ user, isOwnProfile }) => {
  const { isDarkMode } = useThemeStore();

  return (
    <motion.div
      style={styles.statsContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div style={styles.statBox} className={`${isDarkMode ? "" : "border border-black"}`}>
        <div style={styles.statNumber} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user?.friendsCount || 0}</div>
        <div style={styles.statLabel} className={`${isDarkMode ? "text-white" : "text-black"}`}>Friends</div>
      </div>

      {/* Show only for own profile */}
      {isOwnProfile && (
        <div style={styles.statBox} className={`${isDarkMode ? "" : "border border-black"}`}>
          <div style={styles.statNumber} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user?.friendRequestCount || 0}</div>
          <div style={styles.statLabel} className={`${isDarkMode ? "text-white" : "text-black"}`}>Friend Requests</div>
        </div>
      )}

      <div style={styles.statBox} className={`${isDarkMode ? "" : "border border-black"}`}>
        <div style={styles.statNumber} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user?.postsCount || 0}</div>
        <div style={styles.statLabel} className={`${isDarkMode ? "text-white" : "text-black"}`}>Posts</div>
      </div>
    </motion.div>
  );
};

export default EnhancedUserStats;
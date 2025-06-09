// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import styles from '../styles/UserStatesStyles';

const EnhancedUserStats = ({ user, isOwnProfile }) => {
  return (
    <motion.div
      style={styles.statsContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div style={styles.statBox}>
        <div style={styles.statNumber}>{user?.friendsCount || 0}</div>
        <div style={styles.statLabel}>Friends</div>
      </div>

      {/* Show only for own profile */}
      {isOwnProfile && (
        <div style={styles.statBox}>
          <div style={styles.statNumber}>{user?.friendRequestCount || 0}</div>
          <div style={styles.statLabel}>Friend Requests</div>
        </div>
      )}

      <div style={styles.statBox}>
        <div style={styles.statNumber}>{user?.postsCount || 0}</div>
        <div style={styles.statLabel}>Posts</div>
      </div>
    </motion.div>
  );
};

export default EnhancedUserStats;
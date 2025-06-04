/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Shield, Info } from 'lucide-react';
import styles from '../styles/BioSectionStyles';

const EnhancedBioSection  = ({ user }) => {
  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <div style={styles.topRightCircle} />

      <motion.div
        style={styles.header}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div style={styles.iconBox}>
          <User size={20} color="white" />
        </div>
        <h5 style={styles.title}>About Me</h5>
      </motion.div>

      <div style={styles.grid}>
        {user?.bio && (
          <motion.div
            style={styles.fullColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div style={{ ...styles.infoCard, borderLeft: '4px solid #667eea' }}>
              <div style={styles.rowStart}>
                <Info size={18} color="white" style={styles.iconSpacing} />
                <div>
                  <h6 style={styles.cardTitle}>Bio</h6>
                  <p style={styles.cardText}>{user.bio}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {user?.location && (
          <motion.div
            style={styles.halfColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
          >
            <div style={{ ...styles.infoCard, borderLeft: '4px solid #f093fb' }}>
              <div style={styles.rowCenter}>
                <MapPin size={18} color="white" style={styles.iconSpacing} />
                <div>
                  <h6 style={styles.cardTitle}>Location</h6>
                  <p style={styles.cardText}>{user.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {user?.birthday && (
          <motion.div
            style={styles.halfColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <div style={{ ...styles.infoCard, borderLeft: '4px solid #a8edea' }}>
              <div style={styles.rowCenter}>
                <Calendar size={18} color="white" style={styles.iconSpacing} />
                <div>
                  <h6 style={styles.cardTitle}>Birthday</h6>
                  <p style={styles.cardText}>
                    {new Date(user.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {user?.accountStatus && (
          <motion.div
            style={styles.fullColumn}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <div
              style={{
                ...styles.infoCard,
                borderLeft:
                  user.accountStatus === 'active'
                    ? '4px solid #4facfe'
                    : '4px solid #ffa726'
              }}
            >
              <div style={styles.rowBetween}>
                <div style={styles.rowCenter}>
                  <Shield size={18} color="white" style={styles.iconSpacing} />
                  <div>
                    <h6 style={styles.cardTitle}>Account Status</h6>
                    <p style={styles.cardText}>{user.accountStatus}</p>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      user.accountStatus === 'active'
                        ? 'rgba(76, 175, 255, 0.2)'
                        : 'rgba(255, 167, 38, 0.2)',
                    color:
                      user.accountStatus === 'active' ? '#4facfe' : '#ffa726',
                    borderColor:
                      user.accountStatus === 'active' ? '#4facfe' : '#ffa726'
                  }}
                >
                  {user.accountStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div style={styles.bottomLine} />
    </motion.div>
  )
}

export default EnhancedBioSection 
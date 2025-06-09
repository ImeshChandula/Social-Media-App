import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MapPin, Calendar, User, Shield, Info } from 'lucide-react';
import styles from '../styles/BioSectionStyles';

const EnhancedBioSection = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.container}>
      <div style={{ ...styles.toggleHeader, cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.iconBox}>
          <User size={20} color="white" />
        </div>
        <h5 style={styles.title} className='px-2'>About Me</h5>
        {isOpen ? <ChevronUp size={18} color="white" /> : <ChevronDown size={18} color="white" />}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="bio-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={styles.topRightCircle} />

            <div style={styles.grid}>
              {user?.bio && (
                <motion.div
                  style={styles.fullColumn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
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
                  transition={{ delay: 0.3, duration: 0.5 }}
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
                  transition={{ delay: 0.4, duration: 0.5 }}
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
                  transition={{ delay: 0.5, duration: 0.5 }}
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedBioSection;

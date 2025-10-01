import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MapPin, Calendar, User, Shield, Info, Briefcase, Eye, EyeOff } from 'lucide-react';
import styles from '../styles/BioSectionStyles';
import useThemeStore from "../store/themeStore";


const EnhancedBioSection = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode } = useThemeStore();


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      style={styles.container}>
      <div style={{ ...styles.toggleHeader, cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.iconBox}>
          <User size={20} color="white" />
        </div>
        <h5 style={styles.title} className={`px-2 ${isDarkMode ? "text-white" : "text-black"}`}>About Me</h5>
        {isOpen ? <ChevronUp size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} /> : <ChevronDown size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} />}
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
                      <Info size={18} style={styles.iconSpacing} className={`${isDarkMode ? "text-white" : "text-black"}`} />
                      <div>
                        <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Bio</h6>
                        <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.bio}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {user?.jobCategory && (
                <motion.div
                  style={styles.fullColumn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                >
                  <div style={{ ...styles.infoCard, borderLeft: '4px solid #00d4aa' }}>
                    <div style={styles.rowBetween}>
                      <div style={styles.rowCenter}>
                        <Briefcase size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                        <div>
                          <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Job Category</h6>
                          <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>
                            {typeof user.jobCategory === 'object'
                              ? user.jobCategory.name
                              : user.jobCategory
                            }
                          </p>
                          {typeof user.jobCategory === 'object' && user.jobCategory.description && (
                            <p style={{ ...styles.cardText, fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                              {user.jobCategory.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: 'rgba(0, 212, 170, 0.2)',
                          color: '#00d4aa',
                          borderColor: '#00d4aa'
                        }}
                      >
                        PROFESSIONAL
                      </span>
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
                      <MapPin size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                      <div>
                        <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Location</h6>
                        <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.location}</p>
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
                      <Calendar size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                      <div>
                        <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Birthday</h6>
                        <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>
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
                  style={styles.halfColumn}
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
                        <Shield size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                        <div>
                          <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Account Status</h6>
                          <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>{user.accountStatus}</p>
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

              {user && typeof user.isPublic === 'boolean' && (
                <motion.div
                  style={styles.halfColumn}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                >
                  <div
                    style={{
                      ...styles.infoCard,
                      borderLeft: user.isPublic
                        ? '4px solid #ff6b6b'
                        : '4px solid #51cf66'
                    }}
                  >
                    <div style={styles.rowBetween}>
                      <div style={styles.rowCenter}>
                        {user.isPublic ? (
                          <Eye size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                        ) : (
                          <EyeOff size={18} className={`${isDarkMode ? "text-white" : "text-black"}`} style={styles.iconSpacing} />
                        )}
                        <div>
                          <h6 style={styles.cardTitle} className={`${isDarkMode ? "text-white" : "text-black"}`}>Privacy</h6>
                          <p style={styles.cardText} className={`${isDarkMode ? "text-white" : "text-black"}`}>
                            {user.isPublic ? 'Public Profile' : 'Private Profile'}
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: user.isPublic
                            ? 'rgba(255, 107, 107, 0.2)'
                            : 'rgba(81, 207, 102, 0.2)',
                          color: user.isPublic ? '#ff6b6b' : '#51cf66',
                          borderColor: user.isPublic ? '#ff6b6b' : '#51cf66'
                        }}
                      >
                        {user.isPublic ? 'PUBLIC' : 'PRIVATE'}
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
    </motion.div>
  );
};

export default EnhancedBioSection;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

// Theme & Styles (adapted from ActivityLogDashboard)
const theme = {
  colors: {
    primary: "#4f46e5",
    secondary: "#059669",
    danger: "#dc2626",
    warning: "#d97706",
    info: "#0ea5e9",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    background: "#f9fafb",
    cardBg: "#ffffff",
    disabled: "#d1d5db",
    disabledText: "#9ca3af",
    light: "#f3f4f6",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Inter', sans-serif",
};

const styles = {
  container: {
    fontFamily: theme.fontFamily,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: theme.spacing.xl,
  },
  header: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: "700",
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing.xl} ${theme.spacing.md}`,
    color: theme.colors.textSecondary,
  },
  controlsRow: {
    display: "flex",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: "10px 12px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "8px",
    fontSize: "0.875rem",
    minWidth: "200px",
  },
  select: {
    padding: "10px 12px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "8px",
    fontSize: "0.875rem",
    backgroundColor: theme.colors.cardBg,
    minWidth: "150px",
  },
  button: {
    base: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: "white",
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: "white",
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: "white",
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: "white",
    },
    info: {
      backgroundColor: theme.colors.info,
      color: "white",
    },
  },
  statsContainer: {
    display: "flex",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexWrap: "wrap",
  },
  statCard: (variant) => {
    let bgColor, borderColor, textColor;
    switch (variant) {
      case 'primary':
        bgColor = 'rgba(79,70,229,0.1)';
        borderColor = 'rgba(79,70,229,0.25)';
        textColor = theme.colors.primary;
        break;
      case 'success':
        bgColor = 'rgba(5,150,105,0.1)';
        borderColor = 'rgba(5,150,105,0.25)';
        textColor = theme.colors.secondary;
        break;
      case 'warning':
        bgColor = 'rgba(217,119,6,0.1)';
        borderColor = 'rgba(217,119,6,0.25)';
        textColor = theme.colors.warning;
        break;
      case 'info':
        bgColor = 'rgba(14,165,233,0.1)';
        borderColor = 'rgba(14,165,233,0.25)';
        textColor = theme.colors.info;
        break;
      case 'danger':
        bgColor = 'rgba(220,38,38,0.1)';
        borderColor = 'rgba(220,38,38,0.25)';
        textColor = theme.colors.danger;
        break;
      default:
        bgColor = theme.colors.light;
        borderColor = theme.colors.border;
        textColor = theme.colors.text;
    }
    return {
      flex: "1 1 150px",
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: theme.borderRadius,
      padding: theme.spacing.md,
      textAlign: "center",
    };
  },
  statNumber: (variant) => ({
    color: styles.statCard(variant).textColor || theme.colors.text,
    fontSize: "1.5rem",
    marginBottom: theme.spacing.xs,
    fontWeight: "bold",
  }),
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: "0.875rem",
    margin: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
  },
  thead: {
    borderBottom: `2px solid ${theme.colors.border}`,
  },
  th: {
    padding: theme.spacing.md,
    textAlign: "left",
    fontWeight: "600",
  },
  td: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    verticalAlign: "top",
  },
  tdActions: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    textAlign: "right",
  },
  badge: (variant) => {
    let bgColor, textColor;
    switch (variant) {
      case 'success':
        bgColor = theme.colors.secondary;
        textColor = 'white';
        break;
      case 'warning':
        bgColor = theme.colors.warning;
        textColor = 'white';
        break;
      case 'info':
        bgColor = theme.colors.info;
        textColor = 'white';
        break;
      case 'danger':
        bgColor = theme.colors.danger;
        textColor = 'white';
        break;
      default:
        bgColor = theme.colors.disabled;
        textColor = theme.colors.disabledText;
    }
    return {
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: bgColor,
      color: textColor,
    };
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    fontSize: "0.875rem",
    color: theme.colors.textSecondary,
  },
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1050,
  },
  modalDialog: (size) => ({
    maxWidth: size === 'lg' ? "50rem" : "32rem",
    width: "100%",
  }),
  modalContent: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
  },
  modalHeader: {
    padding: theme.spacing.md,
    borderBottom: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: theme.colors.textSecondary,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalFooter: {
    padding: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.border}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing.sm,
  },
  row: {
    display: "flex",
    gap: theme.spacing.lg,
    flexWrap: "wrap",
  },
  col: {
    flex: "1 1 45%",
  },
  infoCard: {
    backgroundColor: theme.colors.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius,
  },
  alert: (variant) => ({
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius,
    marginBottom: theme.spacing.md,
    backgroundColor: variant === 'warning' ? 'rgba(217,119,6,0.1)' : theme.colors.light,
    border: `1px solid ${variant === 'warning' ? 'rgba(217,119,6,0.25)' : theme.colors.border}`,
  }),
  textarea: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "8px",
    backgroundColor: theme.colors.light,
    minHeight: "100px",
  },
};

// Components
const Button = ({ variant = "primary", onClick, disabled, children, small }) => (
  <button
    style={{
      ...styles.button.base,
      ...styles.button[variant],
      ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
      ...(small ? { padding: "6px 12px", fontSize: "0.75rem" } : {}),
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const Badge = ({ variant, children }) => (
  <span style={styles.badge(variant)}>{children}</span>
);

const Card = ({ children }) => (
  <div style={styles.card}>
    {children}
  </div>
);

// Page Details Modal Component
const PageDetailsModal = ({ show, onClose, pageId }) => {
  const [pageDetails, setPageDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && pageId) {
      fetchPageDetails();
    }
  }, [show, pageId]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/admin/${pageId}`);
      if (res.data.success) {
        setPageDetails(res.data.page);
      }
    } catch (error) {
      console.error('Error fetching page details:', error);
      toast.error('Failed to load page details');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.modalBackdrop}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={styles.modalDialog('lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h5 style={styles.modalTitle}>Page Details</h5>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>
          <div style={styles.modalBody}>
            {loading ? (
              <div style={styles.emptyState}>Loading page details...</div>
            ) : pageDetails ? (
              <div style={styles.row}>
                <div style={styles.col}>
                  <div style={styles.infoCard}>
                    <h6 style={{ color: theme.colors.primary, marginBottom: theme.spacing.md }}>Basic Information</h6>
                    <div style={{ marginBottom: theme.spacing.md }}>
                      <small style={{ color: theme.colors.textSecondary }}>Page Name</small>
                      <p style={{ fontWeight: "bold" }}>{pageDetails.pageName}</p>
                    </div>
                    {pageDetails.username && (
                      <div style={{ marginBottom: theme.spacing.md }}>
                        <small style={{ color: theme.colors.textSecondary }}>Username</small>
                        <p>{pageDetails.username}</p>
                      </div>
                    )}
                    <div style={{ marginBottom: theme.spacing.md }}>
                      <small style={{ color: theme.colors.textSecondary }}>Category</small>
                      <p>{pageDetails.category?.charAt(0).toUpperCase() + pageDetails.category?.slice(1)}</p>
                    </div>
                    {pageDetails.description && (
                      <div style={{ marginBottom: theme.spacing.md }}>
                        <small style={{ color: theme.colors.textSecondary }}>Description</small>
                        <p>{pageDetails.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.col}>
                  <div style={styles.infoCard}>
                    <h6 style={{ color: theme.colors.secondary, marginBottom: theme.spacing.md }}>Status & Metrics</h6>
                    <div style={styles.row}>
                      <div style={{ width: "50%" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: theme.colors.primary, fontSize: "1.5rem" }}>{pageDetails.followersCount || 0}</div>
                          <small style={{ color: theme.colors.textSecondary }}>Followers</small>
                        </div>
                      </div>
                      <div style={{ width: "50%" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ color: theme.colors.warning, fontSize: "1.5rem" }}>{pageDetails.postsCount || 0}</div>
                          <small style={{ color: theme.colors.textSecondary }}>Posts</small>
                        </div>
                      </div>
                    </div>
                    <hr style={{ margin: `${theme.spacing.md} 0`, borderColor: theme.colors.border }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                      {pageDetails.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                      {pageDetails.isBanned && (
                        <Badge variant="danger">Banned</Badge>
                      )}
                      {pageDetails.isVerified && (
                        <Badge variant="info">Verified</Badge>
                      )}
                      <Badge variant={pageDetails.approvalStatus === 'approved' ? 'success' : pageDetails.approvalStatus === 'pending' ? 'info' : pageDetails.approvalStatus === 'rejected' ? 'danger' : 'secondary'}>
                        {pageDetails.approvalStatus?.charAt(0).toUpperCase() + pageDetails.approvalStatus?.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <small style={{ color: theme.colors.textSecondary }}>Created</small>
                      <p>{new Date(pageDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
                {(pageDetails.phone || pageDetails.email || pageDetails.address) && (
                  <div style={{ width: "100%" }}>
                    <div style={styles.infoCard}>
                      <h6 style={{ color: theme.colors.warning, marginBottom: theme.spacing.md }}>Contact Information</h6>
                      <div style={styles.row}>
                        {pageDetails.phone && (
                          <div style={{ flex: "1" }}>
                            <small style={{ color: theme.colors.textSecondary }}>Phone</small>
                            <p>{pageDetails.phone}</p>
                          </div>
                        )}
                        {pageDetails.email && (
                          <div style={{ flex: "1" }}>
                            <small style={{ color: theme.colors.textSecondary }}>Email</small>
                            <p>{pageDetails.email}</p>
                          </div>
                        )}
                        {pageDetails.address && (
                          <div style={{ flex: "1" }}>
                            <small style={{ color: theme.colors.textSecondary }}>Address</small>
                            <p>{pageDetails.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {pageDetails.isBanned && (
                  <div style={{ width: "100%" }}>
                    <div style={{ ...styles.infoCard, backgroundColor: 'rgba(220,38,38,0.1)', border: `1px solid rgba(220,38,38,0.25)` }}>
                      <h6 style={{ color: theme.colors.danger, marginBottom: theme.spacing.md }}>Ban Information</h6>
                      <div style={styles.row}>
                        <div style={{ flex: "1" }}>
                          <small style={{ color: theme.colors.textSecondary }}>Ban Reason</small>
                          <p>{pageDetails.banReason || 'No reason provided'}</p>
                        </div>
                        <div style={{ flex: "1" }}>
                          <small style={{ color: theme.colors.textSecondary }}>Banned On</small>
                          <p>{pageDetails.bannedAt ? new Date(pageDetails.bannedAt).toLocaleDateString() : 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {pageDetails.owner && (
                  <div style={{ width: "100%" }}>
                    <div style={styles.infoCard}>
                      <h6 style={{ color: theme.colors.info, marginBottom: theme.spacing.md }}>Owner Information</h6>
                      <div style={styles.row}>
                        <div style={{ flex: "1" }}>
                          <small style={{ color: theme.colors.textSecondary }}>Name</small>
                          <p style={{ fontWeight: "bold" }}>{pageDetails.owner.firstName} {pageDetails.owner.lastName}</p>
                        </div>
                        <div style={{ flex: "1" }}>
                          <small style={{ color: theme.colors.textSecondary }}>Username</small>
                          <p>{pageDetails.owner.username}</p>
                        </div>
                        <div style={{ flex: "1" }}>
                          <small style={{ color: theme.colors.textSecondary }}>Email</small>
                          <p>{pageDetails.owner.email}</p>
                        </div>
                        {pageDetails.owner.phone && (
                          <div style={{ flex: "1" }}>
                            <small style={{ color: theme.colors.textSecondary }}>Phone</small>
                            <p>{pageDetails.owner.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.emptyState}>Failed to load page details</div>
            )}
          </div>
          <div style={styles.modalFooter}>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Ban Modal Component
const BanModal = ({ show, onClose, page, onBanToggle }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!page) return;

    const action = page.isBanned ? 'unban' : 'ban';
    
    if (action === 'ban' && !reason.trim()) {
      toast.error('Please provide a reason for banning this page');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(`/pages/admin/${page.id}/ban`, {
        banReason: reason.trim()
      });
      
      if (res.data.success) {
        toast.success(`Page ${action}ned successfully!`);
        onBanToggle(res.data.page);
        onClose();
        setReason('');
      }
    } catch (error) {
      console.error(`Error ${action}ning page:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} page`);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  const isBanning = !page.isBanned;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.modalBackdrop}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={styles.modalDialog()}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h5 style={styles.modalTitle}>{isBanning ? 'Ban Page' : 'Unban Page'}</h5>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.modalBody}>
              <div style={styles.alert('warning')}>
                <h6 style={{ color: theme.colors.warning, marginBottom: theme.spacing.sm }}>
                  {isBanning ? 'Ban Page Confirmation' : 'Unban Page Confirmation'}
                </h6>
                <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                  {isBanning 
                    ? 'This will prevent the page from being accessible to users and hide all its content.'
                    : 'This will restore the page and make it accessible again.'
                  }
                </p>
              </div>
              <div style={{ ...styles.infoCard, marginBottom: theme.spacing.lg }}>
                <h6 style={{ marginBottom: theme.spacing.xs }}>{page.pageName}</h6>
                <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                  {page.owner ? `${page.owner.firstName} ${page.owner.lastName}` : 'No owner'}
                </p>
              </div>
              {isBanning && (
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <label style={{ display: "block", marginBottom: theme.spacing.xs }}>Reason for banning <span style={{ color: theme.colors.danger }}>*</span></label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Please provide a detailed reason for banning this page..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                  <small style={{ color: theme.colors.textSecondary, display: "block", marginTop: theme.spacing.xs }}>
                    This reason will be logged and may be shown to the page owner.
                  </small>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <Button variant="primary" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button variant={isBanning ? "danger" : "secondary"} disabled={loading}>
                {loading ? 'Processing...' : isBanning ? 'Ban Page' : 'Unban Page'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Approve/Reject Modal Component
const ApprovalModal = ({ show, onClose, page, action, onApprovalUpdate }) => {
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!page) return;

    setLoading(true);
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const res = await axiosInstance.put(`/pages/admin/${page.id}/${endpoint}`, {
        reviewNote: reviewNote.trim()
      });
      
      if (res.data.success) {
        toast.success(`Page ${action}d successfully!`);
        onApprovalUpdate(res.data.page);
        onClose();
        setReviewNote('');
      }
    } catch (error) {
      console.error(`Error ${action}ing page:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} page`);
    } finally {
      setLoading(false);
    }
  };

  if (!show || !page) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.modalBackdrop}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        style={styles.modalDialog()}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h5 style={styles.modalTitle}>{action === 'approve' ? 'Approve Page' : 'Reject Page'}</h5>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.modalBody}>
              <div style={styles.alert('warning')}>
                <h6 style={{ color: theme.colors.warning, marginBottom: theme.spacing.sm }}>
                  {action === 'approve' ? 'Approval Confirmation' : 'Rejection Confirmation'}
                </h6>
                <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                  {action === 'approve' 
                    ? 'This will make the page live and accessible to users.'
                    : 'This will prevent the page from being published.'
                  }
                </p>
              </div>
              <div style={{ ...styles.infoCard, marginBottom: theme.spacing.lg }}>
                <h6 style={{ marginBottom: theme.spacing.xs }}>{page.pageName}</h6>
                <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                  {page.owner ? `${page.owner.firstName} ${page.owner.lastName}` : 'No owner'}
                </p>
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: "block", marginBottom: theme.spacing.xs }}>Review Note</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Provide any notes about this review decision..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
                <small style={{ color: theme.colors.textSecondary, display: "block", marginTop: theme.spacing.xs }}>
                  This note will be logged and may be shown to the page owner.
                </small>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <Button variant="primary" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button variant={action === 'approve' ? "secondary" : "danger"} disabled={loading}>
                {loading ? 'Processing...' : action === 'approve' ? 'Approve Page' : 'Reject Page'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Page Management Dashboard Component
const PageManagementDash = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    banned: 0,
    pending: 0,
    draft: 0
  });

  useEffect(() => {
    fetchAllPages();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [pages]);

  const fetchAllPages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/pages/admin/all');
      if (res.data.success) {
        setPages(res.data.pages || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = pages.length;
    const published = pages.filter(p => p.isPublished && !p.isBanned).length;
    const banned = pages.filter(p => p.isBanned).length;
    const pending = pages.filter(p => p.approvalStatus === 'pending').length;
    const draft = pages.filter(p => !p.isPublished).length;
    
    setStats({ total, published, banned, pending, draft });
  };

  const handleViewDetails = (pageId) => {
    setSelectedPageId(pageId);
    setShowDetailsModal(true);
  };

  const handleBanPage = (page) => {
    setSelectedPage(page);
    setShowBanModal(true);
  };

  const handleApproveReject = (page, action) => {
    setSelectedPage(page);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm('Are you sure you want to permanently delete this page? This action cannot be undone.')) return;
    
    try {
      const res = await axiosInstance.delete(`/pages/admin/${pageId}`);
      if (res.data.success) {
        toast.success('Page deleted successfully!');
        setPages(prev => prev.filter(page => page.id !== pageId));
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error(error.response?.data?.message || 'Failed to delete page');
    }
  };

  const handleBanToggle = (updatedPageData) => {
    setPages(prev => prev.map(page => {
      if (page.id === updatedPageData.id) {
        return {
          ...page,
          isBanned: updatedPageData.isBanned,
          banReason: updatedPageData.banReason
        };
      }
      return page;
    }));
  };

  const handleApprovalUpdate = (updatedPageData) => {
    setPages(prev => prev.map(page => {
      if (page.id === updatedPageData.id) {
        return {
          ...page,
          approvalStatus: updatedPageData.approvalStatus,
          phone: updatedPageData.phone,
          email: updatedPageData.email,
          address: updatedPageData.address,
          pendingContactUpdates: updatedPageData.pendingContactUpdates
        };
      }
      return page;
    }));
  };

  const getStatusBadge = (page) => {
    if (page.isBanned) {
      return <Badge variant="danger">Banned</Badge>;
    }
    if (!page.isPublished) {
      return <Badge variant="warning">Draft</Badge>;
    }
    if (page.approvalStatus === 'pending') {
      return <Badge variant="info">Pending Review</Badge>;
    }
    if (page.approvalStatus === 'approved') {
      return <Badge variant="success">Live</Badge>;
    }
    if (page.approvalStatus === 'rejected') {
      return <Badge variant="danger">Rejected</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const filteredPages = pages.filter(page => {
    const pageName = page.pageName || '';
    const username = page.username || '';
    const ownerFirstName = page.owner?.firstName || '';
    const ownerLastName = page.owner?.lastName || '';
    
    const matchesSearch = pageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ownerFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ownerLastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'published' && page.isPublished && !page.isBanned) ||
                         (filterStatus === 'banned' && page.isBanned) ||
                         (filterStatus === 'pending' && page.approvalStatus === 'pending') ||
                         (filterStatus === 'draft' && !page.isPublished) ||
                         (filterStatus === 'rejected' && page.approvalStatus === 'rejected');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Page Management</h2>
      <div style={styles.statsContainer}>
        <div style={styles.statCard('primary')}>
          <h4 style={styles.statNumber('primary')}>{stats.total}</h4>
          <p style={styles.statLabel}>Total Pages</p>
        </div>
        <div style={styles.statCard('success')}>
          <h4 style={styles.statNumber('success')}>{stats.published}</h4>
          <p style={styles.statLabel}>Published</p>
        </div>
        <div style={styles.statCard('warning')}>
          <h4 style={styles.statNumber('warning')}>{stats.draft}</h4>
          <p style={styles.statLabel}>Draft</p>
        </div>
        <div style={styles.statCard('info')}>
          <h4 style={styles.statNumber('info')}>{stats.pending}</h4>
          <p style={styles.statLabel}>Pending</p>
        </div>
        <div style={styles.statCard('danger')}>
          <h4 style={styles.statNumber('danger')}>{stats.banned}</h4>
          <p style={styles.statLabel}>Banned</p>
        </div>
      </div>
      <Card>
        <div style={styles.controlsRow}>
          <input
            type="text"
            style={styles.input}
            placeholder="Search by page name, username, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.select}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Pages</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
            <option value="banned">Banned</option>
          </select>
          <Button variant="primary" onClick={fetchAllPages} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </Card>
      <Card>
        {loading ? (
          <div style={styles.emptyState}>Loading pages...</div>
        ) : filteredPages.length === 0 ? (
          <div style={styles.emptyState}>No pages found</div>
        ) : (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Page</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Followers</th>
                <th style={styles.th}>Created</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page, index) => (
                <motion.tr
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td style={styles.td}>
                    <h6 style={{ fontWeight: "bold", marginBottom: theme.spacing.xs }}>{page.pageName || 'Unnamed Page'}</h6>
                    {page.username && <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem", marginBottom: theme.spacing.xs }}>{page.username}</p>}
                    <Badge variant="secondary">{page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}</Badge>
                  </td>
                  <td style={styles.td}>
                    {page.owner ? (
                      <>
                        <p style={{ fontWeight: "bold", marginBottom: theme.spacing.xs }}>{page.owner.firstName} {page.owner.lastName}</p>
                        <p style={{ color: theme.colors.textSecondary, fontSize: "0.875rem", margin: 0 }}>{page.owner.username}</p>
                      </>
                    ) : (
                      <span style={{ color: theme.colors.textSecondary }}>No owner</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {getStatusBadge(page)}
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: "bold" }}>{page.followersCount || 0}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: theme.colors.textSecondary, fontSize: "0.875rem" }}>
                      {page.createdAt ? new Date(page.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </td>
                  <td style={styles.tdActions}>
                    <Button variant="info" small onClick={() => handleViewDetails(page.id)}>View</Button>
                    {page.approvalStatus === 'pending' && (
                      <>
                        <Button variant="secondary" small onClick={() => handleApproveReject(page, 'approve')}>Approve</Button>
                        <Button variant="danger" small onClick={() => handleApproveReject(page, 'reject')}>Reject</Button>
                      </>
                    )}
                    <Button variant={page.isBanned ? "secondary" : "warning"} small onClick={() => handleBanPage(page)}>
                      {page.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                    <Button variant="danger" small onClick={() => handleDeletePage(page.id)}>Delete</Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {!loading && (
        <div style={styles.footer}>
          <span>Showing {filteredPages.length} of {pages.length} pages</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      )}
      <AnimatePresence>
        {showDetailsModal && (
          <PageDetailsModal
            show={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            pageId={selectedPageId}
          />
        )}
        {showBanModal && (
          <BanModal
            show={showBanModal}
            onClose={() => setShowBanModal(false)}
            page={selectedPage}
            onBanToggle={handleBanToggle}
          />
        )}
        {showApprovalModal && (
          <ApprovalModal
            show={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            page={selectedPage}
            action={approvalAction}
            onApprovalUpdate={handleApprovalUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageManagementDash;
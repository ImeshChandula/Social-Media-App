const styles = {
    contentWrapper: {
      minHeight: '100vh',
      //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      color: 'white'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '10px',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: '0.9'
    },
    statsCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '20px',
      marginBottom: '30px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'white',
      textAlign: 'center'
    },
    postsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '25px'
    },
    postCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '25px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    postCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
    },
    authorSection: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px'
    },
    avatar: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      marginRight: '12px',
      border: '3px solid #667eea'
    },
    authorInfo: {
      flex: 1
    },
    authorName: {
      fontWeight: '600',
      fontSize: '1.1rem',
      color: '#2d3748',
      marginBottom: '2px'
    },
    username: {
      color: '#718096',
      fontSize: '0.9rem'
    },
    postContent: {
      fontSize: '1rem',
      lineHeight: '1.6',
      color: '#4a5568',
      marginBottom: '15px',
      wordBreak: 'break-word'
    },
    mediaContainer: {
      marginBottom: '15px',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative'
    },
    media: {
      width: '100%',
      maxHeight: '300px',
      objectFit: 'cover',
      borderRadius: '12px'
    },
    mediaType: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '15px',
      fontSize: '0.8rem',
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    metaInfo: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      marginBottom: '15px',
      fontSize: '0.85rem',
      color: '#718096'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    },
    privacyBadge: {
      background: '#667eea',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '500'
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '15px',
      borderTop: '1px solid #e2e8f0',
      marginBottom: '15px'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      color: '#718096',
      fontSize: '0.9rem'
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px'
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
    },
    deleteButtonHover: {
      background: 'linear-gradient(135deg, #ff5252, #d32f2f)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)'
    },
    loading: {
      textAlign: 'center',
      color: 'white',
      fontSize: '1.2rem',
      padding: '50px'
    },
    noData: {
      textAlign: 'center',
      color: 'white',
      fontSize: '1.2rem',
      padding: '50px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)'
    }
};

export default styles;
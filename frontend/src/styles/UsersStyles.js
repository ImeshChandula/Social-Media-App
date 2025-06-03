const styles = {
    container: {
        minHeight: '100vh',
        //background: 'linear-gradient(135deg,rgb(39, 42, 55) 0%,rgb(29, 9, 50) 100%)',
        padding: '24px'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'white',
        margin: '0 0 8px 0'
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        margin: 0
    },
    searchContainer: {
        marginBottom: '32px'
    },
    searchWrapper: {
        position: 'relative',
        maxWidth: '400px'
    },
    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        width: '20px',
        height: '20px'
    },
    searchInput: {
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        border: '1px solid #d1d5db',
        borderRadius: '12px',
        fontSize: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
    },
    section: {
        marginBottom: '32px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'white',
        margin: 0
    },
    clearButton: {
        color: '#3b82f6',
        background: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.2s ease'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px'
    },
    userCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    },
    cardContent: {
        padding: '24px'
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flex: 1
    },
    avatarContainer: {
        position: 'relative'
    },
    avatar: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid #dbeafe'
    },
    roleIconContainer: {
        position: 'absolute',
        bottom: '-4px',
        right: '-4px',
        backgroundColor: 'white',
        borderRadius: '50%',
        padding: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    userDetails: {
        flex: 1
    },
    nameContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px'
    },
    userName: {
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: '#1f2937',
        margin: 0
    },
    username: {
        color: '#6b7280',
        fontSize: '0.875rem',
        margin: '0 0 2px 0'
    },
    email: {
        color: '#9ca3af',
        fontSize: '0.75rem',
        margin: 0
    },
    actionButtons: {
        display: 'flex',
        gap: '8px'
    },
    editButton: {
        padding: '8px',
        backgroundColor: '#dbeafe',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#2563eb',
        transition: 'all 0.2s ease'
    },
    deleteButton: {
        padding: '8px',
        backgroundColor: '#fee2e2',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#dc2626',
        transition: 'all 0.2s ease'
    },
    roleStatusContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '16px'
    },
    roleBox: {
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        padding: '12px',
        borderRadius: '8px'
    },
    roleLabel: {
        fontSize: '0.75rem',
        color: '#2563eb',
        fontWeight: '600',
        marginBottom: '2px'
    },
    roleValue: {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#1e40af',
        textTransform: 'capitalize'
    },
    statusBox: {
        background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
        padding: '12px',
        borderRadius: '8px'
    },
    statusLabel: {
        fontSize: '0.75rem',
        color: '#059669',
        fontWeight: '600',
        marginBottom: '2px'
    },
    statusValue: {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#047857',
        textTransform: 'capitalize'
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
        textAlign: 'center'
    },
    statBox: {
        backgroundColor: '#f9fafb',
        padding: '8px',
        borderRadius: '8px'
    },
    statNumber: {
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: '#1f2937'
    },
    statLabel: {
        fontSize: '0.75rem',
        color: '#6b7280'
    },
    bio: {
        color: '#6b7280',
        fontSize: '0.875rem',
        fontStyle: 'italic',
        marginBottom: '12px'
    },
    location: {
        color: '#9ca3af',
        fontSize: '0.75rem',
        marginBottom: '12px'
    },
    lastLogin: {
        color: '#9ca3af',
        fontSize: '0.75rem'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '48px'
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
    },
    loadingText: {
        color: 'white',
        marginTop: '16px'
    },
    noResults: {
        textAlign: 'center',
        padding: '32px',
        color: 'rgba(255, 255, 255, 0.8)'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '400px'
    },
    modalTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#1f2937'
    },
    deleteModalTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#dc2626'
    },
    deleteModalText: {
        color: '#6b7280',
        marginBottom: '24px',
        lineHeight: '1.5'
    },
    modalContent: {
        marginBottom: '24px'
    },
    formGroup: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
    },
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
    },
    cancelButton: {
        padding: '8px 16px',
        color: '#6b7280',
        backgroundColor: '#e5e7eb',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    confirmDeleteButton: {
        padding: '8px 16px',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }
};

export default styles;
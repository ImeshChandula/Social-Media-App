const styles = {
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '3rem',
    marginTop: '2rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    borderRadius: '16px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap'
  },
  statBox: {
    textAlign: 'center',
    minWidth: '100px',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'transform 0.3s ease',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '0.85rem',
  }
};

export default styles;

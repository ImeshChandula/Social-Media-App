const styles = {
  container: {
    marginTop: '1rem',
    padding: '1rem',
    borderRadius: '1rem',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  },
  topRightCircle: {
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.1,
    width: '100px',
    height: '100px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    borderRadius: '50%',
    transform: 'translate(30px, -30px)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  iconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem'
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    margin: 0
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  fullColumn: {
    flex: '1 1 100%'
  },
  halfColumn: {
    flex: '1 1 calc(50% - 0.5rem)'
  },
  infoCard: {
    padding: '1rem',
    borderRadius: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    height: '100%'
  },
  rowStart: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  rowCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  rowBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconSpacing: {
    marginRight: '0.75rem',
    flexShrink: 0
  },
  cardTitle: {
    color: 'white',
    marginBottom: '0.5rem',
    fontWeight: 600,
    fontSize: '1rem'
  },
  cardText: {
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
    lineHeight: 1.5
  },
  badge: {
    padding: '0.5rem 0.75rem',
    borderRadius: '20px',
    fontWeight: 600,
    fontSize: '0.75rem',
    border: '1px solid'
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    opacity: 0.6
  }
};

export default styles;

const LoginStyle = {
  page: {
    minHeight: '100vh',
    //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  header: {
    textAlign: 'center',
    marginBottom: '40px',
    color: '#fff'
  },

  title: {
    fontSize: '64px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#fff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    letterSpacing: '-2px'
  },

  subtitle: {
    fontSize: '20px',
    margin: '0',
    color: '#e8f4fd',
    fontWeight: '300',
    maxWidth: '400px',
    lineHeight: '1.4'
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },

  input: {
    width: '100%',
    padding: '18px 20px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '20px'
  },

  inputFocus: {
    borderColor: '#667eea',
    backgroundColor: '#fff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-2px)'
  },

  passwordGroup: {
    position: 'relative',
    marginBottom: '20px'
  },

  passwordInput: {
    width: '100%',
    padding: '18px 50px 18px 20px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box'
  },

  eyeIcon: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#667eea',
    fontSize: '20px',
    transition: 'color 0.3s ease',
    zIndex: 1
  },

  eyeIconHover: {
    color: '#764ba2'
  },

  options: {
    display: 'flex',
    //justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: '25px',
    fontSize: '14px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#666',
    fontSize: '14px'
  },

  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
    accentColor: '#667eea'
  },

  forgotLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },

  forgotLinkHover: {
    color: '#764ba2',
    textDecoration: 'underline'
  },

  button: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },

  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
  },

  divider: {
    textAlign: 'center',
    margin: '25px 0',
    position: 'relative',
    color: '#666',
    fontSize: '14px'
  },

  dividerLine: {
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    height: '1px',
    background: '#e1e8ed',
    zIndex: 1
  },

  dividerText: {
    background: '#fff',
    padding: '0 20px',
    position: 'relative',
    zIndex: 2
  },

  socialButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '25px'
  },

  socialBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  },

  socialBtnHover: {
    borderColor: '#667eea',
    backgroundColor: '#f8f9fa',
    transform: 'translateY(-1px)'
  },

  socialContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  socialIcon: {
    fontSize: '18px'
  },

  signup: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },

  signupLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },

  signupLinkHover: {
    color: '#764ba2',
    textDecoration: 'underline'
  }
};

export default LoginStyle;
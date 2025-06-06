const RegisterStyle = {
  container: {
    minHeight: '100vh',
    //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  header: {
    textAlign: 'center',
    marginBottom: '30px',
    color: 'rgba(0,0,0,0.3)'
  },

  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: 'rgba(63, 18, 211, 0.72)',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    letterSpacing: '-1px'
  },

  subtitle: {
    fontSize: '18px',
    margin: '0',
    color: 'rgba(14, 70, 224, 0.82)',
    fontWeight: '300'
  },

  formBox: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },

  inputGroup: {
    marginBottom: '20px'
  },

  inputGroupDouble: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  input: {
    width: '100%',
    padding: '15px 20px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box'
  },

  inputFocus: {
    borderColor: '#667eea',
    backgroundColor: '#fff',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-2px)'
  },

  phoneGroup: {
    marginBottom: '20px'
  },

  phoneContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end'
  },

  countrySelectWrapper: {
    flex: '0 0 200px'
  },

  phoneInputWrapper: {
    flex: '1'
  },

  countrySelect: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    fontSize: '14px',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },

  phoneInput: {
    width: '100%',
    padding: '15px 20px',
    border: '2px solid #e1e8ed',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'inherit',
    transition: 'all 0.3s ease',
    backgroundColor: '#f8f9fa',
    outline: 'none',
    boxSizing: 'border-box'
  },

  passwordGroup: {
    position: 'relative',
    marginBottom: '20px'
  },

  passwordInput: {
    width: '100%',
    padding: '15px 50px 15px 20px',
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

  submitButton: {
    width: '100%',
    padding: '16px',
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

  submitButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
  },

  info: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  },

  linkList: {
    listStyle: 'none',
    padding: '0',
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },

  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },

  linkHover: {
    color: '#764ba2',
    textDecoration: 'underline'
  },

  loginLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },

  loginLinkHover: {
    color: '#764ba2',
    textDecoration: 'underline'
  }
};

export default RegisterStyle;
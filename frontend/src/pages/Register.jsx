import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, formData);
      console.log('User registered:', res.data);
      alert('Registration successful!');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      alert('Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column'
    }}>
      {/* TEXT ABOVE THE BOX */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{
          color: '#00FF66',
          fontSize: '32px',
          marginBottom: '5px'
        }}>facebook</h1>
        <p style={{
          fontSize: '14px',
          color: '#ccc',
          margin: 0
        }}>Create a new account</p>
      </div>

      {/* FORM BOX */}
      <div style={{
        backgroundColor: '#121829',
        padding: '30px',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              name="firstName"
              placeholder="👤 First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="lastName"
              placeholder="👤 Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="📱 Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="🔒 New Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <button type="submit" style={submitButtonStyle}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: "left", marginTop: "15px", fontSize: "12px", color: '#ccc' }}>
          <p style={{ marginBottom: "5px" }}>By clicking Sign Up, you agree to our:</p>
          <ul style={{ paddingLeft: "20px", margin: "0" }}>
            <li><a href="/terms" style={linkStyle}>Terms of Service</a></li>
            <li><a href="/privacy" style={linkStyle}>Privacy Policy</a></li>
            <li><a href="/cookies" style={linkStyle}>Cookie Policy</a></li>
          </ul>
          <p style={{ marginTop: "10px", textAlign: 'center' }}>
            Already have an account? <a href="/login" style={{color: '#00FF66', textDecoration: 'none'}}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #333',
  backgroundColor: '#1E293B',
  color: '#fff',
  outline: 'none'
};

const submitButtonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#00FF66',
  color: '#000',
  border: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '10px'
};

const linkStyle = {
  color: '#FDFFFEB3',
  textDecoration: 'none'
};

export default Register;

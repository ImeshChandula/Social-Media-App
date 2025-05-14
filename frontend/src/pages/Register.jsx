import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim values and validate password length
    const trimmedData = {
      username: formData.username.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      role: 'user'
    };

    if (trimmedData.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await axiosInstance.post('/auth/register', trimmedData, {
        withCredentials: true
      });

      console.log('User registered:', res.data);
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || JSON.stringify(err.response?.data) || err.message;
      console.error('Registration failed:', errorMsg);
      alert(`Registration failed: ${errorMsg}`);
    }
  };

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1 style={{ color: '#00FF66', fontSize: '32px', marginBottom: '5px' }}>facebook</h1>
        <p style={{ fontSize: '14px', color: '#ccc', margin: 0 }}>Create a new account</p>
      </div>

      {/* FORM BOX */}
      <div style={formBoxStyle}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="👤 Username"
            value={formData.username}
            onChange={handleChange}
            required
            style={inputStyle}
          />
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

        <div style={infoStyle}>
          <p style={{ marginBottom: '5px' }}>By clicking Sign Up, you agree to our:</p>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li><a href="/terms" style={linkStyle}>Terms of Service</a></li>
            <li><a href="/privacy" style={linkStyle}>Privacy Policy</a></li>
            <li><a href="/cookies" style={linkStyle}>Cookie Policy</a></li>
          </ul>
          <p style={{ marginTop: '10px', textAlign: 'center' }}>
            Already have an account? <a href="/login" style={{ color: '#00FF66', textDecoration: 'none' }}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Arial, sans-serif',
  flexDirection: 'column'
};

const formBoxStyle = {
  backgroundColor: '#121829',
  padding: '30px',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  textAlign: 'center'
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

const infoStyle = {
  textAlign: 'left',
  marginTop: '15px',
  fontSize: '12px',
  color: '#ccc'
};

export default Register;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const res = await axiosInstance.post('/auth/register', trimmedData);

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
    <div className="register-container">
      <div className="register-header">
        <h1 className="register-title">facebook</h1>
        <p className="register-subtitle">Create a new account</p>
      </div>

      <div className="register-form-box">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="👤 Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="register-input"
          />

          <div className="register-input-group">

            <input
              type="text"
              name="firstName"
              placeholder="👤 First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="register-input"
            />

            <input
              type="text"
              name="lastName"
              placeholder="👤 Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="register-input"
            />

          </div>

          <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="register-input"
          />

          <div className="input-with-icon">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="🔒 New Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register-input-password"
            />
            <span
              className="hide-show-eye"
              onClick={togglePasswordVisibility}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>


          <button type="submit" className="register-button">
            Sign Up
          </button>

        </form>

        <div className="register-info">
          <p>By clicking Sign Up, you agree to our:</p>
          <ul>
            <li><a href="/terms" className="register-link">Terms of Service</a></li>
            <li><a href="/privacy" className="register-link">Privacy Policy</a></li>
            <li><a href="/cookies" className="register-link">Cookie Policy</a></li>
          </ul>
          <p style={{ textAlign: 'center' }}>
            Already have an account?{" "}
            <a href="/login" className="register-login-link">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

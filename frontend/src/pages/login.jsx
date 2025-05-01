import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { emailOrPhone, password } = formData;

    // Simple validation for phone number and password
    if (emailOrPhone === '011234567' && password === '1234') {
      setIsLoggedIn(true);
      navigate("/");
    } else {
      alert('Invalid phone number or password.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Facebook and subtitle closer to box */}
      <h1 className="auth-title" style={{ marginBottom: '4px' }}>Facebook</h1>
      <h2 className="auth-subtitle" style={{ marginBottom: '16px' }}>
        Connect with friends and the world around you.
      </h2>

      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="emailOrPhone"
            placeholder="📧 Email or phone number"
            value={formData.emailOrPhone}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleChange}
          />
          <label className="checkbox-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember me
          </label>
          <button type="submit" className="auth-button">Log In</button>
        </form>

        <div className="auth-links" style={{ textAlign: "left", marginTop: "10px" }}>
          <p><a href="/forgot-password">Forgot Password?</a></p>
          <p>Don't have an account? <a href="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;

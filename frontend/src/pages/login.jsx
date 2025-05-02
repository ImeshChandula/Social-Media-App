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

    if (emailOrPhone === '011234567' && password === '1234') {
      setIsLoggedIn(true);
      navigate("/");
    } else {
      alert('Invalid phone number or password.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="auth-container">
        <h1 className="auth-title">Facebook</h1>
        <h2 className="auth-subtitle">
          Connect with friends and the world around you.
        </h2>

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
          <label className="checkbox-wrapper">
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

        <div className="auth-links">
          <p><a href="/forgot-password">Forgot Password?</a></p>
          <p>Don't have an account? <a href="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};
// Styles
const containerStyle = {
  backgroundColor: "#000",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff"
};

const titleStyle = {
  color: "#00ff6a",
  fontSize: "2rem",
  marginBottom: "10px"
};

const subtitleStyle = {
  marginBottom: "20px",
  color: "#ccc"
};

const formStyle = {
  backgroundColor: "#111827",
  padding: "30px",
  borderRadius: "10px",
  width: "300px",
  boxShadow: "0 0 15px rgba(0,0,0,0.6)"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #333",
  backgroundColor: "#1f2937",
  color: "#fff"
};

const submitButtonStyle = {
  width: "100%",
  backgroundColor: "#00ff6a",
  color: "#000",
  padding: "10px",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  marginBottom: "15px",
  cursor: "pointer"
};

const optionsStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "10px",
  fontSize: "0.9rem"
};

const linkStyle = {
  color: "#00ff6a",
  textDecoration: "none"
};

export default Login;

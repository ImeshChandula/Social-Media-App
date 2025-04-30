import React, { useState } from 'react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <>
      {/* Facebook title moved out of auth container */}
      <h1 className="auth-title" style={{ textAlign: "center", marginBottom: "10px" }}>Facebook</h1>

      <div className="auth-container">
        <h2 className="auth-subtitle">Create a new account</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="name-fields">
            <input
              type="text"
              name="firstName"
              placeholder="👤 First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="👤 Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="📱 Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="🔒 New Password"
            value={formData.password}
            onChange={handleChange}
          />
          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <div className="auth-links" style={{ textAlign: "left", marginTop: "10px" }}>
          <p style={{ marginBottom: "5px" }}>By clicking Sign Up, you agree to our:</p>
          <ul style={{ paddingLeft: "20px", margin: "0" }}>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/cookies">Cookie Policy</a></li>
          </ul>
          <p style={{ marginTop: "10px" }}>Already have an account? <a href="/login">Log in</a></p>
        </div>
      </div>
    </>
  );
};

export default Register;

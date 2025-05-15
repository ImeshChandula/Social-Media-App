import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data?.user) {
        setIsLoggedIn(true);
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data?.msg || err.message);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1 className="login-title">facebook</h1>
        <p className="login-subtitle">
          Connect with friends and the world around you.
        </p>
      </div>

      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="login-input"
          />

          <div className="input-with-icon">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="login-input-password"
            />
            <span
              className="input-icon"
              onClick={togglePasswordVisibility}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>


          <div className="login-options">
            <label className="login-checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="login-forgot">
              Forgot Password?
            </a>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button">
            Log In
          </button>

          <div className="login-divider">Or continue with</div>
          <div className="login-social-buttons">
            <button type="button" className="login-social-btn">
              <span className="login-social-content">
                <FcGoogle className="login-social-icon" /> Google
              </span>
            </button>
            <button type="button" className="login-social-btn">
              <span className="login-social-content">
                <FaApple className="login-social-icon" /> Apple
              </span>
            </button>
          </div>
        </form>

        <p className="login-signup">
          Don't have an account?{' '}
          <a href="/register" className="login-signup-link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
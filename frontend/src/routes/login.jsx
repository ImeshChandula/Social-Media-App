import React, { useState } from "react";
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LoginStyle from "../styles/LoginStyle";
import SocialButtons from "../components/SocialButtons";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredEye, setHoveredEye] = useState(false);
  const [hoveredForgot, setHoveredForgot] = useState(false);
  const [hoveredSignup, setHoveredSignup] = useState(false);
  const [focusedInputs, setFocusedInputs] = useState({});

  const { login } = useAuthStore();

  const handleFocus = (inputName) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: true }));
  };

  const handleBlur = (inputName) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: false }));
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const loggingData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const res = await login(loggingData);

      if (res && res.user) {
        window.location.reload();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div style={LoginStyle.page}>
      <div style={LoginStyle.header}>
        <h1 style={LoginStyle.title}>facebook</h1>
        <p style={LoginStyle.subtitle}>Connect with friends and the world around you.</p>
      </div>

      <div style={LoginStyle.container}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            style={{
              ...LoginStyle.input,
              ...(focusedInputs.email ? LoginStyle.inputFocus : {})
            }}
            required
          />

          <div style={LoginStyle.passwordGroup}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              style={{
                ...LoginStyle.passwordInput,
                ...(focusedInputs.password ? LoginStyle.inputFocus : {})
              }}
              required
            />
            <span
              style={{
                ...LoginStyle.eyeIcon,
                ...(hoveredEye ? LoginStyle.eyeIconHover : {})
              }}
              onClick={togglePasswordVisibility}
              onMouseEnter={() => setHoveredEye(true)}
              onMouseLeave={() => setHoveredEye(false)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div style={LoginStyle.options}>
            <label style={LoginStyle.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={LoginStyle.checkbox}
              />
              <span>Remember me</span>
            </label>
            <a
              href="/reset-password"
              style={{
                ...LoginStyle.forgotLink,
                ...(hoveredForgot ? LoginStyle.forgotLinkHover : {})
              }}
              onMouseEnter={() => setHoveredForgot(true)}
              onMouseLeave={() => setHoveredForgot(false)}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            style={{
              ...LoginStyle.button,
              ...(hoveredButton ? LoginStyle.buttonHover : {})
            }}
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
          >
            Log In
          </button>

          {/*
          <div style={LoginStyle.divider}>
            <div style={LoginStyle.dividerLine}></div>
            <span style={LoginStyle.dividerText}>Or continue with</span>
          </div>
          */}

          {/* Social buttons */}
          {/*<SocialButtons />*/}

        </form>

        <p style={LoginStyle.signup}>
          Don't have an account?{" "}
          <a
            href="/register"
            style={{
              ...LoginStyle.signupLink,
              ...(hoveredSignup ? LoginStyle.signupLinkHover : {})
            }}
            onMouseEnter={() => setHoveredSignup(true)}
            onMouseLeave={() => setHoveredSignup(false)}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

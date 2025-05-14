import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import axios from "axios";

const styles = {
  page: {
    backgroundColor: "#000",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  header: {
    marginBottom: "20px",
    textAlign: "center",
  },
  title: {
    color: "#00FF66",
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  subtitle: {
    color: "#ccc",
    fontSize: "14px",
  },
  container: {
    backgroundColor: "#111827",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 0 30px rgba(0,0,0,0.4)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#1f2937",
    color: "white",
  },
  checkboxWrapper: {
    display: "flex",
    alignItems: "center",
    color: "#ccc",
    fontSize: "14px",
  },
  options: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    marginBottom: "20px",
  },
  forgotLink: {
    fontSize: "14px",
    color: "#00FF66",
    textDecoration: "none",
  },
  button: {
    backgroundColor: "#00FF66",
    color: "white",
    padding: "12px",
    width: "100%",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    marginBottom: "20px",
    cursor: "pointer",
  },
  divider: {
    color: "#aaa",
    marginBottom: "10px",
  },
  socialButtons: {
    display: "flex",
    justifyContent: "space-around",
    gap: "10px",
  },
  socialBtn: {
    backgroundColor: "#1F29370D",
    color: "white",
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  signupLink: {
    marginTop: "20px",
    color: "#aaa",
    fontSize: "14px",
  },
  signupAnchor: {
    color: "#00FF66",
    textDecoration: "none",
  },
};

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      }, {
        withCredentials: true, // important if using cookies for JWT
      });

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
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>facebook</h1>
        <p style={styles.subtitle}>Connect with friends and the world around you.</p>
      </div>

      <div style={styles.container}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={styles.options}>
            <label style={styles.checkboxWrapper}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span style={{ marginLeft: "5px" }}>Remember me</span>
            </label>
            <a href="/forgot-password" style={styles.forgotLink}>
              Forgot Password?
            </a>
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          )}

          <button type="submit" style={styles.button}>
            Log In
          </button>

          <div style={styles.divider}>Or continue with</div>
          <div style={styles.socialButtons}>
            <button type="button" style={styles.socialBtn}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <FcGoogle style={{ marginRight: "8px" }} />
                Google
              </span>
            </button>
            <button type="button" style={styles.socialBtn}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <FaApple style={{ marginRight: "8px" }} />
                Apple
              </span>
            </button>
          </div>
        </form>

        <p style={styles.signupLink}>
          Don't have an account?{" "}
          <a href="/register" style={styles.signupAnchor}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

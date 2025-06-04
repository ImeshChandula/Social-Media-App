import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./routes/login";
import Register from "./routes/Register"
import MainLayout from "./routes/MainLayout";
import { axiosInstance } from "./lib/axios";
import EditProfile from "./components/EditProfile";
import ResetPassword from "./routes/ResetPassword";
import Dashboard from "./pages/Dashboard";
import EditPost from "./components/EditPost";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auth user
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/checkCurrent");
        if (res.data) {
          setIsLoggedIn(true);
          setAuthUser(res.data);
        };
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="loading-spinner">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
  }

  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Custom success toast styling
          success: {
            duration: 3000,
            style: {
              background: 'green',
              color: 'white',
            },
          },
          // Custom error toast styling
          error: {
            duration: 4000,
            style: {
              background: '#ff4b4b',
              color: 'white',
            },
          },
        }}
      />

      <Router>
        <Routes>

          <Route
            path="/login"
            element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />}
          />

          <Route
            path="/register"
            element={!isLoggedIn ? <Register setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/" />}
          />

          <Route
            path="/edit-profile"
            element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />}
          />

          <Route
            path="/edit-post/:id"
            element={isLoggedIn ? <EditPost /> : <Navigate to="/login" />}
          />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard/*"
            element={isLoggedIn && (authUser.role === "admin" || authUser.role === "super_admin") ?
              <Dashboard /> : <Navigate to="/login" />}
          />

          <Route
            path="/*"
            element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

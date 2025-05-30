import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./routes/login";
import Register from "./routes/Register"
import MainLayout from "./routes/MainLayout";
import { axiosInstance } from "./lib/axios";
import EditProfile from "./components/EditProfile";
import ResetPassword from "./routes/ResetPassword";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/checkCurrent");
        if (res.data) setIsLoggedIn(true);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (checkingAuth) return <div className="loading-spinner">Loading...</div>;

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
          path="/*"
          element={isLoggedIn ? <MainLayout /> : <Navigate to="/login" />}
        />

        <Route
          path="/edit-profile"
          element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />}
        />

        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
    </div>
  );
};

export default App;

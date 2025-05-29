import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./routes/login";
import Register from "./routes/Register"
import MainLayout from "./routes/MainLayout";
import { axiosInstance } from "./lib/axios";
import EditProfile from "./components/EditProfile";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("/auth/checkCurrent");
        if (res.data) setIsLoggedIn(true);
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
        
        <Route
          path="/edit-profile"
          element={isLoggedIn ? <EditProfile /> : <Navigate to="/login" />}
        />

      </Routes>
    </Router>
  );
};

export default App;

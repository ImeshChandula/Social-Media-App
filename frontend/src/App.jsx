import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./routes/login";
import Register from "./routes/Register"
import MainLayout from "./routes/MainLayout";
import EditProfile from "./components/EditProfile";
import ResetPassword from "./routes/ResetPassword";
import Dashboard from "./pages/Dashboard";
import EditPost from "./components/EditPost";
import styles from "./styles/DashboardStyle";
import useAuthStore from "./store/authStore";
import Support from "./routes/Support";
import Request from "./routes/Request";

const App = () => {

  // Auth user
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (isCheckingAuth && !authUser) {
    return (
      <div className="normal-loading-spinner">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
  }

  return (
    <div style={styles.backgroundColor}>
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
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />

          <Route
            path="/register"
            element={!authUser ? <Register /> : <Navigate to="/" />}
          />

          <Route 
            path="/request" 
            element={<Request />}
          />

          <Route
            path="/edit-profile"
            element={authUser && authUser.accountStatus !== "banned" ? <EditProfile /> : <Navigate to="/login" />}
          />

          <Route 
            path="/edit-post/:postId" 
            element={authUser && authUser.accountStatus !== "banned" ? <EditPost /> : <Navigate to="/login" />} />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/support"
            element={authUser ? <Support /> : <Navigate to="/login" />}
          />

          <Route
            path="/*"
            element={
              authUser ? (
                authUser.accountStatus === "active" ? (
                  <MainLayout />
                ) : (
                  <Navigate to="/support" />
                )
              ) : (
                <Navigate to="/login" />
              )}
          />

          <Route
            path="/dashboard/*"
            element={authUser && (authUser.role === "admin" || authUser.role === "super_admin") && authUser.accountStatus !== "banned" ?
              <Dashboard /> : <Navigate to="/login" />}
          />

        </Routes>
      </Router>
    </div>
  );
};

export default App;

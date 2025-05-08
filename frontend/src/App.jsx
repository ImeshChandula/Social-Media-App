import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";

import Home from "./pages/Home";
import Members from "./pages/Members";
import Videos from "./pages/Videos";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";

import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // false by default
  const [collapsed, setCollapsed] = useState(false); // Manage sidebar collapse state

  const scrollStyle = {
    height: "100vh",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  const hideScrollbar = {
    ...scrollStyle,
    width: "300px",
    backgroundColor: "#111",
  };

  const rightSidebarStyle = {
    ...scrollStyle,
    width: "300px",
    backgroundColor: "#000",
  };

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <Route
            path="*"
            element={
              <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
                {/* Sidebar */}
                <div style={hideScrollbar} className="no-scrollbar">
                  <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                </div>

                {/* Main content */}
                <div
                  className="flex-grow-1 bg-dark text-white no-scrollbar"
                  style={{ ...scrollStyle, padding: "1rem", transition: "margin-left 0.3s ease" }}
                >
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/members" element={<Members />} />
                    <Route path="/videos" element={<Videos />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </div>

                {/* Right Sidebar */}
                <div style={rightSidebarStyle} className="no-scrollbar">
                  <RightSidebar />
                </div>
              </div>
            }
          />
        )}
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Home from "./pages/Home";
import Members from "./pages/Members";
import Videos from "./pages/Videos";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    // If not logged in, show only the login page
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="container-fluid px-0">
        {/* Topbar */}
        <Topbar />

        {/* Layout below Topbar */}
        <div className="d-flex" style={{ marginTop: "60px" }}>
          {/* Sidebar */}
          <div
            className="bg-black"
            style={{
              width: "25vw",
              minHeight: "100vh",
              position: "fixed",
              top: "60px",
              left: 0,
            }}
          >
            <Sidebar />
          </div>

          {/* Main Content */}
          <div
            className="bg-dark text-white p-3"
            style={{
              marginLeft: "25vw",
              flex: 1,
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

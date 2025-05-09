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

import Login from "./pages/login";
import Register from "./pages/Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
              <div className="container-fluid vh-100 overflow-hidden bg-dark text-white">
                <div className="row h-100">
                  {/* Sidebar */}
                  <div
                    className={`col-12 col-md-3 col-lg-2 p-0 bg-black d-none d-md-block`}
                    style={{ overflowY: "auto" }}
                  >
                    <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                  </div>

                  {/* Main Content */}
                  <div
                    className="col-12 col-md-6 col-lg-8 py-3 px-4"
                    style={{ overflowY: "auto", height: "100vh" }}
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
                  <div
                    className="col-12 col-md-3 col-lg-2 p-0 bg-black d-none d-md-block"
                    style={{ overflowY: "auto" }}
                  >
                    <RightSidebar />
                  </div>
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

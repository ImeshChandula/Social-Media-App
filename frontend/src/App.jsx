import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Members from "./pages/Members";
import Videos from "./pages/Videos";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 p-3 bg-dark text-white" style={{ minHeight: "100vh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

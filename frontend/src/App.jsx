import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Members from "./pages/Members";
import Videos from "./pages/Videos";
import Notifications from "./pages/Notifications";
import ProfilePage from "./pages/ProfilePage";
import Topbar from "./components/Topbar";

function App() {
  return (
    <Router>
      <div className="container-fluid px-0">

        {/* Sidebar */}
        <div className="fixed-sidebar col-md-2 bg-black">
          <Sidebar />
        </div>

        {/* Scrollable Main Content */}
        <div className="main-content bg-dark text-white p-3" style={{ minHeight: "100vh" }}>
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

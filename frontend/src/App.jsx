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
        
        {/* Topbar */}
        <Topbar />

        {/* Layout below Topbar */}
        <div className="d-flex" style={{ marginTop: "60px" }}>
          {/* Sidebar */}
          <div
            className="bg-black"
            style={{
              width: "25vw", // 2/8 of the page width
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
              marginLeft: "25vw", // Adjusting to match sidebar width (25%)
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
            </Routes>
          </div>
        </div>

      </div>
    </Router>
  );
}

export default App;

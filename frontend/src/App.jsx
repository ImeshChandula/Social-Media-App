import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Members from "./components/Members";
import Videos from "./components/Videos";
import Notifications from "./components/Notifications";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Router>
      <div className="container-fluid px-0">
        <div className="row gx-0">
          {/* Sidebar on top for small, left for md+ */}
          <div className="col-12 col-md-3 bg-black">
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="col-12 col-md-9 bg-dark text-white p-3" style={{ minHeight: "100vh" }}>
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

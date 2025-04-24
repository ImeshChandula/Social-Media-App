import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';


import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Members from "./components/Members";
import Videos from "./components/Videos";
import Notifications from "./components/Notifications";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    
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
    
  );
}

export default App;

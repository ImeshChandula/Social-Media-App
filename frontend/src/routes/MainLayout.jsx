import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import Home from "../pages/Home";
import Members from "../pages/Members";
import Videos from "../pages/Videos";
import NotificationPage from "../pages/Notifications";
import ProfilePage from "../pages/ProfilePage";
import OtherUserProfiles from "../pages/OtherUserProfiles";
import CreatePost from "../components/CreatePost";
import EditProfile from "../components/EditProfile"
import CreateStory from "../components/CreateStory";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="container-fluid vh-100 overflow-hidden bg-dark text-white">
      <div className="row h-100">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 bg-black"
          style={{ overflowY: "auto", zIndex: 999 }}
        >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content */}
        <div className="col py-3 px-4" style={{ overflowY: "auto", height: "100vh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<OtherUserProfiles />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/create-story" element={<CreateStory />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

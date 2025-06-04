import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import styles from "../styles/DashboardStyle";

import Sidebar from "../components/Sidebar";

import Home from "../pages/Home";
import Members from "../pages/Members";
import Videos from "../pages/Videos";
import NotificationPage from "../pages/Notifications";
import ProfilePage from "../pages/ProfilePage";
import OtherUserProfiles from "../pages/OtherUserProfiles";
import CreatePost from "../components/CreatePost";
import CreateStory from "../components/CreateStory";
import Stories from "../components/Stories";
import StoriesPopup from "../components/StoriesPopup";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="container-fluid vh-100 overflow-hidden text-white" style={styles.backgroundColor}>
      <div className="row h-100">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 bg-black"
          style={{ overflowY: "auto", zIndex: 999 }}
        >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content Area */}
        <div className="col d-flex flex-column" style={{ height: "100vh" }}>
          {/* Top Navigation Bar */}
          <div className="top-nav-bar border-bottom border-secondary py-2 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* You can add breadcrumbs or page title here */}
              <h5 className="mb-0 text-light">Social App</h5>
            </div>

            {/* Right side - Notification Bell */}
            <div className="d-flex align-items-center gap-3">
              <NotificationPage />
              {/* You can add more icons here like search, messages, etc. */}
            </div>
          </div>

          {/* Main Content */}
          <div className="col flex-grow-1 py-3 px-4" style={{ overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/videos" element={<Videos />} />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<OtherUserProfiles />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/create-story" element={<CreateStory />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/:id" element={<StoriesPopup />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

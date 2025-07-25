import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import styles from "../styles/DashboardStyle";
import Sidebar from "../components/Sidebar";
import Videos from "../pages/Videos";
import NotificationPage from "../pages/Notifications";
import ProfilePage from "../pages/ProfilePage";
import OtherUserProfiles from "../pages/OtherUserProfiles";
import CreatePost from "../components/CreatePost";
import CreateStory from "../components/CreateStory";
import Stories from "../components/Stories";
import StoriesPopup from "../components/StoriesPopup";
import MemberControl from "../pages/MemberControl";
import RegularUserPage from "../components/RegularUserPage";
import MarketPlace from "../pages/MarketPlace";
import useAuthStore from "../store/authStore";
import Contact from "./Contact";
import NotificationForMobile from "../pages/NotificationForMobile";
import CreateMarketplaceItem from "../components/CreateMarketplaceItem";
import StoryView from "../components/StoryView";
import Favorites from "../components/Favorites";

const MainLayout = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="container-fluid vh-100 overflow-hidden text-white" style={styles.backgroundColor}>
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0 bg-black" style={{ overflowY: "auto", zIndex: 999 }}>
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="col d-flex flex-column" style={{ height: "100vh" }}>
          <div className="top-nav-bar border-bottom border-secondary py-2 px-4 d-none d-lg-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0 px-4" style={styles.title}>Facebook</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <NotificationPage />
            </div>
          </div>

          {/* Main Content */}
          <div className="col flex-grow-1 py-3 px-0 px-md-5 position-relative" style={{ overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={<RegularUserPage />} />
              <Route path="/members" element={<MemberControl />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<OtherUserProfiles />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/create-story" element={<CreateStory />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/stories/:id" element={<StoriesPopup />} />
              <Route path="/market" element={<MarketPlace />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notifications" element={<NotificationForMobile />} />
              <Route path="/create-marketplace-item" element={<CreateMarketplaceItem />} />
              <Route path="/stories/:id" element={<StoryView />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

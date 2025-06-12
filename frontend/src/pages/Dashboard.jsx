import { Routes, Route, Link } from "react-router-dom";
import NotificationPage from "../pages/Notifications";
import SidebarDashboard from "../components/SidebarDashboard";
import Users from "../components/Users";
import styles from "../styles/DashboardStyle";
import DashboardHome from "../components/DashboardHome";
import PostManagement from "../components/PostManagement";
import JobCategoryManagement from "../components/JobCategoryManagement";
import NotificationForMobile from "./NotificationForMobile";

const Dashboard = () => {
  return (
    <div className="container-fluid vh-100 overflow-hidden text-white" style={styles.backgroundColor}>
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-12 col-md-3 col-lg-2 p-0 bg-black" style={{ overflowY: "auto", zIndex: 999 }}>
          <SidebarDashboard />
        </div>

        {/* Main Content */}
        <div className="col d-flex flex-column" style={{ height: "100vh" }}>
          {/* Top Navigation */}
          <div className="top-nav-bar border-bottom border-secondary py-2 px-4 d-none d-lg-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h5 className="mb-0 px-4" style={styles.title}>Admin Dashboard</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
              <NotificationPage />
            </div>
          </div>

          {/* Routed Content */}
          <div className="col flex-grow-1 py-3 px-4" style={{ overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/users" element={<Users />} />
              <Route path="/posts" element={<PostManagement />} />
              <Route path="/job-category" element={<JobCategoryManagement />} />
              <Route path="/notifications" element={<NotificationForMobile />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

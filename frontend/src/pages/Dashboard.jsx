import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import NotificationPage from "../pages/Notifications";
import SidebarDashboard from "../components/SidebarDashboard";
import Users from "../components/Users";
import styles from "../styles/DashboardStyle";
import DashboardHome from "../components/DashboardHome";
import PostManagement from "../components/PostManagement";
import JobCategoryManagement from "../components/JobCategoryManagement";
import Mail from "./Mail";
import Tickets from "./Tickets";
import ManageMarketplace from "./ManageMarketplace";


const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="container-fluid vh-100 overflow-hidden text-white" style={styles.backgroundColor}>
      <div className="row h-100">
        {/* Sidebar */}
        <div
          className="col-12 col-md-3 col-lg-2 p-0 bg-black"
          style={{ overflowY: "auto", zIndex: 999 }}
        >
          <SidebarDashboard collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>

        {/* Main Content Area */}
        <div className="col d-flex flex-column" style={{ height: "100vh" }}>
          
          {/* Top Navigation Bar */}
          <div className="top-nav-bar border-bottom border-secondary py-2 px-4 d-flex justify-content-between align-items-center" style={styles.backgroundColor}>
            <div className="d-flex align-items-center">
              {/* You can add breadcrumbs or page title here */}
                <div className="mb-0 text-light">
                    <h3 style={styles.title}>
                      <Link to={"/dashboard"} style={{ textDecoration: 'none', color: 'inherit' }}>
                        Admin Dashboard
                      </Link> 
                    </h3>
                </div>
            </div>

            {/* Right side - Notification Bell */}
            <div className="d-flex align-items-center gap-3">
              <NotificationPage />
              {/* You can add more icons here like search, messages, etc. */}
            </div>
          </div>

          {/* Main Content */}
          <div className="col flex-grow-1 py-3 px-4" style={{ overflowY: "auto" }}>
            {/* Related components */}
            <Routes>
                {/* Default dashboard route */}
                <Route path="/" element={<DashboardHome />} />
                <Route path="/users" element={<Users />} />
                <Route path="/posts" element={<PostManagement />} />
                <Route path="/job-category" element={<JobCategoryManagement />} />
                <Route path="/mails" element={<Mail />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/manage-marketplace" element={<ManageMarketplace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
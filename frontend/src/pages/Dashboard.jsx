import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import NotificationPage from "../pages/Notifications";
import SidebarDashboard from "../components/SidebarDashboard";
import Users from "../components/Users";


const Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="container-fluid vh-100 overflow-hidden bg-dark text-white">
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
          <div className="top-nav-bar bg-dark border-bottom border-secondary py-2 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* You can add breadcrumbs or page title here */}
                <div className="mb-0 text-light">
                    <h3>Welcome to Admin Dashboard</h3>
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
                <Route path="/"  />
                
                <Route path="/users" element={<Users />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { FaFacebookF, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { SiJoplin } from "react-icons/si";
import styles from "../styles/DashboardStyle";


const SidebarDashboard = ({ collapsed, setCollapsed }) => {
    const [mobileVisible, setMobileVisible] = useState(false);
    const navigate = useNavigate();

    const shortcuts = [
        { name: "Manage Users", path: "/dashboard/users", icon: <FaUsersGear /> },
        { name: "Manage Posts", path: "/dashboard/posts", icon: <BsFileEarmarkPostFill /> },
        { name: "Job Categories", path: "/dashboard/job-category", icon: <SiJoplin /> },
        { name: "Back to Home", path: "/", icon: <IoMdArrowRoundBack /> },
    ];
    
    const handleResize = () => {
        if (window.innerWidth >= 768) {
          setMobileVisible(false);
        }
    };
    
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
          setMobileVisible(!mobileVisible);
        } else {
          setCollapsed(!collapsed);
        }
    };

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            localStorage.removeItem("isLoggedIn");
            navigate("/");
            window.location.reload();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    
    const closeMobileSidebar = () => {
        if (window.innerWidth < 768) {
          setMobileVisible(false);
        }
    };
    
    const sidebarWidth = collapsed ? "80px" : "250px";


  return (
    <>
          {/* Mobile Top Bar */}
          <div className="d-flex d-md-none align-items-center justify-content-between text-white px-3 py-2" style={styles.backgroundColor}>
            <button
              className="btn btn-outline-light"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {mobileVisible ? <FaTimes /> : <FaBars />}
            </button>
            <span className="fw-bold">Facebook</span>
          </div>
    
          {/* Overlay (for mobile) */}
          {mobileVisible && (
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
              style={{ zIndex: 998 }}
              onClick={closeMobileSidebar}
            />
          )}
    
          {/* Sidebar */}
          <div
            className={`bg-black text-white p-3 flex-column position-fixed top-0 ${
              mobileVisible ? "d-flex" : "d-none"
            } d-md-flex`}
            style={{
              width: sidebarWidth,
              height: "100vh",
              overflowY: "auto",
              zIndex: 999,
              transition: "all 0.3s ease",
            }}
          >
            {/* Logo and Search */}
            <div className="d-flex align-items-center mb-4">
              <FaFacebookF size={28} color="#1ecb73" className="me-3" />
              {!collapsed && (
                <div className="d-flex align-items-center bg-secondary rounded px-2 py-1 flex-grow-1">
                  <h5>Facebook</h5>
                </div>
              )}
            </div>
    
    
            {/* Shortcuts */}
            {!collapsed && (
              <>
                <h6
                  className="text-uppercase px-2 text-white mb-3 border-bottom border-secondary"
                  style={{ fontSize: "0.9rem" }}
                >
                  Your Shortcuts
                </h6>
                <ul className="nav flex-column">
                  {shortcuts.map(({ name, path, icon }) => (
                    <li className="nav-item mb-2" key={name}>
                      <NavLink
                        to={path}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                          `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${
                            isActive ? "bg-dark text-white fw-bold" : "text-white"
                          }`
                        }
                        style={{ fontSize: "1rem" }}
                      >
                        {icon}
                        {!collapsed && name}
                      </NavLink>
                    </li>
                ))}
                  {/* Logout */}
                    <li className="nav-item mb-2">
                        <button
                        className="nav-link d-flex align-items-center gap-3 px-2 py-2 rounded text-white bg-transparent border-0 w-100 text-start"
                        onClick={() => {
                            closeMobileSidebar();
                            handleLogout();
                        }}
                        style={{ fontSize: "1rem" }}
                        >
                        <FaSignOutAlt />
                        {!collapsed && "Logout"}
                        </button>
                    </li>
                </ul>
              </>
            )}
          </div>
        </>
  )
}

export default SidebarDashboard
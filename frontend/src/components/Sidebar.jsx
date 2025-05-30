import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaVideo,
  FaBell,
  FaUserCircle,
  FaSearch,
  FaGamepad,
  FaBasketballBall,
  FaFilm,
  FaShoppingBag,
  FaFacebookF,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { axiosInstance } from "../lib/axios";

const navItems = [
  { name: "Home", path: "/", icon: <FaHome /> },
  { name: "Members", path: "/members", icon: <FaUsers /> },
  { name: "Videos", path: "/videos", icon: <FaVideo /> },
  //{ name: "Notifications", path: "/notifications", icon: <FaBell /> },
  { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
];

const shortcuts = [
  { name: "Gaming", path: "/gaming", icon: <FaGamepad /> },
  { name: "Sports", path: "/sports", icon: <FaBasketballBall /> },
  { name: "Entertainment", path: "/entertainment", icon: <FaFilm /> },
  { name: "Shopping", path: "/shopping", icon: <FaShoppingBag /> },
];

function Sidebar({ collapsed, setCollapsed }) {
  const [mobileVisible, setMobileVisible] = useState(false);
  const navigate = useNavigate();

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
      <div className="d-flex d-md-none align-items-center justify-content-between bg-dark text-white px-3 py-2">
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
              <FaSearch className="text-white me-2" />
              <input
                type="text"
                placeholder="Search Facebook"
                className="form-control border-0 bg-transparent text-white p-0"
                style={{ fontSize: "0.95rem" }}
              />
            </div>
          )}
        </div>

        {/* Nav Links */}
        <ul className="nav flex-column mb-4">
          {navItems.map(({ name, path, icon }) => (
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
            </ul>
          </>
        )}
      </div>
    </>
  );
}

export default Sidebar;

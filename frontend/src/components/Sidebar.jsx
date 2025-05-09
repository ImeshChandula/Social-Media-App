import React, { useState } from "react";
import { NavLink } from "react-router-dom";
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
} from "react-icons/fa";

const navItems = [
  { name: "Home", path: "/", icon: <FaHome /> },
  { name: "Members", path: "/members", icon: <FaUsers /> },
  { name: "Videos", path: "/videos", icon: <FaVideo /> },
  { name: "Notifications", path: "/notifications", icon: <FaBell /> },
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

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileVisible(!mobileVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <>
      {/* Toggle Button (shown on small screens only) */}
      <div className="d-md-none bg-dark text-white p-2">
        <button className="btn btn-outline-light" onClick={toggleSidebar}>
          {mobileVisible ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-black text-white p-3 flex-column flex-shrink-0 d-none d-md-flex ${collapsed ? "align-items-center" : ""
          } ${mobileVisible ? "d-flex position-absolute top-0 start-0 z-3 vh-100" : ""}`}
        style={{
          width: collapsed ? "80px" : "250px",
          height: "100vh",
          overflowY: "auto",
          fontSize: "1.1rem",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header: Icon + Search */}
        <div className="d-flex align-items-center justify-content-between mb-4 px-2 w-100">
          <FaFacebookF size={28} color="#1ecb73" className="me-3" />
          {!collapsed && (
            <div
              className="d-flex align-items-center bg-secondary rounded px-2 py-1 flex-grow-1"
            >
              <FaSearch className="text-white me-2" size={16} />
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
        <ul className="nav flex-column mb-4 w-100">
          {navItems.map(({ name, path, icon }) => (
            <li className="nav-item mb-2" key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive
                    ? "bg-dark text-white fw-bold"
                    : "text-white hover:bg-dark"
                  }`
                }
                style={{ fontSize: "1rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#222")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {icon}
                {!collapsed && name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Shortcuts */}
        {!collapsed && (
          <>
            <h6 className="text-uppercase px-2 text-white mb-3 border-bottom border-secondary" style={{ fontSize: "0.9rem" }}>
              Your Shortcuts
            </h6>
            <ul className="nav flex-column w-100">
              {shortcuts.map(({ name, path, icon }) => (
                <li className="nav-item mb-2" key={name}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive
                        ? "bg-dark text-white fw-bold"
                        : "text-white hover:bg-dark"
                      }`
                    }
                    style={{ fontSize: "1rem" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#222")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
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

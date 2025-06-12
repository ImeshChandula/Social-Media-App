import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaVideo,
  FaUserCircle,
  FaBell,
  FaFacebookF,
  FaSearch,
  FaSignOutAlt,
  FaEllipsisH,
} from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdContactSupport } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";
import useAuthStore from "../store/authStore";

function Sidebar() {
  const { authUser, logout } = useAuthStore();
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Members", path: "/members", icon: <FaUsers /> },
    { name: "Videos", path: "/videos", icon: <FaVideo /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
    { name: "Notification", path: "/notifications", icon: <FaBell />, className: "d-lg-none" },
    ...(authUser.role !== "user"
      ? [{ name: "Dashboard", path: "/dashboard", icon: <TbLayoutDashboardFilled /> }]
      : []),
  ];

  const shortcuts = [
    { name: "Contact us", path: "/contact", icon: <MdContactSupport /> },
    ...(authUser.accountStatus !== "active"
      ? [{ name: "Support", path: "/support", icon: <MdContactSupport /> }]
      : []),
    { name: "Market Place", path: "/market", icon: <FaShoppingBag /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="bg-black text-white p-3 flex-column position-fixed top-0 start-0 d-none d-md-flex"
        style={{
          width: "250px",
          height: "100vh",
          overflowY: "auto",
          zIndex: 999,
        }}
      >
        {/* Logo and Search */}
        <div className="d-flex align-items-center mb-4">
          <FaFacebookF size={28} color="#1ecb73" className="me-3" />
          <div className="d-flex align-items-center bg-secondary rounded px-2 py-1 flex-grow-1">
            <FaSearch className="text-white me-2" />
            <input
              type="text"
              placeholder="Search Facebook"
              className="form-control border-0 bg-transparent text-white p-0"
              style={{ fontSize: "0.95rem" }}
            />
          </div>
        </div>

        {/* Nav Links */}
        <ul className="nav flex-column mb-4">
          {navItems.map(({ name, path, icon, className = "" }) => (
            <li className={`nav-item mb-2 ${className}`} key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"
                  }`
                }
                style={{ fontSize: "1rem" }}
              >
                {icon} {name}
              </NavLink>
            </li>
          ))}
          <li className="nav-item mb-2">
            <button
              className="nav-link d-flex align-items-center gap-3 px-2 py-2 rounded text-white bg-transparent border-0 w-100 text-start"
              onClick={handleLogout}
              style={{ fontSize: "1rem" }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </li>
        </ul>

        {/* Shortcuts */}
        <h6 className="text-uppercase px-2 text-white mb-3 border-bottom border-secondary" style={{ fontSize: "0.9rem" }}>
          Your Shortcuts
        </h6>
        <ul className="nav flex-column">
          {shortcuts.map(({ name, path, icon }) => (
            <li className="nav-item mb-2" key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"
                  }`
                }
                style={{ fontSize: "1rem" }}
              >
                {icon} {name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Topbar */}
      <div
        className="bg-black text-white d-flex d-md-none justify-content-around align-items-center fixed-top w-100 py-2"
        style={{ zIndex: 999 }}
      >
        {/* Show only limited navs */}
        {["Home", "Members", "Profile", "Notification"].map((label) => {
          const item = navItems.find((i) => i.name === label);
          if (!item) return null;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `text-white d-flex flex-column align-items-center py-2 px-2 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"
                }`
              }
              style={{ fontSize: "0.95rem" }}
            >
              {item.icon}
              <small style={{ fontSize: "0.7rem" }}>{item.name}</small>
            </NavLink>
          );
        })}

        {/* More dropdown */}
        <div className="position-relative">
          <button
            className="bg-transparent border-0 text-white d-flex flex-column align-items-center"
            onClick={() => setShowMore(!showMore)}
          >
            <FaEllipsisH />
            <small style={{ fontSize: "0.7rem" }}>More</small>
          </button>
          {showMore && (
            <div
              className="position-absolute bg-dark text-white rounded shadow p-2"
              style={{ top: "100%", right: 0, zIndex: 1000, minWidth: "140px" }}
            >
              {navItems
                .filter((item) => !["Home", "Members", "Profile", "Notification"].includes(item.name))
                .map(({ name, path, icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-2 py-1 px-2 rounded text-white ${isActive ? "bg-secondary fw-bold" : ""
                      }`
                    }
                    onClick={() => setShowMore(false)}
                    style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
                  >
                    {icon} {name}
                  </NavLink>
                ))}
              <button
                onClick={() => {
                  handleLogout();
                  setShowMore(false);
                }}
                className="d-flex align-items-center gap-2 py-1 px-2 text-white bg-transparent border-0 w-100 text-start"
                style={{ fontSize: "0.85rem" }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;

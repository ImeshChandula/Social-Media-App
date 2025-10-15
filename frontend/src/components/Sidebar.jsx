import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaVideo,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaEllipsisH,
  FaSun,
  FaMoon,
  FaChartLine,
} from "react-icons/fa";
import { FiBold } from "react-icons/fi";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdContactSupport } from "react-icons/md";
import { FaShoppingBag } from "react-icons/fa";

import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";
import SearchPopup from "./SearchPopup";
import LogoutButton from "./LogoutButton";

function Sidebar() {
  const { authUser } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [showMore, setShowMore] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  const navItems = [
    { name: "Home", path: "/", icon: <FaHome /> },
    { name: "Members", path: "/members", icon: <FaUsers /> },
    { name: "Videos", path: "/videos", icon: <FaVideo /> },
    { name: "Profile", path: "/profile", icon: <FaUserCircle /> },
    { name: "Notification", path: "/notifications", icon: <FaBell />, className: "d-lg-none" },
    { name: "Business Center", path: "/business-center", icon: <FaShoppingBag /> },
    ...(authUser.role !== "user"
      ? [{ name: "Dashboard", path: "/dashboard", icon: <TbLayoutDashboardFilled /> }]
      : []),
  ];

  const BusinessTools = [
    { name: "Business Page", path: "/business-page", icon: <FaChartLine /> },
  ];

  const shortcuts = [
    { name: "Contact us", path: "/contact", icon: <MdContactSupport /> },
  ];

  // Theme classes
  const bgClass = isDarkMode ? "bg-black" : "bg-white";
  const textClass = isDarkMode ? "text-white" : "text-black";
  const bgSecondaryClass = isDarkMode ? "bg-gray-900" : "bg-gray-100";
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-300";
  const activeBgClass = isDarkMode ? "bg-gray-800" : "bg-gray-200";
  const shadowClass = isDarkMode ? "shadow-lg" : "shadow-md";
  const hoverClass = isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-300";

  return (
    <>
      {/* Search Popup */}
      <SearchPopup show={showSearchPopup} onClose={() => setShowSearchPopup(false)} />

      {/* Desktop Sidebar */}
      <div
        className={`${bgClass} ${textClass} p-3 flex-column position-fixed top-0 start-0 d-none d-md-flex`}
        style={{ width: "250px", height: "100vh", overflowY: "auto", zIndex: 999 }}
      >
        {/* Logo, Search and Theme Toggle */}
        <div className="d-flex align-items-center mb-4 justify-content-between">
          <FiBold
            size={28}
            color="#1ecb73"
            className="me-3 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              className={`nav-link d-flex align-items-center justify-content-center rounded-circle p-2 ${bgSecondaryClass} ${textClass}`}
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Search Button */}
            <button
              className={`nav-link d-flex align-items-center justify-content-center rounded-circle p-2 ${bgSecondaryClass} ${textClass}`}
              onClick={() => setShowSearchPopup(true)}
              title="Search"
            >
              <FaSearch size={19} />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <ul className="nav flex-column mb-4">
          {navItems.map(({ name, path, icon, className = "" }) => (
            <li className={`nav-item mb-2 ${className}`} key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${hoverClass} ${isActive ? `${activeBgClass} ${textClass} fw-bold` : textClass
                  }`
                }
                style={{ fontSize: "1rem" }}
              >
                {icon} {name}
              </NavLink>
            </li>
          ))}

          {/* ✅ Logout Button (desktop) */}
          <li className="nav-item mb-2">
            <LogoutButton className={`${hoverClass} ${textClass}`} />
          </li>
        </ul>

        {/* Business Tools */}
        <h6 className={`text-uppercase px-2 ${textClass} mb-3 border-bottom ${borderClass}`} style={{ fontSize: "0.9rem" }}>
          Business Tools
        </h6>
        <ul className="nav flex-column mb-4">
          {BusinessTools.map(({ name, path, icon }) => (
            <li className="nav-item mb-2" key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 py-1 px-2 rounded ${hoverClass} ${textClass} ${isActive ? `${activeBgClass} fw-bold` : ""
                  }`
                }
                onClick={() => setShowMore(false)}
                style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
              >
                {icon} {name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Shortcuts */}
        <h6 className={`text-uppercase px-2 ${textClass} mb-3 border-bottom ${borderClass}`} style={{ fontSize: "0.9rem" }}>
          Your Shortcuts
        </h6>
        <ul className="nav flex-column">
          {shortcuts.map(({ name, path, icon }) => (
            <li className="nav-item mb-2" key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `d-flex align-items-center gap-2 py-1 px-2 rounded ${hoverClass} ${textClass} ${isActive ? `${activeBgClass} fw-bold` : ""
                  }`
                }
                onClick={() => setShowMore(false)}
                style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
              >
                {icon} {name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile Topbar (Header) */}
      <div
        className={`mobile-topbar ${bgClass} ${textClass} d-flex d-md-none flex-column fixed-top w-100 py-2`}
        style={{ zIndex: 999 }}
      >
        {/* Logo, Search and Theme Toggle */}
        <div className="d-flex justify-content-between align-items-center px-3">

          <div className="d-flex align-items-center">
            <FiBold
              size={28}
              color="#1ecb73"
              className="cursor-pointer"
              onClick={() => navigate("/")}
            />
            <h5 className={`mb-0 fw-bold ${isDarkMode ? "text-white" : "text-black"}`} style={{ letterSpacing: "2px", marginTop: "3px" }}>
              uzads
            </h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Theme Toggle */}
            <button
              className={`bg-transparent border-0 ${textClass} d-flex align-items-center justify-content-center p-2`}
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

            {/* Search */}
            <button
              className={`bg-transparent border-0 ${textClass} d-flex align-items-center justify-content-center p-2`}
              onClick={() => setShowSearchPopup(true)}
              title="Search"
              aria-label="Search"
            >
              <FaSearch size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className={`mobile-bottom-nav ${bgClass} ${textClass} d-flex d-md-none justify-content-around align-items-center fixed-bottom py-2 border-top ${borderClass}`}
        style={{ zIndex: 999 }}
      >
        {["Home", "Business Center", "Profile", "Notification"].map((label) => {
          const item = navItems.find((i) => i.name === label);
          if (!item) return null;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${textClass} d-flex flex-column align-items-center px-2 ${isActive ? `${activeBgClass} fw-bold` : textClass}`
              }
              style={{ fontSize: "1.5rem", textDecoration: "none", borderRadius: "8px", padding: "6px" }}
            >
              {item.icon}
            </NavLink>
          );
        })}

        {/* More Dropdown */}
        <div className="position-relative" ref={moreRef}>
          <button
            className={`bg-transparent border-0 ${textClass} d-flex flex-column align-items-center px-2`}
            onClick={() => setShowMore((prev) => !prev)}
            style={{ fontSize: "1.2rem" }}
          >
            <FaEllipsisH />
          </button>

          {showMore && (
            <div
              className={`position-absolute ${bgClass} ${textClass} rounded ${shadowClass} p-2`}
              style={{ bottom: "100%", right: 0, zIndex: 1000, minWidth: "160px" }}
            >
              {navItems
                .filter((item) => !["Home", "Business Center", "Profile", "Notification"].includes(item.name))
                .map(({ name, path, icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-2 py-1 px-2 rounded ${textClass} ${isActive ? `${activeBgClass} fw-bold` : ""}`
                    }
                    onClick={() => setShowMore(false)}
                    style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
                  >
                    {icon} {name}
                  </NavLink>
                ))}

              {shortcuts.length > 0 && <hr className={`${textClass} my-2`} />}
              {shortcuts.map(({ name, path, icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `d-flex align-items-center gap-2 py-1 px-2 rounded ${textClass} ${isActive ? `${activeBgClass} fw-bold` : ""}`
                  }
                  onClick={() => setShowMore(false)}
                  style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
                >
                  {icon} {name}
                </NavLink>
              ))}

              {BusinessTools.length > 0 && <hr className={`${textClass} my-2`} />}
              {BusinessTools.map(({ name, path, icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `d-flex align-items-center gap-2 py-1 px-2 rounded ${textClass} ${isActive ? `${activeBgClass} fw-bold` : ""}`
                  }
                  onClick={() => setShowMore(false)}
                  style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
                >
                  {icon} {name}
                </NavLink>
              ))}

              <hr className={`${textClass} my-2`} />
              <LogoutButton className={textClass} onAfterLogout={() => setShowMore(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;

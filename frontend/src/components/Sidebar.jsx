import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import useAuthStore from "../store/authStore";
import SearchPopup from "./SearchPopup";

function Sidebar() {
  const { authUser, logout } = useAuthStore();
  const [showMore, setShowMore] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();

  const MySwal = withReactContent(Swal);

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

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
      background: "#1f2937",
      color: "#f9fafb",
      customClass: {
        popup: "swal2-popup-custom",
        title: "swal2-title-custom",
        htmlContainer: "swal2-html-custom",
        confirmButton: "swal2-confirm-custom",
        cancelButton: "swal2-cancel-custom",
      },
      heightAuto: false,
    });

    if (!result.isConfirmed) return;

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
    { name: "Market Place", path: "/market", icon: <FaShoppingBag /> },
  ];

  return (
    <>
      {/* Search Popup */}
      <SearchPopup show={showSearchPopup} onClose={() => setShowSearchPopup(false)} />

      {/* Desktop Sidebar */}
      <div
        className="bg-black text-white p-3 flex-column position-fixed top-0 start-0 d-none d-md-flex"
        style={{ width: "250px", height: "100vh", overflowY: "auto", zIndex: 999 }}
      >
        {/* Logo and Search */}
        <div className="d-flex align-items-center mb-4 justify-content-between">
          <FaFacebookF
            size={28}
            color="#1ecb73"
            className="me-3 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <button
            className="nav-link d-flex align-items-center justify-content-center rounded-circle p-2"
            onClick={() => setShowSearchPopup(true)}
            title="Search"
          >
            <FaSearch className="text-white" size={19} />
          </button>
        </div>

        {/* Nav Links */}
        <ul className="nav flex-column mb-4">
          {navItems.map(({ name, path, icon, className = "" }) => (
            <li className={`nav-item mb-2 ${className}`} key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"}`
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
                  `d-flex align-items-center gap-2 py-1 px-2 rounded text-white ${isActive ? "bg-secondary fw-bold" : ""}`
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

      {/* Mobile Topbar */}
      <div
        className="mobile-topbar bg-black text-white d-flex d-md-none flex-column fixed-top w-100 py-2"
        style={{ zIndex: 999 }}
      >
        {/* Logo and Search - New Section */}
        <div className="d-flex justify-content-between align-items-center px-3 mb-2">
          <FaFacebookF size={28} color="#1ecb73" className="cursor-pointer" onClick={() => navigate("/")} />
          <button
            className="bg-transparent border-0 text-white d-flex align-items-center justify-content-center p-2"
            onClick={() => setShowSearchPopup(true)}
            title="Search"
            aria-label="Search"
          >
            <FaSearch size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex justify-content-around px-2">
          {["Home", "Members", "Profile", "Notification"].map((label) => {
            const item = navItems.find((i) => i.name === label);
            if (!item) return null;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `text-white d-flex flex-column align-items-center py-2 px-1 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"}`
                }
                style={{ fontSize: "1rem", textDecoration: "none" }}
              >
                {item.icon}
                <small style={{ fontSize: "0.8rem" }}>{item.name}</small>
              </NavLink>
            );
          })}

          {/* More Dropdown */}
          <div className="position-relative" ref={moreRef}>
            <button
              className="bg-transparent border-0 text-white d-flex flex-column align-items-center py-2 px-1"
              onClick={() => setShowMore((prev) => !prev)}
              style={{ fontSize: "1rem" }}
            >
              <FaEllipsisH />
              <small style={{ fontSize: "0.8rem" }}>More</small>
            </button>
            {showMore && (
              <div
                className="position-absolute bg-black text-white rounded shadow p-2"
                style={{ top: "100%", right: 0, zIndex: 1000, minWidth: "160px" }}
              >
                {navItems
                  .filter((item) => !["Home", "Members", "Profile", "Notification"].includes(item.name))
                  .map(({ name, path, icon }) => (
                    <NavLink
                      key={name}
                      to={path}
                      className={({ isActive }) =>
                        `d-flex align-items-center gap-2 py-1 px-2 rounded text-white ${isActive ? "bg-secondary fw-bold" : ""}`
                      }
                      onClick={() => setShowMore(false)}
                      style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
                    >
                      {icon} {name}
                    </NavLink>
                  ))}

                {shortcuts.length > 0 && <hr className="text-white my-2" />}
                {shortcuts.map(({ name, path, icon }) => (
                  <NavLink
                    key={name}
                    to={path}
                    className={({ isActive }) =>
                      `d-flex align-items-center gap-2 py-1 px-2 rounded text-white ${isActive ? "bg-secondary fw-bold" : ""}`
                    }
                    onClick={() => setShowMore(false)}
                    style={{ fontSize: "1rem", whiteSpace: "nowrap", textDecoration: "none" }}
                  >
                    {icon} {name}
                  </NavLink>
                ))}

                <hr className="text-white my-2" />
                <button
                  onClick={() => {
                    handleLogout();
                    setShowMore(false);
                  }}
                  className="d-flex align-items-center gap-2 py-1 px-2 text-white bg-transparent border-0 w-100 text-start"
                  style={{ fontSize: "1rem", whiteSpace: "nowrap" }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

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
  return (
    <div
      className="bg-black text-white p-3 d-flex flex-column flex-shrink-0"
      style={{
        width:"300px",
        height: "100vh",
        overflowY: "auto",
        fontSize: "1.1rem",
        transition: "width 0.3s ease",
      }}
    >
      {/* Facebook Icon and Search */}
      <div
        className={`d-flex align-items-center mb-4 px-2 ${collapsed ? "justify-center" : ""}`}
      >
        <FaFacebookF size={32} color="#1ecb73" className="me-3" />
        {!collapsed && (
          <div
            className="d-flex align-items-center"
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: "8px",
              padding: "8px 12px",
              flexGrow: 1,
            }}
          >
            <FaSearch className="text-white me-2" size={18} />
            <input
              type="text"
              placeholder="Search Facebook"
              className="form-control border-0 bg-transparent text-white"
              style={{
                fontSize: "1rem",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* Nav Items */}
      <ul className="nav flex-column mb-5">
        {navItems.map(({ name, path, icon }) => (
          <li className="nav-item mb-3" key={name}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${
                  isActive
                    ? "bg-secondary text-success"
                    : "text-white hover:bg-dark"
                }`
              }
              style={{
                textDecoration: "none",
                fontSize: "1.05rem",
              }}
            >
              {icon}
              {!collapsed && name}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Shortcuts */}
      {!collapsed && (
        <h6
          className="px-2 mb-3"
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          Your Shortcuts
        </h6>
      )}

      <ul className="nav flex-column">
        {shortcuts.map(({ name, path, icon }) => (
          <li className="nav-item mb-3" key={name}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${
                  isActive
                    ? "bg-secondary text-success"
                    : "text-white hover:bg-dark"
                }`
              }
              style={{ textDecoration: "none", fontSize: "1.05rem" }}
            >
              {icon}
              {!collapsed && name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;

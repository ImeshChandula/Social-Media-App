import React from "react";
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

function Sidebar() {
  return (
    <div
      className="bg-black text-white p-3 d-flex flex-column flex-shrink-0"
      style={{
        width: "100%",
        maxWidth: "300px",
        height: "100vh",
        overflowY: "auto",
        fontSize: "1.1rem",
      }}
    >
      {/* Facebook Icon and Search Bar on One Line */}
<div className="d-flex align-items-center mb-4 px-3">
  {/* Facebook Icon */}
  <FaFacebookF size={32} color="#1ecb73" className="me-3" />
  
  {/* Search Bar */}
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
</div>


      {/* Main Navigation */}
      <ul className="nav flex-column mb-5">
  {navItems.map(({ name, path, icon }) => (
    <li className="nav-item mb-3" key={name}>
      <NavLink
        to={path}
        className={({ isActive }) =>
          `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded ${
            isActive
              ? "bg-secondary text-green-400" // Force Tailwind green color
              : "text-white hover:bg-dark"
          }`
        }
        style={{
          textDecoration: "none",
          fontSize: "1.05rem",
        }}
      >
        {icon}
        {name}
      </NavLink>
    </li>
  ))}
</ul>


      {/* Shortcuts Header */}
      <h6
        className="px-3 mb-3"
        style={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#ffffff",
        }}
      >
        Your Shortcuts
      </h6>

      {/* Shortcuts List */}
      <ul className="nav flex-column">
        {shortcuts.map(({ name, path, icon }) => (
          <li className="nav-item mb-3" key={name}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-3 px-3 py-2 rounded ${
                  isActive
                    ? "bg-secondary text-green-400"
                    : "text-white hover:bg-dark"
                }`
              }
              style={{ textDecoration: "none", fontSize: "1.05rem" }}
            >
              {icon}
              {name}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;

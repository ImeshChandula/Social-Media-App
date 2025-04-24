import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    { name: "Home", icon: "bi-house-door" },
    { name: "Members", icon: "bi-people" },
    { name: "Videos", icon: "bi-camera-video" },
    { name: "Notifications", icon: "bi-bell" },
    { name: "Profile", icon: "bi-person-circle" },
  ];

  return (
    <div className="bg-black text-white p-3 vh-100" style={{ maxWidth: "200px" }}>
      {/* Search Input (Only on md and up) */}

      {/* Navigation List */}
      <ul className="nav flex-column">
        {navItems.map(({ name, icon }) => (
          <li className="nav-item mb-2" key={name}>
            <NavLink
              to={name === "Home" ? "/" : `/${name.toLowerCase()}`}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 text-white ${
                  isActive ? "bg-secondary rounded fw-bold" : ""
                }`
              }
            >
              <i className={`bi ${icon} fs-5 text-white`}></i>
              <span className="d-none d-md-inline">{name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;

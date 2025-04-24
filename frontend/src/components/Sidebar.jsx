import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="bg-black text-white p-3" style={{ width: "200px" }}>
      <input
        className="form-control mb-3"
        type="text"
        placeholder="Search Facebook"
      />
      <ul className="nav flex-column">
        {["Home", "Members", "Videos", "Notifications", "Profile"].map((item) => (
          <li className="nav-item" key={item}>
            <NavLink
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "bg-secondary rounded fw-bold" : ""}`
              }
            >
              {item}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;

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

  return (<>
      <div className="bg-black text-white d-flex flex-md-column flex-row align-items-center p-2 gap-2 ">

        <ul className="nav flex-md-column flex-row w-100 justify-content-around justify-content-md-start">
          {navItems.map(({ name, icon }) => (
            <li className="nav-item mb-md-2 text-center text-md-start" key={name}>
              <NavLink
                to={name === "Home" ? "/" : `/${name.toLowerCase()}`}
                className={({ isActive }) =>
                  `nav-link d-flex flex-md-row flex-column align-items-center justify-content-start text-white gap-1 ${isActive ? "bg-secondary rounded fw-bold" : ""
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
    </>
  );
}

export default Sidebar;

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
    <>
      {/* Search only show in small display */}
      <div className="col-10 mt-2 px-3 mb-3 w-100 px-2 d-md-none">
        <input className="form-control" type="text" placeholder="Search Facebook" />
      </div>

      <div className="bg-black text-white d-flex flex-md-column flex-row align-items-center p-2 gap-2 ">

        {/* Search only show in large display */}
        <div className="mt-2 d-none d-md-block mb-3 w-100 px-2">
          <input className="form-control" type="text" placeholder="Search Facebook" />
        </div>

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

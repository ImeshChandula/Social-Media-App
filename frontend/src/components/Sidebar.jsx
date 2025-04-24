import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

function Sidebar() {
  const navItems = [
    { name: "Home", icon: "bi-house-door" },
    { name: "Members", icon: "bi-people" },
    { name: "Videos", icon: "bi-camera-video" },
    { name: "Notifications", icon: "bi-bell" },
    { name: "Profile", icon: "bi-person-circle" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 12,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      

      <motion.div className="bg-black text-white d-flex flex-md-column flex-row align-items-center p-2 gap-2 ">


        <motion.ul
          className="nav flex-md-column flex-row w-100 justify-content-around justify-content-md-start"
          variants={containerVariants}
        >
          {navItems.map(({ name, icon }) => (
            <motion.li
              className="nav-item mb-md-2 text-center text-md-start"
              key={name}
              variants={itemVariants}
            >
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
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </>
  );
}

export default Sidebar;
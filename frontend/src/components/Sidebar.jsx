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

	const sidebarVariants = {
		hidden: { x: -50, opacity: 0 },
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				type: "spring",
				stiffness: 70,
				damping: 10,
				delayChildren: 0.2,
				staggerChildren: 0.1,
			},
		},
	};

	const navItemVariants = {
		hidden: { opacity: 0, y: 10, scale: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: "spring", stiffness: 100, damping: 12 },
		},
		whileHover: {
			scale: 1.05,
			backgroundColor: "#343a40",
		},
	};

	return (
		<motion.div
			className="bg-black text-white d-flex flex-md-column flex-row align-items-center p-2 gap-2"
			style={{ width: "25vw", minHeight: "100vh" }}
			variants={sidebarVariants}
			initial="hidden"
			animate="visible"
		>
			<motion.ul
				className="nav flex-md-column flex-row w-100 justify-content-around justify-content-md-start"
				variants={sidebarVariants}
			>
				{navItems.map(({ name, icon }) => (
					<motion.li
						className="nav-item mb-md-2 text-center text-md-start"
						key={name}
						variants={navItemVariants}
						whileHover="whileHover"
					>
						<NavLink
							to={name === "Home" ? "/" : `/${name.toLowerCase()}`}
							className={({ isActive }) =>
								`nav-link d-flex flex-md-row flex-column align-items-center text-white gap-1 ${
									isActive ? "bg-secondary rounded fw-bold" : ""
								}`
							}
							style={{
								fontSize: "1.25rem", // Adjusted font size
								textDecoration: "none", // This removes the underline
							}}
						>
							<i className={`bi ${icon} fs-4 text-white`}></i> {/* Icon size adjusted */}
							<span className="d-none d-md-inline">{name}</span>
						</NavLink>
					</motion.li>
				))}
			</motion.ul>
		</motion.div>
	);
}

export default Sidebar;

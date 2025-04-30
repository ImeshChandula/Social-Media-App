import React from "react";
import { NavLink } from "react-router-dom";
import {
	FaHome,
	FaUsers,
	FaVideo,
	FaBell,
	FaUserCircle,
	FaSearch
} from "react-icons/fa";

const navItems = [
	{ name: "Home", path: "/", icon: <FaHome /> },
	{ name: "Members", path: "/members", icon: <FaUsers /> },
	{ name: "Videos", path: "/videos", icon: <FaVideo /> },
	{ name: "Notifications", path: "/notifications", icon: <FaBell /> },
	{ name: "Profile", path: "/profile", icon: <FaUserCircle /> },
];

function Sidebar() {
	return (
		<div className="bg-black text-white p-3" style={{ width: "220px" }}>
			<div className="row mb-4">
				<div className="input-group">
					<span className="input-group-text bg-dark border-0 text-white">
						<FaSearch />
					</span>
					<input
						className="form-control bg-dark border-0 text-white"
						type="text"
						placeholder="Search Facebook"
					/>
				</div>
			</div>

			<ul className="nav flex-column">
				{navItems.map(({ name, path, icon }) => (
					<li className="nav-item" key={name}>
						<NavLink
							to={path}
							className={({ isActive }) =>
								`nav-link d-flex align-items-center gap-2 text-white px-3 py-2 ${
									isActive ? "bg-secondary rounded" : "hover:bg-dark"
								}`
							}
							style={{ textDecoration: "none" }}
						>
							<span>{icon}</span>
							<span>{name}</span>
						</NavLink>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Sidebar;

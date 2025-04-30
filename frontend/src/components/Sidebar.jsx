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
				maxWidth: "250px",
				height: "100vh",
				overflowY: "auto",
			}}
		>
			{/* Search */}
			<div className="input-group mb-4">
				<span className="input-group-text bg-dark border-0 text-white">
					<FaSearch />
				</span>
				<input
					className="form-control bg-dark border-0 text-white"
					type="text"
					placeholder="Search Facebook"
				/>
			</div>

			{/* Main Navigation */}
			<ul className="nav flex-column mb-4">
				{navItems.map(({ name, path, icon }) => (
					<li className="nav-item" key={name}>
						<NavLink
							to={path}
							className={({ isActive }) =>
								`nav-link d-flex align-items-center gap-2 text-white px-3 py-2 ${isActive ? "bg-secondary rounded" : "hover:bg-dark"
								}`
							}
							style={{ textDecoration: "none" }}
						>
							{icon}
							{name}
						</NavLink>
					</li>
				))}
			</ul>

			{/* Shortcuts */}
			<h6 className="text-muted-dark px-3">Your Shortcuts</h6>
			<ul className="nav flex-column mb-4">
				{shortcuts.map(({ name, path, icon }) => (
					<li className="nav-item" key={name}>
						<NavLink
							to={path}
							className="nav-link d-flex align-items-center gap-2 text-white px-3 py-2 hover:bg-dark"
							style={{ textDecoration: "none" }}
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

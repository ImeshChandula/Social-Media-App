import { NavLink } from "react-router-dom";
import { FaFacebookF, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsFileEarmarkPostFill } from "react-icons/bs";
import { SiJoplin } from "react-icons/si";
import useAuthStore from "../store/authStore";

const SidebarDashboard = () => {
  const { authUser, logout } = useAuthStore();

  const shortcuts = [
    ...(authUser.role === "super_admin"
      ? [{ name: "Manage Users", path: "/dashboard/users", icon: <FaUsersGear /> }]
      : []),
    { name: "Manage Posts", path: "/dashboard/posts", icon: <BsFileEarmarkPostFill /> },
    { name: "Job Categories", path: "/dashboard/job-category", icon: <SiJoplin /> },
    { name: "Notification", path: "/dashboard/notifications", icon: <SiJoplin /> },
    { name: "Back to Home", path: "/", icon: <IoMdArrowRoundBack /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      {/* Horizontal Top Bar for Mobile */}
      <div className="d-none d-md-none flex-row align-items-center justify-content-between bg-black text-white px-3 py-2 w-100">
        <div className="d-flex align-items-center gap-2">
          <FaFacebookF size={24} color="#1ecb73" />
        </div>
        <div className="d-flex align-items-center bg-secondary rounded px-2 py-1 flex-grow-1 mx-3">
          <FaSearch className="text-white me-2" />
          <input
            type="text"
            placeholder="Search"
            className="form-control border-0 bg-transparent text-white p-0"
            style={{ fontSize: "0.9rem" }}
          />
        </div>
      </div>

      {/* Vertical Sidebar for Desktop */}
      <div
        className="bg-black text-white p-3 d-none d-md-flex flex-column"
        style={{
          width: "100%",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo and Search */}
        <div className="d-flex align-items-center mb-4">
          <FaFacebookF size={28} color="#1ecb73" className="me-3" />
          <div className="d-flex align-items-center bg-secondary rounded px-2 py-1 flex-grow-1">
            <FaSearch className="text-white me-2" />
            <input
              type="text"
              placeholder="Search Facebook"
              className="form-control border-0 bg-transparent text-white p-0"
              style={{ fontSize: "0.95rem" }}
            />
          </div>
        </div>

        {/* Shortcuts */}
        <h6 className="text-uppercase px-2 text-white mb-3 border-bottom border-secondary" style={{ fontSize: "0.9rem" }}>
          Your Shortcuts
        </h6>
        <ul className="nav flex-column">
          {shortcuts.map(({ name, path, icon }) => (
            <li className="nav-item mb-2" key={name}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${isActive ? "bg-dark text-white fw-bold" : "text-white"
                  }`
                }
                style={{ fontSize: "1rem" }}
              >
                {icon}
                {name}
              </NavLink>
            </li>
          ))}

          {/* Logout */}
          <li className="nav-item mb-2">
            <button
              className="nav-link d-flex align-items-center gap-3 px-2 py-2 rounded text-white bg-transparent border-0 w-100 text-start"
              onClick={handleLogout}
              style={{ fontSize: "1rem" }}
            >
              <FaSignOutAlt />
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Horizontal Top Bar for Mobile */}
      <div className="d-flex d-md-none flex-row align-items-center justify-content-between bg-black text-white px-3 py-2 w-100">
        <FaFacebookF size={24} color="#1ecb73" />
        <div className="flex-grow-1 mx-3" style={{ maxWidth: "250px" }}>
          <div className="d-flex align-items-center bg-secondary rounded px-2 py-1 w-100">
            <FaSearch className="text-white me-2" />
            <input
              type="text"
              placeholder="Search"
              className="form-control border-0 bg-transparent text-white p-0"
              style={{ fontSize: "0.9rem" }}
            />
          </div>
        </div>
      </div>

      <div className="d-flex d-md-none bg-black text-white overflow-auto px-2 py-2 gap-3">
        {shortcuts.map(({ name, path, icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `btn btn-sm d-flex flex-column align-items-center justify-content-center text-white ${isActive ? "bg-dark fw-bold" : ""
              }`
            }
            style={{ minWidth: "70px", fontSize: "0.8rem" }}
          >
            {icon}
            <small>{name}</small>
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="btn btn-sm d-flex flex-column align-items-center text-white"
          style={{ minWidth: "70px", fontSize: "0.8rem" }}
        >
          <FaSignOutAlt />
          <small>Logout</small>
        </button>
      </div>
    </div>
  );
};

export default SidebarDashboard;

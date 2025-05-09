import React from "react";
import {
  BsCameraVideo,
  BsSearch,
  BsGear,
  BsPeopleFill,
} from "react-icons/bs";

function RightSidebar() {
  const icons = [
    { Icon: BsPeopleFill, title: "Contacts" },
    { Icon: BsCameraVideo, title: "Video Chat" },
    { Icon: BsSearch, title: "Search" },
    { Icon: BsGear, title: "Settings" },
  ];

  const contacts = ["Alice", "Bob", "Charlie", "David"];

  return (
    <div
      className="flex-column bg-black text-white px-2 pt-3"
      style={{ width: "auto", height: "100vh", overflowY: "auto" }}
    >
      {/* Icons Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {icons.map(({ Icon, title }, index) => (
          <button
            key={index}
            className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "44px",
              height: "44px",
              border: "2px solid #fff",
              backgroundColor: "#444",
              transition: "all 0.3s",
            }}
          >
            <Icon size={20} color="white" />
          </button>
        ))}
      </div>

      {/* Sponsored Section */}
      <div className="mb-4">
        <h6 className="text-secondary mb-2">Sponsored</h6>
        <img
          src="https://via.placeholder.com/230x110"
          className="img-fluid rounded mb-2"
          alt="Ad"
        />
        <p className="small text-secondary text-center mb-0">Your ad here</p>
      </div>

      {/* Contacts Section */}
      <div>
        <h6 className="text-secondary mb-3">Contacts</h6>
        {contacts.map((name) => (
          <div
            key={name}
            className="d-flex align-items-center mb-3 py-1 px-2 rounded hover-shadow"
            style={{
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#222")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <i className="bi bi-person-circle fs-4 me-3 text-success"></i>
            <span className="fw-medium text-truncate">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RightSidebar;

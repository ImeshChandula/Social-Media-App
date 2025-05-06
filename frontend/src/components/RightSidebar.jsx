import React from "react";
import {
  BsCameraVideo,
  BsSearch,
  BsThreeDots,
  BsGear,
  BsPeopleFill,
} from "react-icons/bs";

function RightSidebar() {
  const icons = [
    { Icon: BsPeopleFill, title: "Contacts" },
    { Icon: BsCameraVideo, title: "Video Chat" },
    { Icon: BsSearch, title: "Search" },
    { Icon: BsGear, title: "Settings" },
    { Icon: BsThreeDots, title: "More Options" },
  ];

  return (
    <div
      className="bg-black text-white p-4"
      style={{ width: "300px", height: "100vh", overflowY: "auto" }}
    >
      {/* Centered row of clickable icons with tooltips */}
      <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
        {icons.map(({ Icon, title }, index) => (
          <button
            key={index}
            className="bg-dark border-0 rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "48px",   // Increased size for better visibility
              height: "48px",  // Increased size for better visibility
              padding: "0",
              border: "2px solid #fff", // White border for better contrast
              backgroundColor: "#444", // Default background color
              transition: "background-color 0.3s ease", // Smooth transition for hover effect
            }}
            title={title}
            onClick={() => alert(`${title} clicked`)} // Replace with real actions
            onMouseEnter={(e) => e.target.style.backgroundColor = "#00bcd4"} // Hover effect
            onMouseLeave={(e) => e.target.style.backgroundColor = "#444"} // Reset background color
          >
            <Icon size={24} color="white" /> {/* White color for the icon */}
          </button>
        ))}
      </div>

      {/* Sponsored Section */}
      <div className="mb-4">
        <h6 className="text-secondary mb-2">Sponsored</h6>
        <img
          src="https://via.placeholder.com/260x120"
          className="img-fluid rounded mb-2"
          alt="Ad"
        />
        <p className="small text-muted">Your ad here</p>
      </div>

      {/* Contacts List */}
      <div>
        {["Alice", "Bob", "Charlie", "David"].map((contact) => (
          <div
            key={contact}
            className="d-flex align-items-center mb-3 px-2 py-1"
          >
            <i className="bi bi-person-circle fs-4 me-3 text-success"></i>
            <span className="fw-medium fs-6">{contact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RightSidebar;

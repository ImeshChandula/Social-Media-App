import React from "react";

function Topbar() {
  return (
    <div className="d-flex align-items-center bg-dark px-3 py-2" style={{ height: "60px" }}>
      <input
        type="text"
        placeholder="Search Facebook"
        className="form-control text-start"
        style={{
          width: "250px",
          borderRadius: "20px",
          backgroundColor: "#e4e6eb",
          color: "#050505",
          border: "none",
          fontSize: "14px"
        }}
      />
    </div>
  );
}

export default Topbar;

import React, { useEffect, useState } from "react";

function Topbar() {
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowInput(true), 200);
  }, []);

  return (
    <div
      className="d-flex align-items-center px-4"
      style={{
        height: "60px",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "#0b2347",
        borderBottom: "1px solid #333",
      }}
    >
      <div
        style={{
          marginLeft: "20px",
          transition: "all 0.5s ease-in-out",
          transform: showInput ? "translateX(0)" : "translateX(-50px)",
          opacity: showInput ? 1 : 0,
        }}
      >
        <input
          type="text"
          placeholder="Search Facebook"
          className="form-control"
          style={{
            width: "250px",
            borderRadius: "30px",
            backgroundColor: "#d9d9d9",
            color: "#050505",
            border: "none",
            padding: "8px 16px",
            fontSize: "17px",
            fontWeight: "500",
          }}
        />
      </div>
    </div>
  );
}

export default Topbar;

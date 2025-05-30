import React from "react";

const StoriesPopup = ({ onEdit, onDelete }) => {
  return (
    <div
      className="position-absolute bg-secondary p-2 rounded shadow"
      style={{ right: 0, top: "100%", zIndex: 10 }}
    >
      <button className="dropdown-item text-white" onClick={onEdit}>
        ✏️ Edit
      </button>
      <button className="dropdown-item text-white" onClick={onDelete}>
        🗑️ Delete
      </button>
    </div>
  );
};

export default StoriesPopup;

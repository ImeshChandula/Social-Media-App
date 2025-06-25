import React from "react";

const StoriesPopup = ({ onEdit, onDelete }) => {
  return (
    <div
      className="position-absolute bg-dark border border-secondary p-2 rounded shadow"
      style={{ right: '10px', top: '100%', zIndex: 10, minWidth: '120px' }}
    >
      <button
        className="dropdown-item text-white py-2"
        onClick={onEdit}
      >
        ✏️ Edit Caption
      </button>
      <button
        className="dropdown-item text-white py-2"
        onClick={onDelete}
      >
        🗑️ Delete Story
      </button>
    </div>
  );
};

export default StoriesPopup;
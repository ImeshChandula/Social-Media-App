import React from "react";

const StoriesPopup = ({ onDelete, onEdit, isLoading }) => {
  return (
    <div 
      className="position-absolute bg-dark border rounded shadow-lg"
      style={{
        top: "100%",
        right: 0,
        minWidth: "120px",
        zIndex: 1060,
        marginTop: "4px",
        border: "1px solid #495057"
      }}
    >
      <div className="py-1">
        <button
          className="btn btn-sm w-100 text-start text-light d-flex align-items-center"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          disabled={isLoading}
          style={{
            border: "none",
            background: "transparent",
            padding: "8px 16px",
            fontSize: "14px"
          }}
        >
          <span className="me-2">✏️</span>
          Edit
        </button>
        
        <button
          className="btn btn-sm w-100 text-start text-danger d-flex align-items-center"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={isLoading}
          style={{
            border: "none",
            background: "transparent",
            padding: "8px 16px",
            fontSize: "14px"
          }}
        >
          <span className="me-2">🗑️</span>
          {isLoading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default StoriesPopup;
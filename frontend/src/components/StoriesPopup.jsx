
import React from 'react';

const StoriesPopup = ({ onEdit, onDelete }) => {
  return (
    <div
      className="position-absolute bg-dark text-white shadow rounded"
      style={{
        top: '40px',
        right: '0',
        zZIndex: 1000,
        minWidth: '120px',
        border: '1px solid #333',
      }}
    >
      <ul className="list-unstyled m-0 p-2">
        <li>
          <button
            className="btn btn-sm text-white w-100 text-start"
            onClick={onEdit}
          >
            Edit Story
          </button>
        </li>
        <li>
          <button
            className="btn btn-sm text-danger w-100 text-start"
            onClick={onDelete}
          >
            Delete Story
          </button>
        </li>
      </ul>
    </div>
  );
};

export default StoriesPopup;

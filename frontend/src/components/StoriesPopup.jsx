
// import React from 'react';

// const StoriesPopup = ({ onEdit, onDelete }) => {
//   return (
//     <div
//       className="position-absolute bg-dark text-white shadow rounded"
//       style={{
//         top: '40px',
//         right: '0',
//         zZIndex: 1000,
//         minWidth: '120px',
//         border: '1px solid #333',
//       }}
//     >
//       <ul className="list-unstyled m-0 p-2">
//         <li>
//           <button
//             className="btn btn-sm text-white w-100 text-start"
//             onClick={onEdit}
//           >
//             Edit Story
//           </button>
//         </li>
//         <li>
//           <button
//             className="btn btn-sm text-danger w-100 text-start"
//             onClick={onDelete}
//           >
//             Delete Story
//           </button>
//         </li>
//       </ul>
//     </div>
//   );
// };

// export default StoriesPopup;

//new --------------------------------------

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
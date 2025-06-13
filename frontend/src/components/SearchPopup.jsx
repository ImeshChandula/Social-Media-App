import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SearchPopup({ show, onClose }) {
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 2000 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={popupRef}
            className="bg-white rounded p-4 shadow"
            style={{ width: "90%", maxWidth: "500px" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-black fw-bold">Search Users By Username</h5>
              <button
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              autoFocus
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchPopup;

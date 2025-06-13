import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

function SearchPopup({ show, onClose }) {
    const popupRef = useRef(null);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(6px)",
                        zIndex: 2000,
                        paddingTop: "3rem",
                        overflowY: "auto",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={popupRef}
                        className="bg-white rounded shadow"
                        style={{
                            width: "90%",
                            maxWidth: "480px",
                            position: "relative",
                            padding: "1.5rem",
                            marginBottom: "1.5rem",
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0 text-black fw-bold">Search Users</h5>
                            <button
                                className="close-button"
                                onClick={onClose}
                                aria-label="Close"
                                style={{ fontSize: "1.25rem", lineHeight: 1 }}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="position-relative">
                            <FaSearch
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "12px",
                                    transform: "translateY(-50%)",
                                    color: "#888",
                                    pointerEvents: "none",
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Enter Username"
                                className="form-control ps-5"
                                autoFocus
                                style={{
                                    borderRadius: "0.375rem",
                                    borderColor: "#ddd",
                                    transition: "border-color 0.3s",
                                    fontSize: "1rem",
                                    height: "2.5rem",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SearchPopup;

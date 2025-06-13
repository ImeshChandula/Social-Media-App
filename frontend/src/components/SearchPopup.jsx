import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

function SearchPopup({ show, onClose }) {
    const popupRef = useRef(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            searchUsers(query);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const searchUsers = async (searchText) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(searchText)}&limit=10`);
            setResults(res.data.users || []);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (id) => {
        onClose();
        navigate(`/profile/${id}`);
    };

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
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="position-relative mb-3">
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
                                placeholder="Enter username"
                                className="form-control ps-5"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                style={{
                                    borderRadius: "0.375rem",
                                    borderColor: "#ddd",
                                    fontSize: "1rem",
                                    height: "2.5rem",
                                }}
                            />
                        </div>

                        {loading &&
                            <p className="text-black text-center fw-bold">
                                Searching<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
                            </p>
                        }

                        {!loading && results.length > 0 && (
                            <ul className="list-group">
                                {results.map((user) => (
                                    <li
                                        key={user.id}
                                        className="list-group-item list-group-item-action d-flex align-items-center"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleUserClick(user.id)}
                                    >
                                        <img
                                            src={user.profilePicture}
                                            className="rounded-circle me-2 border border-primary border-2"
                                            style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <div className="fw-bold text-black">{user.firstName} {user.lastName}</div>
                                            <div className="text-muted">@{user.username}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!loading && query && results.length === 0 && (
                            <p className="text-muted mt-2">No users found for "{query}"</p>
                        )}

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SearchPopup;

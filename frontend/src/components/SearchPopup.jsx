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
                    className="search-popup-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={popupRef}
                        className="search-popup-card shadow"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        <div className="search-popup-header">
                            <h5>Search Users</h5>
                            <button className="search-popup-close" onClick={onClose} aria-label="Close">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="search-popup-input-wrapper">
                            <FaSearch className="search-popup-icon" />
                            <input
                                type="text"
                                placeholder="Enter username"
                                className="search-popup-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {loading && (
                            <p className="text-center fw-bold text-white">
                                Searching<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
                            </p>
                        )}

                        {!loading && results.length > 0 && (
                            <AnimatePresence>
                                <ul className="list-unstyled search-popup-list">
                                    {results.map((user, index) => (
                                        <motion.li
                                            key={user.id}
                                            className="search-popup-item d-flex align-items-center p-2 cursor-pointer"
                                            onClick={() => handleUserClick(user.id)}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            layout
                                        >
                                            <img
                                                src={user.profilePicture}
                                                className="rounded-circle me-3 border border-primary border-2"
                                                style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                            />
                                            <div>
                                                <div className="fw-bold text-white">{user.firstName} {user.lastName}</div>
                                                <div className="text-white-50">@{user.username}</div>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </AnimatePresence>
                        )}

                        {!loading && query && results.length === 0 && (
                            <p className="text-white-50 mt-2 text-center">No users found for "{query}"</p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SearchPopup;

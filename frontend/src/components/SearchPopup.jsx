import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaSun, FaMoon } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import useThemeStore from "../store/themeStore";

function SearchPopup({ show, onClose }) {
    const popupRef = useRef(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allResults, setAllResults] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (!query.trim()) {
            setAllResults([]);
            setResults([]);
            setVisibleCount(20);
            return;
        }

        const delayDebounce = setTimeout(() => {
            searchUsers(query);
        }, 400); // snappier debounce

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const searchUsers = async (searchText) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `/users/search?q=${encodeURIComponent(searchText)}&limit=100`
            );
            const all = res.data.users || [];
            setAllResults(all);
            setResults(all.slice(0, 20));
            setVisibleCount(20);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleShowMore = () => {
        const newCount = visibleCount + 20;
        setResults(allResults.slice(0, newCount));
        setVisibleCount(newCount);
    };

    const handleUserClick = (id) => {
        onClose();
        navigate(`/profile/${id}`);
    };

    const handleClose = () => {
        setQuery("");
        setResults([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="pt-4 fixed inset-0 z-[2000] flex justify-center items-start bg-black/70 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={popupRef}
                        className={`relative w-11/12 max-w-md rounded-2xl shadow-xl border p-6 
              ${isDarkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}`}
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center pt-2 px-2">
                            <h5 className="font-bold text-lg">Search Users</h5>
                            <button
                                className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                                onClick={handleClose}
                                aria-label="Close"
                            >
                                <FaTimes className="text-lg" />
                            </button>
                        </div>

                        {/* Input + Theme toggle */}
                        <div className="flex gap-2 mb-4 px-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by username..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className={`w-full h-11 pl-10 pr-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition 
                    ${isDarkMode
                                            ? "bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:border-blue-500 focus:ring-blue-500"
                                            : "bg-gray-100 border-gray-300 placeholder-gray-500 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                        }`}
                                    autoFocus
                                />
                                <FaSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                            </div>
                            <button
                                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition 
                  ${isDarkMode
                                        ? "border-gray-700 hover:bg-gray-800"
                                        : "border-gray-300 hover:bg-gray-200"
                                    }`}
                                onClick={toggleTheme}
                                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {isDarkMode ? <FaSun /> : <FaMoon />}
                            </button>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <p
                                className={`text-center font-medium animate-pulse ${isDarkMode ? "text-gray-300" : "text-gray-600"
                                    }`}
                            >
                                Searching...
                            </p>
                        )}

                        {/* Results */}
                        {!loading && results.length > 0 && (
                            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {results.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors
                      ${isDarkMode
                                                ? "bg-gray-800 hover:bg-gray-700"
                                                : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                        onClick={() => handleUserClick(user.id)}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <img
                                            src={user.profilePicture}
                                            alt={user.username}
                                            className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
                                        />
                                        <div>
                                            <div className="font-semibold leading-tight">
                                                {user.firstName} {user.lastName}
                                            </div>
                                            <div className="text-sm text-gray-400">@{user.username}</div>
                                        </div>
                                    </motion.div>
                                ))}

                                {visibleCount < allResults.length && (
                                    <div className="text-center pt-2">
                                        <button
                                            className="text-sm font-medium text-blue-500 hover:underline"
                                            onClick={handleShowMore}
                                        >
                                            Show More
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Results */}
                        {!loading && query && results.length === 0 && (
                            <p className="text-center text-gray-400 mt-4">
                                No users found for <span className="font-semibold">"{query}"</span>
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SearchPopup;

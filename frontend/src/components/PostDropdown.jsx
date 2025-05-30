import React, { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const PostDropdown = ({ onUpdate, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn btn-dark"
                onClick={() => setShowDropdown((prev) => !prev)}
            >
                <BsThreeDotsVertical size={24}/>
            </button>

            {showDropdown && (
                <ul
                    className="dropdown-menu show bg-dark border border-secondary shadow rounded-3 p-0"
                    style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        zIndex: 1000,
                        minWidth: "120px",
                    }}
                >
                    <li>
                        <button className="dropdown-item text-warning" onClick={onUpdate}>
                            Update
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item text-danger" onClick={onDelete}>
                            Delete
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default PostDropdown;

import React, { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import PostDeleteButton from "./PostDeleteButton";
import { FiEdit } from "react-icons/fi";

const PostDropdown = ({ postId, onDelete }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleUpdate = () => {
        navigate(`/edit-post/${postId}`);
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button className="dropdown-btn" onClick={() => setShowDropdown((prev) => !prev)} type="button">
                <BsThreeDotsVertical size={24} />
            </button>

            {showDropdown && (
                <ul
                    className="dropdown-menu show shadow"
                    style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        zIndex: 1000,
                        minWidth: "130px",
                    }}
                >
                    <li>
                        <button className="dropdown-item text-warning d-flex align-items-center gap-2" onClick={handleUpdate} type="button">
                            <FiEdit size={16} />
                            Update
                        </button>
                    </li>
                    <li>
                        <PostDeleteButton postId={postId} onDeleteSuccess={onDelete?.handler} />
                    </li>
                </ul>
            )}
        </div>
    );
};

export default PostDropdown;

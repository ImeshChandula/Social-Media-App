import React, { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import MarketplaceItemDeleteButton from "./MarketplaceItemDeleteButton";

const MarketplaceItemDropdown = ({ itemId, onDelete }) => {
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

    const handleEdit = () => {
        navigate(`/edit-marketplace-item/${itemId}`);
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button className="btn btn-sm btn-light" onClick={() => setShowDropdown((prev) => !prev)} type="button">
                <BsThreeDotsVertical size={20} />
            </button>

            {showDropdown && (
                <ul
                    className="dropdown-menu show bg-white border shadow-sm rounded p-0"
                    style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        zIndex: 1000,
                        minWidth: "140px",
                    }}
                >
                    <li>
                        <button className="dropdown-item text-warning" onClick={handleEdit} type="button">
                            Edit
                        </button>
                    </li>
                    <li>
                        <MarketplaceItemDeleteButton itemId={itemId} onDeleteSuccess={onDelete} />
                    </li>
                </ul>
            )}
        </div>
    );
};

export default MarketplaceItemDropdown;

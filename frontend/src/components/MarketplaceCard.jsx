import React, { useState } from "react";
import MarketplaceItemButton from "./MarketplaceItemButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const MarketplaceCard = ({
    item,
    authUser,
    onStatusChange,
    showCategory = false,
    showAllDetails = false,
    showContactDetails = false,
    showActions = false,
    showEdit = true,
    showAuthor = true,
    showTags = true,
    isMyProductView = false,
    isUser = false,
    onDelete = () => { },
}) => {
    const [isToggling, setIsToggling] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Fix: Handle empty images array properly
    const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [];
    const [localItem, setLocalItem] = useState(item);

    const handleToggle = async (field) => {
        try {
            setIsToggling(true);
            const updatedValue = !localItem[field];
            await axiosInstance.patch(`/marketplace/update/${localItem.id}`, {
                [field]: updatedValue,
            });

            // Update local state
            setLocalItem((prev) => ({ ...prev, [field]: updatedValue }));

            toast.success(`${field} updated to ${updatedValue}`);
            if (onStatusChange) onStatusChange();
        } catch (error) {
            toast.error(`Failed to update ${field}`);
            console.error(`Failed to update ${field}:`, error.response?.data?.message || error.message);
        } finally {
            setIsToggling(false);
        }
    };

    const isAdmin = authUser?.role === "admin" || authUser?.role === "super_admin";

    const handlePrev = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    // Fix: Safe date formatting function
    const formatDate = (date) => {
        if (!date) return "N/A";
        
        try {
            let dateObj;
            if (typeof date === "object" && date._seconds) {
                dateObj = new Date(date._seconds * 1000);
            } else {
                dateObj = new Date(date);
            }
            
            if (isNaN(dateObj.getTime())) {
                return "Invalid Date";
            }
            
            return dateObj.toLocaleDateString();
        } catch (error) {
            console.error("Date formatting error:", error);
            return "Invalid Date";
        }
    };

    return (
        <motion.div
            className="col-lg-4 col-md-6 col-sm-12 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div className={`marketplace-card card shadow-sm h-100 ${["expired", "removed"].includes(localItem.status) ? "border-danger border-2" : ""}`}>
                {(showAuthor && localItem.author) || showActions ? (
                    <div className="card-header d-flex justify-content-between align-items-center bg-light">
                        <div className="d-flex align-items-center">
                            {localItem.author && showAuthor && (
                                <>
                                    <motion.img
                                        src={localItem.author.profilePicture}
                                        alt={localItem.author.username}
                                        className="rounded-circle me-2"
                                        width="40"
                                        height="40"
                                        style={{ objectFit: "cover" }}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <div>
                                        <div className="text-dark fw-semibold">{localItem.author.username}</div>
                                        <small className="text-muted">Created: {formatDate(localItem.createdAt)}</small>
                                        <br />
                                        <small className="text-muted">Expires: {formatDate(localItem.expiresAt)}</small>
                                    </div>
                                </>
                            )}
                        </div>
                        <span
                            className={`badge text-capitalize px-3 py-1 ${localItem.status === "active"
                                ? "bg-success"
                                : localItem.status === "expired" || localItem.status === "removed"
                                    ? "bg-danger"
                                    : localItem.status === "pending"
                                        ? "bg-warning text-dark"
                                        : "bg-secondary"
                                }`}
                        >
                            {localItem.status}
                        </span>
                    </div>
                ) : null}

                {/* Custom image carousel */}
                <div>
                    {["expired", "removed"].includes(localItem.status) && (
                        <motion.div
                            className="bg-danger text-white text-center py-1 fw-bold"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {localItem.status.toUpperCase()}
                        </motion.div>
                    )}
                    
                    {/* Fix: Show placeholder when no images */}
                    <div className="position-relative">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${localItem.title}-${currentImageIndex}`}
                                    className="w-100"
                                    style={{ objectFit: "contain", height: "200px" }}
                                />
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrev}
                                            className="bg-light text-black position-absolute"
                                            style={{ top: "50%", left: "10px", transform: "translateY(-50%)" }}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="bg-light text-black position-absolute"
                                            style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div 
                                className="w-100 d-flex align-items-center justify-content-center bg-light text-muted"
                                style={{ height: "200px" }}
                            >
                                <div className="text-center">
                                    <i className="fas fa-image fa-3x mb-2"></i>
                                    <p>No Image Available</p>
                                </div>
                            </div>
                        )}
                        
                        {localItem.isNegotiable && (
                            <motion.span
                                className="position-absolute"
                                style={{
                                    bottom: "12px",
                                    right: "12px",
                                    backgroundColor: "rgb(255, 0, 0)",
                                    color: "white",
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontSize: "0.85rem",
                                    fontWeight: "600",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                    userSelect: "none",
                                    pointerEvents: "none",
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                Negotiable
                            </motion.span>
                        )}
                    </div>
                </div>

                <div className="card-body d-flex flex-column">
                    <motion.h5
                        className="card-title fw-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {localItem.title}
                    </motion.h5>

                    {showCategory && (
                        <h6 className="card-subtitle mb-2 text-muted">{localItem.category}</h6>
                    )}

                    <p className="card-text text-secondary small flex-grow-1">
                        {localItem.description || "No description available"}
                    </p>

                    <p className="fw-bold text-primary mt-auto">
                        {localItem.currency} {localItem.price}
                    </p>

                    {showAllDetails && (() => {
                        const hasLocation =
                            localItem.location?.city ||
                            localItem.location?.state ||
                            localItem.location?.country;
                        const hasQuantity =
                            localItem.quantity !== undefined && localItem.quantity !== null;
                        const hasCondition = localItem.conditionType;
                        const hasTags = showTags && localItem.tags && localItem.tags.length > 0;

                        if (hasLocation || hasQuantity || hasCondition || hasTags) {
                            return (
                                <div className="mt-3 border-top pt-3">
                                    <h6 className="fw-semibold text-dark mb-3">Item Details</h6>
                                    <div className="row gy-2">
                                        {hasLocation && (
                                            <div className="col-md-6">
                                                <p className="mb-1 fw-bold text-muted">Location</p>
                                                <p>
                                                    {[
                                                        localItem.location?.city,
                                                        localItem.location?.state,
                                                        localItem.location?.country,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        )}
                                        {hasQuantity && (
                                            <div className="col-md-6">
                                                <p className="mb-1 fw-bold text-muted">Quantity</p>
                                                <p>{localItem.quantity}</p>
                                            </div>
                                        )}
                                        {hasCondition && (
                                            <div className="col-md-6">
                                                <p className="mb-1 fw-bold text-muted">Condition</p>
                                                <p className="text-capitalize">{localItem.conditionType}</p>
                                            </div>
                                        )}
                                        {hasTags && (
                                            <div className="col-12">
                                                <p className="mb-1 fw-bold text-muted">Tags</p>
                                                <p>{localItem.tags.join(", ")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {showContactDetails && localItem.contactDetails && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-3">Contact Details</h6>
                            <div className="row gy-2">
                                {localItem.contactDetails?.phone && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">Phone</span>
                                            <a
                                                href={`tel:${localItem.contactDetails.phone}`}
                                                className="text-dark text-decoration-none"
                                            >
                                                {localItem.contactDetails.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {localItem.contactDetails?.email && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">Email</span>
                                            <a
                                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(localItem.contactDetails.email)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-dark text-decoration-none"
                                            >
                                                {localItem.contactDetails.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {localItem.contactDetails?.whatsapp && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">WhatsApp</span>
                                            <a
                                                href={`https://wa.me/${localItem.contactDetails.whatsapp.replace(/\D/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-dark text-decoration-none"
                                            >
                                                {localItem.contactDetails.whatsapp}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Toggles */}
                    {(isAdmin || isUser) && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-2">Controls</h6>

                            {isUser && (
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={localItem.isAvailable || false}
                                        onChange={() => handleToggle("isAvailable")}
                                        disabled={isToggling}
                                    />
                                    <label className="form-check-label">Available</label>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={localItem.isAccept || false}
                                        onChange={() => handleToggle("isAccept")}
                                        disabled={isToggling}
                                    />
                                    <label className="form-check-label">Accepted</label>
                                </div>
                            )}
                        </div>
                    )}

                    <motion.div layout className="position-relative">
                        <AnimatePresence mode="wait">
                            {isMyProductView && (!localItem.isAvailable || !localItem.isAccept) && (
                                <motion.div
                                    key="status-banner"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-warning text-dark text-center rounded py-1 fw-bold mt-2"
                                >
                                    {!localItem.isAvailable && "Not Available"}
                                    {!localItem.isAvailable && !localItem.isAccept && " | "}
                                    {!localItem.isAccept && "Not Yet Accepted"}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {showActions && (
                    <div className="card-footer bg-white border-top">
                        <MarketplaceItemButton
                            itemId={localItem.id}
                            onDelete={onDelete}
                            showEdit={showEdit}
                        />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default MarketplaceCard;
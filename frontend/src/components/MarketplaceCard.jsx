import React, { useState } from "react";
import MarketplaceItemButton from "./MarketplaceItemButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

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
    onDelete = () => { },
}) => {
    const [isToggling, setIsToggling] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = Array.isArray(item.images) ? item.images : [item.images];

    const handleToggle = async (field) => {
        try {
            setIsToggling(true);
            const updatedValue = !item[field];
            await axiosInstance.patch(`/marketplace/update/${item.id}`, {
                [field]: updatedValue,
            });

            toast.success(`${field} updated to ${updatedValue}`);
            if (onStatusChange) onStatusChange();
        } catch (error) {
            toast.error(`Failed to update ${field}`);
            console.log(`Failed to update ${field}: ${error.response?.data?.message || error.message}`);
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

    return (
        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div className={`marketplace-card card shadow-sm h-100 ${["expired", "removed"].includes(item.status) ? "border-danger border-2" : ""}`}>
                {(showAuthor && item.author) || showActions ? (
                    <div className="card-header d-flex justify-content-between align-items-center bg-light">
                        <div className="d-flex align-items-center">
                            {item.author && showAuthor && (
                                <>
                                    <img
                                        src={item.author.profilePicture}
                                        alt={item.author.username}
                                        className="rounded-circle me-2"
                                        width="40"
                                        height="40"
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div>
                                        <div className="text-dark fw-semibold"> {item.author.username} </div>
                                        <small className="text-muted"> {new Date(item.createdAt).toLocaleDateString()} </small>
                                        <br />
                                        <small className="text-muted">
                                            {item.expiresAt
                                                ? new Date(
                                                    typeof item.expiresAt === "object" && item.expiresAt._seconds
                                                        ? item.expiresAt._seconds * 1000
                                                        : item.expiresAt
                                                ).toLocaleDateString()
                                                : "N/A"}
                                        </small>
                                    </div>
                                </>
                            )}
                        </div>
                        <span
                            className={`badge text-capitalize px-3 py-1 ${item.status === "active"
                                ? "bg-success"
                                : item.status === "expired" || item.status === "removed"
                                    ? "bg-danger"
                                    : item.status === "pending"
                                        ? "bg-warning text-dark"
                                        : "bg-secondary"
                                }`}
                        >
                            {item.status}
                        </span>
                    </div>
                ) : null}

                {/* Custom image carousel */}
                {images.length > 0 && (
                    <div>
                        {["expired", "removed"].includes(item.status) && (
                            <div className="bg-danger text-white text-center py-1 fw-bold">
                                {item.status.toUpperCase()}
                            </div>
                        )}
                        <div className="position-relative">
                            <img
                                src={images[currentImageIndex]}
                                alt={`${item.title}-${currentImageIndex}`}
                                className="w-100"
                                style={{ objectFit: "contain", height: "200px" }}
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="bg-dark text-white position-absolute"
                                        style={{ top: "50%", left: "10px", transform: "translateY(-50%)" }}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="bg-dark text-white position-absolute"
                                        style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </>
                            )}
                            {item.isNegotiable && (
                                <span
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
                                >
                                    Negotiable
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-semibold">{item.title}</h5>

                    {showCategory && (
                        <h6 className="card-subtitle mb-2 text-muted">{item.category}</h6>
                    )}

                    <p className="card-text text-secondary small flex-grow-1">
                        {item.description}
                    </p>

                    <p className="fw-bold text-primary mt-auto">
                        {item.currency} {item.price}
                    </p>

                    {showAllDetails && (() => {
                        const hasLocation =
                            item.location?.city ||
                            item.location?.state ||
                            item.location?.country;
                        const hasQuantity =
                            item.quantity !== undefined && item.quantity !== null;
                        const hasCondition = item.conditionType;
                        const hasTags = showTags && item.tags && item.tags.length > 0;

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
                                                        item.location?.city,
                                                        item.location?.state,
                                                        item.location?.country,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        )}
                                        {hasQuantity && (
                                            <div className="col-md-6">
                                                <p className="mb-1 fw-bold text-muted">Quantity</p>
                                                <p>{item.quantity}</p>
                                            </div>
                                        )}
                                        {hasCondition && (
                                            <div className="col-md-6">
                                                <p className="mb-1 fw-bold text-muted">Condition</p>
                                                <p>{item.conditionType}</p>
                                            </div>
                                        )}
                                        {hasTags && (
                                            <div className="col-12">
                                                <p className="mb-1 fw-bold text-muted">Tags</p>
                                                <p>{item.tags.join(", ")}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {showContactDetails && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-3">Contact Details</h6>
                            <div className="row gy-2">
                                {item.contactDetails?.phone && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">Phone</span>
                                            <span className="text-dark">{item.contactDetails.phone}</span>
                                        </div>
                                    </div>
                                )}
                                {item.contactDetails?.email && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">Email</span>
                                            <span className="text-dark">{item.contactDetails.email}</span>
                                        </div>
                                    </div>
                                )}
                                {item.contactDetails?.whatsapp && (
                                    <div className="col-12">
                                        <div className="d-flex flex-column">
                                            <span className="text-muted small fw-bold">Whatsapp</span>
                                            <span className="text-dark">{item.contactDetails.whatsapp}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin Toggles */}
                    {(isAdmin || isMyProductView) && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-2">Controls</h6>

                            {isMyProductView && (
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={item.isAvailable}
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
                                        checked={item.isAccept}
                                        onChange={() => handleToggle("isAccept")}
                                        disabled={isToggling}
                                    />
                                    <label className="form-check-label">Accepted</label>
                                </div>
                            )}
                        </div>
                    )}

                    {isMyProductView && (!item.isAvailable || !item.isAccept) && (
                        <div className="bg-warning text-dark text-center py-1 fw-bold mt-2">
                            {!item.isAvailable && "Not Available"}
                            {!item.isAvailable && !item.isAccept && " | "}
                            {!item.isAccept && "Not Yet Accepted"}
                        </div>
                    )}
                </div>

                {showActions && (
                    <div className="card-footer bg-white border-top">
                        <MarketplaceItemButton
                            itemId={item.id}
                            onDelete={onDelete}
                            showEdit={showEdit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceCard;

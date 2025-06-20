import React from "react";
import MarketplaceItemButton from "./MarketplaceItemButton";

const MarketplaceCard = ({
    item,
    showAuthor = true,
    showCategory = false,
    showAllDetails = false,
    showContactDetails = false,
    showActions = false,
    showTags = true,
    onDelete = () => { },
}) => {
    return (
        <div className="col-lg-4 col-md-6 col-sm-12 mb-4">
            <div className="marketplace-card card shadow-sm h-100">
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
                                        <div className="text-dark fw-semibold">{item.author.username}</div>
                                        <small className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</small>
                                        <small className="text-muted">{new Date(item.expiresAt).toLocaleDateString()}</small>
                                    </div>
                                </>
                            )}
                        </div>
                        <span className={`badge text-capitalize px-3 py-1  ${item.status === 'active' ? 'bg-success' :
                            item.status === 'expired' || item.status === 'removed' ? 'bg-danger' :
                                item.status === 'pending' ? 'bg-warning text-dark' :
                                    item.status === 'sold' ? 'bg-secondary' : 'bg-secondary'}`}>
                            {item.status}
                        </span>
                    </div>
                ) : null}

                {item.images?.length > 0 && (
                    <div className="position-relative">
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="marketplace-image w-100"
                            style={{ objectFit: "contain", height: "200px" }}
                        />
                        {item.isNegotiable && (
                            <span
                                className="position-absolute d-flex align-items-center justify-content-center"
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
                )}

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-semibold">{item.title}</h5>

                    {showCategory && (
                        <h6 className="card-subtitle mb-2 text-muted">{item.category}</h6>
                    )}

                    <p className="card-text text-secondary small flex-grow-1">{item.description}</p>

                    <p className="fw-bold text-primary mt-auto">{item.currency} {item.price}</p>

                    {showAllDetails && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-3">Item Details</h6>
                            <div className="row gy-2">
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Location</p>
                                    <p>{item.location?.city}, {item.location?.state}, {item.location?.country}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Quantity</p>
                                    <p>{item.quantity}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Condition</p>
                                    <p>{item.conditionType}</p>
                                </div>
                                {showTags && (
                                    <div className="col-12">
                                        <p className="mb-1 fw-bold text-muted">Tags</p>
                                        <p>{item.tags?.join(", ")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                </div>

                {showActions && (
                    <div className="card-footer bg-white border-top">
                        <MarketplaceItemButton itemId={item.id} onDelete={onDelete} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketplaceCard;

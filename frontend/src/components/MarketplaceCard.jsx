import React from "react";
import "../styles/Marketplace.css";

const MarketplaceCard = ({ item, showAuthor = true, showCategory = false, showAllDetails = false }) => {
    return (
        <div className="col-lg-4 col-md-6 col-sm-6 mb-4">
            <div className="marketplace-card card h-100 border shadow-sm">
                {showAuthor && item.author && (
                    <div className="card-header d-flex align-items-center bg-light border-bottom">
                        <img
                            src={item.author.profilePicture}
                            alt={item.author.username}
                            className="rounded-circle me-2"
                            width="40"
                            height="40"
                            style={{ objectFit: "cover" }}
                        />
                        <small className="text-muted">{item.author.username}</small>
                    </div>
                )}

                {item.images?.length > 0 && (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="marketplace-image card-img-top"
                    />
                )}

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-semibold text-dark">{item.title}</h5>

                    {showCategory && (
                        <h6 className="card-subtitle mb-2 text-muted">{item.category}</h6>
                    )}

                    <p className="card-text small flex-grow-1 text-secondary">
                        {item.description}
                    </p>

                    <p className="fw-bold text-primary mt-auto">{item.currency} {item.price}</p>

                    {showAllDetails && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-3">Item Details</h6>
                            <div className="row gy-2">
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Location</p>
                                    <p className="mb-2">{item.location?.city}, {item.location?.state}, {item.location?.country}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Quantity</p>
                                    <p className="mb-2">{item.quantity}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Condition</p>
                                    <p className="mb-2">{item.conditionType}</p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 fw-bold text-muted">Negotiable</p>
                                    <p className="mb-2">{item.isNegotiable ? "Yes" : "No"}</p>
                                </div>
                                <div className="col-12">
                                    <p className="mb-1 fw-bold text-muted">Tags</p>
                                    <p className="mb-0">{item.tags?.join(", ")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard;

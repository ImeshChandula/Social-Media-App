import React from "react";
import MarketplaceItemDropdown from "./MarketplaceItemDropdown";

const MarketplaceCard = ({
    item,
    showAuthor = true,
    showCategory = false,
    showAllDetails = false,
    showContactDetails = false,
    showStatus = true,
    showActions = false,
    onDelete = () => { },
}) => {
    return (
        <div className="col-lg-4 col-md-6 col-sm-6 mb-4">
            <div className="marketplace-card card h-100 border shadow-sm">
                {(showAuthor && item.author) || showActions ? (
                    <div className="card-header d-flex justify-content-between align-items-center bg-light border-bottom">
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
                                    <small className="text-muted">{item.author.username}</small>
                                </>
                            )}
                        </div>
                        {showActions && (
                            <MarketplaceItemDropdown itemId={item.id} onDelete={onDelete} />
                        )}
                    </div>
                ) : null}

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

                    {showStatus && (
                        <div className="mt-3 border-top pt-3">
                            <h6 className="fw-semibold text-dark mb-3">Publication Details</h6>
                            <div className="d-flex flex-column gap-2">

                                <div className="d-flex justify-content-between">
                                    <span className="text-muted fw-bold">Status</span>
                                    <span className={
                                        `badge px-3 py-1 text-capitalize ${item.status === 'active' ? 'bg-success' :
                                            item.status === 'expired' ? 'bg-danger' :
                                                item.status === 'removed' ? 'bg-danger' :
                                                    item.status === 'pending' ? 'bg-warning text-dark' :
                                                        item.status === 'pending' ? 'bg-secondary' : 'bg-secondary'
                                        }`
                                    }>
                                        {item.status}
                                    </span>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span className="text-muted fw-bold">Created</span>
                                    <span className="text-dark">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <span className="text-muted fw-bold">Expires</span>
                                    <span className="text-dark">{new Date(item.expiresAt).toLocaleDateString()}</span>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default MarketplaceCard;

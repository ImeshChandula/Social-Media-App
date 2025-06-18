import React from "react";
import "../styles/Marketplace.css";

const MarketplaceCard = ({ item, showAuthor = true, showCategory = false, showAllDetails = false }) => {
    return (
        <div className="col-lg-4 col-md-6 col-sm-6 mb-4">
            <div className="marketplace-card card h-100">
                {showAuthor && item.author && (
                    <div className="card-header d-flex align-items-center border-secondary bg-dark marketplace-header">
                        <img
                            src={item.author.profilePicture}
                            alt={item.author.username}
                            className="rounded-circle me-2"
                            width="40"
                            height="40"
                            style={{ objectFit: "cover" }}
                        />
                        <small>{item.author.username}</small>
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
                    <h5 className="marketplace-card-title card-title">{item.title}</h5>

                    {showCategory && (
                        <h6 className="text-white-50 card-subtitle mb-2">{item.category}</h6>
                    )}

                    <p className="marketplace-card-text card-text small flex-grow-1">
                        {item.description}
                    </p>

                    <p className="fw-bold mt-auto">{item.currency} {item.price}</p>

                    {showAllDetails && (
                        <>
                            <p className="fw-bold mt-1">Location: {item.location?.city}, {item.location?.state}, {item.location?.country}</p>
                            <p className="fw-bold mt-1">Quantity: {item.quantity}</p>
                            <p className="fw-bold mt-1">Condition: {item.conditionType}</p>
                            <p className="fw-bold mt-1">Negotiable: {item.isNegotiable ? "Yes" : "No"}</p>
                            <p className="fw-bold mt-1">Tags: {item.tags?.join(", ")}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketplaceCard
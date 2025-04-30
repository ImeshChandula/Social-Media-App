import React from "react";

const RestrictedUser = () => {
    return (
        <div className="container py-4 text-white">
            {/* Warning Banner */}
            <div className="alert alert-warning d-flex align-items-center gap-2 rounded-3">
                <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                <div>
                    <strong>Account Restricted</strong>
                    <p className="mb-0">
                        Your account has been temporarily restricted due to violations of our Community Standards.
                        Some features are limited until the restriction period ends.
                    </p>
                </div>
            </div>

            {/* Account Restrictions */}
            <div className="card bg-dark mb-4 rounded-4 shadow-sm">
                <div className="card-body">
                    <h5 className="mb-3 text-info">Account Restrictions</h5>
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-clock-history text-warning me-3 fs-4"></i>
                        <div>
                            <strong className="text-white">Posting Temporarily Restricted</strong>
                            <p className="mb-1 small text-muted-dark">You cannot post content for 7 days due to a community standards violation.</p>
                            <span className="badge bg-warning text-dark">6 days, 4 hours remaining</span>
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <i className="bi bi-chat-left-dots text-danger me-3 fs-4"></i>
                        <div>
                            <strong className="text-white">Comment Restriction</strong>
                            <p className="mb-1 small text-muted-dark">You cannot comment on posts outside your network for 14 days.</p>
                            <span className="badge bg-danger">12 days remaining</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <a href="#" className="text-info text-decoration-underline">Request Review</a>
                    </div>
                </div>
            </div>

            {/* Community Standards */}
            <div className="card bg-dark mb-4 rounded-4 shadow-sm">
                <div className="card-body">
                    <h5 className="text-info mb-3">Community Standards</h5>
                    <p className="mb-2"><strong className="text-white">Why was your content removed?</strong></p>
                    <p className="small text-muted-dark">
                        You most likely violated our community guidelines on hate speech. We don’t allow content that attacks people based on their race, ethnicity, national origin, religious affiliation, sexual orientation, gender, or disability.
                    </p>

                    <p className="mb-2"><strong className="text-white">How to avoid future restrictions</strong></p>
                    <ul className="small text-muted-dark mb-0">
                        <li>Review our Community Standards</li>
                        <li>Be respectful when interacting with others</li>
                        <li>Avoid posting controversial content</li>
                        <li>Report content that violates our policies instead of responding negatively</li>
                    </ul>
                    <a href="#" className="text-info text-decoration-underline d-block mt-3">Learn more about Community Standards</a>
                </div>
            </div>

            {/* Available Features */}
            <div className="card bg-dark rounded-4 shadow-sm">
                <div className="card-body">
                    <h5 className="text-info mb-4">Available Features</h5>
                    <div className="row row-cols-1 row-cols-md-2 g-3">
                        {/* Feature Items */}
                        {[
                            { icon: "bi-eye", name: "Browsing Content", description: "You can still view posts, photos, and videos from friends and pages you follow.", color: "success" },
                            { icon: "bi-chat-left-text", name: "Messaging", description: "You can send and receive private messages with friends.", color: "success" },
                            { icon: "bi-chat-dots", name: "Commenting", description: "You cannot comment on posts outside your network.", color: "danger" },
                            { icon: "bi-pencil-square", name: "Posting", description: "You cannot create new posts or share content.", color: "danger" },
                            { icon: "bi-hand-thumbs-up", name: "Reacting", description: "You can still like and react to posts.", color: "success" },
                            { icon: "bi-people", name: "Group Participation", description: "You can view but cannot post in groups.", color: "danger" }
                        ].map(({ icon, name, description, color }, index) => (
                            <div key={index} className="col">
                                <div className={`border border-${color} rounded p-3 h-100`}>
                                    <div className={`text-${color} mb-2`}>
                                        <i className={`bi ${icon} me-2`}></i>
                                        <strong>{name}</strong>
                                    </div>
                                    <p className="small text-muted-dark mb-0">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestrictedUser;

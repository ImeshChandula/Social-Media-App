import React from "react";
import { FaTimes } from "react-icons/fa";
import { Modal, Spinner } from "react-bootstrap";

const LikesPopup = ({ show, onClose, likes = [], loading = false }) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            contentClassName="bg-white rounded shadow likes-popup-card"
            backdropClassName="bg-dark bg-opacity-50"
            aria-labelledby="likes-popup-title"
        >
            <div className="d-flex justify-content-between align-items-center border-bottom px-4 py-3">
                <h5 id="likes-popup-title" className="mb-0 fw-bold text-primary">
                    Liked by
                </h5>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary p-1"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
            </div>

            <div
                className="likes-popup-body px-4 py-3"
                style={{ maxHeight: "320px", overflowY: "auto" }}
            >
                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : likes.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                        {likes.map((user, idx) => (
                            <li
                                key={idx}
                                className="d-flex align-items-center py-2 px-3 mb-2 rounded hover-bg-light cursor-pointer"
                                style={{ transition: "background-color 0.2s" }}
                                onMouseEnter={e =>
                                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                                }
                                onMouseLeave={e =>
                                    (e.currentTarget.style.backgroundColor = "transparent")
                                }
                            >
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="rounded-circle border border-2 border-primary me-3"
                                    style={{ width: 44, height: 44, objectFit: "cover" }}
                                />
                                <div>
                                    <div className="fw-semibold text-dark">{user.username}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted mb-0">No likes yet.</p>
                )}
            </div>
        </Modal>
    );
};

export default LikesPopup;

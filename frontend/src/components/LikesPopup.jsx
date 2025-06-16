import React from "react";
import { FaTimes } from "react-icons/fa";
import { Modal, Spinner } from "react-bootstrap";

const LikesPopup = ({ show, onClose, likes = [], loading = false }) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
        >
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <h5 className="mb-0 fw-bold text-black">
                    Liked by
                </h5>
                <button
                    type="button"
                    className="likes-popup-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <FaTimes />
                </button>
            </div>

            <div className="p-2">
                {loading ? (
                    <div className="d-flex justify-content-center py-4">
                        <Spinner animation="border" variant="theme-primary" />
                    </div>
                ) : likes.length > 0 ? (
                    <ul className="mb-0 p-0">
                        {likes.map((user, idx) => (
                            <li
                                key={idx}
                                className="likes-popup-item d-flex align-items-center py-2 px-3 mb-2 rounded cursor-pointer"
                                onClick={() => window.location.href = `/profile/${user.id}`}
                            >
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="rounded-circle border border-2 border-theme-primary me-3"
                                    style={{ width: 44, height: 44, objectFit: "cover" }}
                                />
                                <div>
                                    <div className="fw-semibold text-black">{user.username}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted py-4">No likes yet.</p>
                )}
            </div>
        </Modal>
    );
};

export default LikesPopup;

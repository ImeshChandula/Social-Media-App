import React from "react";
import { FaTimes } from "react-icons/fa";
import { Modal, Spinner } from "react-bootstrap";

const LikesPopup = ({ show, onClose, likes = [], loading = false }) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            contentClassName="likes-popup-card"
            backdropClassName="likes-popup-backdrop"
        >
            <div className="likes-popup-header d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Liked by</h5>
                <button className="likes-popup-close btn p-0" onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>
            </div>

            <div className="likes-popup-body">
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : likes.length > 0 ? (
                    <ul className="list-unstyled likes-popup-list">
                        {likes.map((user, idx) => (
                            <li key={idx} className="likes-popup-item d-flex align-items-center p-2 mb-2">
                                <img
                                    src={user.profilePicture}
                                    alt={user.username}
                                    className="rounded-circle me-3 border border-primary border-2"
                                    style={{ width: "42px", height: "42px", objectFit: "cover" }}
                                />
                                <div>
                                    <div className="fw-semibold text-black">{user.username}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-dark text-center mt-3">No likes yet.</p>
                )}
            </div>
        </Modal>
    );
};

export default LikesPopup;

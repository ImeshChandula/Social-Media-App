// components/ShareButton.jsx
import React, { useState } from "react";
import { FaShare } from "react-icons/fa"; // ✅ clean icon without plus
import { Modal } from "react-bootstrap";

const ShareButton = ({ postId }) => {
  const [show, setShow] = useState(false);
  const shareUrl = `${window.location.origin}/post/${postId}`;

  const openNativeOrModal = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch (_) {
        /* user cancelled */
      }
    }
    setShow(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied!");
    setShow(false);
  };

  return (
    <>
      <button
        className="btn btn-light d-flex align-items-center px-3 py-1"
        style={{ fontSize: ".9rem", lineHeight: 1 }}
        onClick={openNativeOrModal}
      >
        <FaShare />
        Share
      </button>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Share Post</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column gap-3">
          <button className="btn btn-outline-primary" onClick={copyLink}>
            Copy link
          </button>
          <a
            className="btn btn-outline-primary"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            className="btn btn-outline-success"
            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShareButton;

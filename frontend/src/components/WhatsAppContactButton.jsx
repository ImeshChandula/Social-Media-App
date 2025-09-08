import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const WhatsAppContactButton = ({ pageId, pageName, className = '', size = 'md' }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const handleQuickContact = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/pages/${pageId}/whatsapp-contact`);
      
      if (response.data.success) {
        const { whatsappURL } = response.data.data;
        window.open(whatsappURL, '_blank');
        toast.success('Redirecting to WhatsApp...');
      }
    } catch (error) {
      console.error('Error getting WhatsApp contact:', error);
      toast.error(error.response?.data?.message || 'Unable to open WhatsApp contact');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomContact = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/pages/${pageId}/whatsapp-contact`);
      
      if (response.data.success) {
        const { phone } = response.data.data;
        const message = customMessage.trim() || `Hi! I found your page "${pageName}" and would like to get in touch.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
        toast.success('Redirecting to WhatsApp...');
        setShowModal(false);
        setCustomMessage('');
      }
    } catch (error) {
      console.error('Error getting WhatsApp contact:', error);
      toast.error(error.response?.data?.message || 'Unable to open WhatsApp contact');
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm px-2';
      case 'lg':
        return 'btn-lg px-4';
      default:
        return 'px-3';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'fa-sm';
      case 'lg':
        return 'fa-lg';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Quick Contact Button */}
      <div className="btn-group">
        <button
          className={`btn btn-success ${getSizeClasses()} ${className}`}
          onClick={handleQuickContact}
          disabled={loading}
          title="Contact via WhatsApp"
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : (
            <i className={`fab fa-whatsapp me-2 ${getIconSize()}`}></i>
          )}
          Contact Us
        </button>
        
        <button
          className={`btn btn-success dropdown-toggle dropdown-toggle-split ${getSizeClasses()}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          disabled={loading}
        >
          <span className="visually-hidden">Toggle Dropdown</span>
        </button>
        
        <ul className="dropdown-menu bg-dark border-secondary">
          <li>
            <button 
              className="dropdown-item text-white" 
              onClick={handleQuickContact}
              disabled={loading}
            >
              <i className="fab fa-whatsapp me-2 text-success"></i>
              Quick Contact
            </button>
          </li>
          <li>
            <button 
              className="dropdown-item text-white" 
              onClick={() => setShowModal(true)}
              disabled={loading}
            >
              <i className="fas fa-edit me-2 text-info"></i>
              Custom Message
            </button>
          </li>
        </ul>
      </div>

      {/* Custom Message Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">
                  <i className="fab fa-whatsapp me-2 text-success"></i>
                  Contact {pageName}
                </h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="alert alert-info bg-info bg-opacity-10 border border-info border-opacity-25 mb-3">
                  <small>
                    <i className="fas fa-info-circle me-2"></i>
                    Write a custom message to send via WhatsApp
                  </small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Your Message:</label>
                  <textarea
                    className="form-control bg-dark text-white border-secondary"
                    rows="4"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={`Hi! I found your page "${pageName}" and would like to get in touch.`}
                    maxLength={500}
                  />
                  <small className="text-white-50">
                    {customMessage.length}/500 characters
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-secondary">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleCustomContact}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Opening...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-whatsapp me-2"></i>
                      Send via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppContactButton;
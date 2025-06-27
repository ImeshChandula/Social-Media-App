import React from 'react'
import '../styles/RequestHead.css';

const RequestHead = () => {
    const ADDRESS = {
      street: import.meta.env.VITE_APP_ADDRESS_STREET,
      city: import.meta.env.VITE_APP_ADDRESS_CITY,
      state: import.meta.env.VITE_APP_ADDRESS_STATE,
      zip: import.meta.env.VITE_APP_ADDRESS_ZIP,
    };

    const PHONE = import.meta.env.VITE_APP_PHONE;
    const EMAIL = import.meta.env.VITE_APP_EMAIL;
    const ACTIVE_WEEK = import.meta.env.VITE_APP_SUPPORT_WEEK;
    const ACTIVE_WEEKEND = import.meta.env.VITE_APP_SUPPORT_WEEKEND;

  return (
    <div className='req-contact-body'>
    <div className="req-contact-container">
        <div className="req-contact-header">
            <h1 className="req-contact-title">Get in Touch</h1>
            <p className="req-contact-subtitle">We're here to help you connect</p>
        </div>

        <div className="req-contact-section">
            <h2 className="req-section-title">
                <span className="req-section-icon">📍</span>
                Our Address
            </h2>
            <div className="req-contact-info">
                <div className="req-address-line">{ADDRESS.street}</div>
                <div className="req-address-line">{ADDRESS.city}, {ADDRESS.state} {ADDRESS.zip}</div>
            </div>
        </div>

        <div className="req-contact-section">
            <h2 className="req-section-title">
                <span className="req-section-icon">📞</span>
                Phone & Email
            </h2>
            <div className="req-contact-info">
                <div className="req-address-line">
                    <a href={PHONE} class="req-contact-link">{PHONE}</a>
                </div>
                <div className="req-address-line">
                    <a href={EMAIL} class="req-contact-link">{EMAIL}</a>
                </div>
            </div>
        </div>

        <div className="req-contact-section">
            <h2 className="req-section-title">
                <span className="req-section-icon">🕒</span>
                Support Hours
            </h2>
            <div className="req-support-hours">
                <div className="req-hours-item">
                    <div className="req-hours-label">Weekdays</div>
                    <div className="req-hours-time">{ACTIVE_WEEK}</div>
                </div>
                <div className="req-hours-item">
                    <div className="req-hours-label">Weekends</div>
                    <div className="req-hours-time">{ACTIVE_WEEKEND}</div>
                </div>
            </div>
        </div>

        <div className="req-contact-footer">
            <p className="req-footer-text">Ready to connect the world, one conversation at a time</p>
        </div>
    </div>
    </div>
  )
}

export default RequestHead
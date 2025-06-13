import React, { useState } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore'; 
//import { axiosInstance } from "../lib/axios";
import { AlertCircle, Send, User, Mail, MessageSquare, Calendar } from 'lucide-react';
import '../styles/SupportBanned.css';

const SupportBanned = () => {
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    appealReason: '',
    incidentDate: '',
    additionalInfo: '',
    contactMethod: 'email'
  });
  
  const { logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with your Firebase backend
      console.log('Ban appeal submitted:', formData);
      
      setSubmitStatus('success');
      setFormData({
        userId: '',
        email: '',
        appealReason: '',
        incidentDate: '',
        additionalInfo: '',
        contactMethod: 'email'
      });
    } catch (error) {
      setSubmitStatus('error');
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
        await logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
  };

  const isFormValid = formData.userId && formData.email && formData.appealReason;


  return (
    <div className="ban-appeal-container">
      <div className="ban-appeal-wrapper">
        <div className="ban-appeal-header">
          <div className="ban-appeal-icon">
            <AlertCircle size={32} />
          </div>
          <h1 className="ban-appeal-title">Account Ban Appeal</h1>
          <p className="ban-appeal-subtitle">
            Request a review of your account suspension
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Appeal Submitted Successfully!</h3>
            <p>Your ban appeal has been sent to our admin team. You'll receive a response within 3-5 business days.</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="error-message">
            <div className="error-icon">✗</div>
            <h3>Submission Failed</h3>
            <p>There was an error submitting your appeal. Please try again.</p>
          </div>
        )}

        {submitStatus !== 'success' && (
          <div className="ban-appeal-form">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                User ID / Username
              </label>
              <input
                type="text"
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your user ID or username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Incident Date (if known)
              </label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MessageSquare size={16} />
                Reason for Appeal
              </label>
              <textarea
                name="appealReason"
                value={formData.appealReason}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Please explain why you believe your account was unfairly banned. Include specific details about the situation."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any additional context or evidence that might help your case (optional)"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Preferred Contact Method
              </label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="email"
                    checked={formData.contactMethod === 'email'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Email
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="contactMethod"
                    value="phone"
                    checked={formData.contactMethod === 'phone'}
                    onChange={handleInputChange}
                  />
                  <span className="radio-custom"></span>
                  Phone
                </label>
              </div>
            </div>

            <button
              type="button"
              className={`submit-button ${!isFormValid ? 'disabled' : ''} ${isSubmitting ? 'loading' : ''}`}
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Send size={16} />
                  Submit Appeal
                </>
              )}
            </button>

            <div className="form-footer">
              <p>
                <strong>Important:</strong> Please be honest and detailed in your appeal. 
                False information may result in permanent account suspension.
              </p>
            </div>

            <button 
              className="btn btn-secondary"
              onClick={handleLogout}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Logout
          </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportBanned
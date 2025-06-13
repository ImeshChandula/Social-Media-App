import React, { useState } from 'react';
import useAuthStore from '../store/authStore'; 
import { axiosInstance } from '../lib/axios'; 
import toast from 'react-hot-toast';
import "../styles/SupportChangeStatus.css";

const SupportChangeStatus = () => {
    const [isReactivating, setIsReactivating] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { logout, authUser, checkAuth } = useAuthStore();

    const handleReactivateAccount = async () => {
        if (!authUser?.id) {
            toast.error('User ID not found');
            return;
        }

        setIsReactivating(true);
        
        try {
            const userIdToUse = authUser.id;
            const response = await axiosInstance.patch(`/users/updateProfile/${userIdToUse}`, {
                accountStatus: 'active'
            });

            if (response.data && response.data.user.accountStatus === "active") {
                toast.success('Account reactivated successfully!');
                
                checkAuth();
            }
        } catch (error) {
            console.error('Reactivation error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to reactivate account';
            toast.error(errorMessage);
        } finally {
            setIsReactivating(false);
            setShowConfirmation(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };


  return (
    <div className="reactivation-container">

      <div className="reactivation-content">
        <div className="reactivation-icon">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <h2 className="reactivation-title">Reactivate Your Account</h2>
        <p className="reactivation-description">
          Your account is currently inactive. Click the button below to reactivate your account 
          and regain full access to all features. This will change your account status to active immediately.
        </p>

        <div className="button-group">
          <button 
            className="btn btn-primary"
            onClick={() => setShowConfirmation(true)}
            disabled={isReactivating}
          >
            {isReactivating ? (
              <>
                <div className="reactive-loading-spinner"></div>
                Reactivating...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 018-8V2.5a.5.5 0 01.74-.44l3 1.5a.5.5 0 010 .88l-3 1.5A.5.5 0 0112 5.5V4a6 6 0 100 12 6 6 0 006-6h2a8 8 0 01-16 0z"/>
                </svg>
                Reactivate Account
              </>
            )}
          </button>

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
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirmation-title">Confirm Account Reactivation</h3>
            <p className="confirmation-text">
              Are you sure you want to reactivate your account? This will restore full access to all features.
            </p>
            <div className="button-group">
              <button 
                className="btn btn-primary"
                onClick={handleReactivateAccount}
                disabled={isReactivating}
              >
                {isReactivating ? (
                  <>
                    <div className="reactive-loading-spinner"></div>
                    Reactivating...
                  </>
                ) : (
                  'Yes, Reactivate'
                )}
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isReactivating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportChangeStatus
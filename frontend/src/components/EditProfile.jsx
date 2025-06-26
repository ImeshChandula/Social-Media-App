import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../lib/axios";
import useAuthStore from '../store/authStore'; 
import '../styles/EditProfile.css';

function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [jobCategories, setJobCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [userData, setUserData] = useState({
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    profilePicture: '',
    coverPhoto: '',
    bio: '',
    location: '',
    birthday: '',
    accountStatus: 'active',
    role: '',
    jobCategory: '',
  });

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    birthday: '',
    accountStatus: 'active',
    jobCategory: ''
  });

  const { authUser, checkAuth, logout } = useAuthStore();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      await fetchJobCategories();
    };
    fetchData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/users/myProfile');
      const data = response.data;
      
        setUserData(data.user);
        setFormData({
            username: data.user.username || '',
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            bio: data.user.bio || '',
            location: data.user.location || '',
            birthday: data.user.birthday ? data.user.birthday.split('T')[0] : '',
            accountStatus: data.user.accountStatus || 'active',
            jobCategory: data.user.jobCategory || 'None'
        });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories/active/job_role');
      if (response.data.success) {
        setJobCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching job categories:', error);
      toast.error("Failed to load job categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
        setUploadingProfilePic(true);
        const base64 = await convertToBase64(file);
        
        const response = await axiosInstance.patch(`/users/updateProfilePic/${userData.id}`, {
            profilePicture: base64
        });

        setUserData(prev => ({ ...prev, profilePicture: response.data.updatedUser.profilePicture }));
        toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Error uploading profile picture');
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Handle cover photo upload
  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploadingCoverPhoto(true);
      const base64 = await convertToBase64(file);
      
        const response = await axiosInstance.patch(`/users/updateCoverPic/${userData.id}`, {
            coverPhoto: base64
        });

        setUserData(prev => ({ ...prev, coverPhoto: response.data.updatedUser.coverPhoto }));
        toast.success('Cover photo updated successfully!');
    } catch (error) {
      console.error('Error uploading cover photo:', error);
      toast.error('Error uploading cover photo');
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Prepare the data to send
      const dataToSend = { ...formData };

      // Convert birthday to ISO 8601 format if it exists
      if (dataToSend.birthday && dataToSend.birthday.trim() !== '') {
        // Create a date object from the YYYY-MM-DD string and convert to ISO
        const birthdayDate = new Date(dataToSend.birthday + 'T00:00:00.000Z');
        dataToSend.birthday = birthdayDate.toISOString();
      } else {
        // Remove birthday field if empty to avoid validation error
        delete dataToSend.birthday;
      }

      await axiosInstance.patch(`/users/updateProfile/${userData.id}`, dataToSend);
      toast.success('Profile updated successfully!');
      setTimeout(() => {
        navigate(-1);
        }, 3000
      );
      checkAuth();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Error updating profile';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  const handleDeleteButtonClick = () => {
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      const response = await axiosInstance.delete(`/users/deleteUser/${authUser.id}`);

      if (response.data.success) {
        toast.success(response.data.message || "Your account deleted successfully");
        setShowDeleteModal(false);
        logout();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setDeleting(false);
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="edit-profile-container normal-loading-spinner">
        Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    );
  }


  
    return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <div className="profile-header">
          <h1>Edit Profile</h1>
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* Cover Photo Section */}
        <div className="cover-photo-section">
          <div 
            className="cover-photo"
            style={{ backgroundImage: `url(${userData.coverPhoto})` }}
          >
            <div className="cover-photo-overlay">
              <label className="upload-btn cover-upload-btn">
                {uploadingCoverPhoto ? 'Uploading...' : 'Edit Cover Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoUpload}
                  disabled={uploadingCoverPhoto}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="profile-pic-section">
          <div className="profile-pic-container">
            <img
              src={userData.profilePicture}
              alt="Profile"
              className="profile-pic"
            />
            <label className="upload-btn profile-upload-btn">
              {uploadingProfilePic ? '...' : 'Edit'}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                disabled={uploadingProfilePic}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobCategory">Job category</label>
              <select
                id="jobCategory"
                name="jobCategory"
                value={formData.jobCategory}
                onChange={handleInputChange}
              >
                <option value="None">Select a category</option>
                {jobCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={userData.email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your location"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="accountStatus">Account Status</label>
              <select
                id="accountStatus"
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </div>

          <div className="form-actions">
            <button
              type="button"
              className="reset-password-btn"
              onClick={handleResetPassword}
            >
              Reset Password
            </button>
            
            <div className="submit-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="reset-password-btn"
                onClick={handleDeleteButtonClick}
              >
                Delete My Account
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="account-modal-overlay">
          <div className="account-modal-content">
            <div className="account-modal-header">
              <h3>Confirm Account Deletion</h3>
            </div>
            <div className="account-modal-body">
              <p>Are you sure you want to delete your account?</p>
              <p><strong>This action cannot be undone.</strong></p>
              <p>All your data will be permanently removed.</p>
            </div>
            <div className="account-modal-actions">
              <button
                type="button"
                className="account-cancel-btn"
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="account-delete-confirm-btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    )
}
export default EditProfile
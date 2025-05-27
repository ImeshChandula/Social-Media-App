import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const CreateStory = () => {
  const initialState = {
    caption: '',
    media: null,
    mediaPreview: '',
    mediaType: '',
    privacy: 'public',
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    return () => {
      if (formData.mediaType === 'video' && formData.mediaPreview) {
        URL.revokeObjectURL(formData.mediaPreview);
      }
    };
  }, [formData.mediaPreview, formData.mediaType]);

  const handleMediaUpload = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'media' && files?.[0]) {
      const file = files[0];
      const base64 = await handleMediaUpload(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';

      if (formData.mediaType === 'video' && formData.mediaPreview) {
        URL.revokeObjectURL(formData.mediaPreview);
      }

      setFormData((prev) => ({
        ...prev,
        media: base64,
        mediaPreview: type === 'video' ? URL.createObjectURL(file) : base64,
        mediaType: type,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveMedia = () => {
    if (formData.mediaType === 'video' && formData.mediaPreview) {
      URL.revokeObjectURL(formData.mediaPreview);
    }

    setFormData((prev) => ({
      ...prev,
      media: null,
      mediaPreview: '',
      mediaType: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.media) {
      return setMessage({ type: 'danger', text: 'Media is required to create a story.' });
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        content: formData.media,
        type: formData.mediaType,
        caption: formData.caption,
        privacy: formData.privacy,
      };

      const res = await axiosInstance.post('/stories/createStory', payload);

      setMessage({ type: 'success', text: res.data.message || 'Story created successfully!' });
      setFormData(initialState);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Failed to create story.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <div className="card shadow-lg border-secondary rounded-4 bg-dark text-white">
        <div className="card-body p-4">
          <h3 className="text-center mb-4">📸 Create a Story</h3>

          {message && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Caption</label>
              <textarea
                className="form-control bg-dark text-white custom-placeholder"
                name="caption"
                rows="3"
                value={formData.caption}
                onChange={handleChange}
                placeholder="Say something about this story..."
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Upload Media</label>
                {formData.media && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger my-2"
                    onClick={handleRemoveMedia}
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="file"
                className="form-control bg-dark text-white"
                name="media"
                accept="image/*,video/*"
                onChange={handleChange}
              />
              {formData.mediaPreview && formData.mediaType === 'video' && (
                <div className="mt-3">
                  <p className="text-white-50">Video Preview:</p>
                  <video
                    src={formData.mediaPreview}
                    controls
                    className="w-100 rounded shadow"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
              {formData.mediaPreview && formData.mediaType === 'image' && (
                <div className="mt-3">
                  <p className="text-white-50">Image Preview:</p>
                  <img
                    src={formData.mediaPreview}
                    alt="preview"
                    className="w-100 rounded shadow"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Privacy</label>
              <select
                className="form-select bg-dark text-white"
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-bold rounded-pill"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Share Story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;

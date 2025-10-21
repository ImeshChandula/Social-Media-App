
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { BsTrash } from "react-icons/bs";

const EditPagePost = ({ pageId, post, onPostUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    existingMedia: [], // Existing media URLs from post
    newMedia: [], // New media to upload (base64)
    newMediaPreview: [], // Preview for new media
    mediaType: '',
    category: '',
    tags: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);

  const VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];

  useEffect(() => {
    if (post) {
      const existingMedia = Array.isArray(post.media) ? post.media : (post.media ? [post.media] : []);
      setFormData({
        content: post.content || '',
        existingMedia: existingMedia,
        newMedia: [],
        newMediaPreview: [],
        mediaType: post.mediaType || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        location: post.location || '',
      });
    }
  }, [post]);

  useEffect(() => {
    return () => {
      // Cleanup video blob URLs
      if (formData.mediaType === 'video') {
        formData.newMediaPreview.forEach(preview => {
          try {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          } catch {}
        });
      }
    };
  }, []);

  const handleMediaUpload = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'media' && files?.length > 0) {
      const previews = [];
      const base64Files = [];

      // Determine media type from existing or new files
      let detectedType = formData.mediaType;
      
      // If no existing media type, detect from first file
      if (!detectedType && formData.existingMedia.length === 0) {
        detectedType = files[0].type.startsWith('video') ? 'video' : 'image';
      }

      for (const file of files) {
        const type = file.type.startsWith('video') ? 'video' : 'image';

        // Check if mixing types
        if (detectedType && detectedType !== type) {
          toast.error('You can only upload one type: all images or all videos.');
          return;
        }

        // Check if mixing with existing media of different type
        if (formData.existingMedia.length > 0 && formData.mediaType && formData.mediaType !== type) {
          toast.error(`Cannot mix ${formData.mediaType}s with ${type}s. Remove existing media first.`);
          return;
        }

        if (!detectedType) {
          detectedType = type;
        }

        const base64 = await handleMediaUpload(file);
        base64Files.push(base64);
        previews.push(type === 'video' ? URL.createObjectURL(file) : base64);
      }

      setFormData((prev) => ({
        ...prev,
        newMedia: [...prev.newMedia, ...base64Files],
        newMediaPreview: [...prev.newMediaPreview, ...previews],
        mediaType: detectedType,
        category: detectedType === 'video' ? prev.category : '',
      }));

      // Reset file input
      e.target.value = '';
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveExistingMedia = (index) => {
    setFormData((prev) => {
      const newExistingMedia = [...prev.existingMedia];
      newExistingMedia.splice(index, 1);

      // If no media left, reset mediaType and category
      const hasMediaLeft = newExistingMedia.length > 0 || prev.newMedia.length > 0;

      return {
        ...prev,
        existingMedia: newExistingMedia,
        mediaType: hasMediaLeft ? prev.mediaType : '',
        category: hasMediaLeft && prev.mediaType === 'video' ? prev.category : '',
      };
    });
  };

  const handleRemoveNewMedia = (index) => {
    setFormData((prev) => {
      const newMedia = [...prev.newMedia];
      const newPreviews = [...prev.newMediaPreview];

      // Cleanup video blob URL
      if (prev.mediaType === 'video' && newPreviews[index]?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(newPreviews[index]);
        } catch {}
      }

      newMedia.splice(index, 1);
      newPreviews.splice(index, 1);

      // If no media left, reset mediaType and category
      const hasMediaLeft = prev.existingMedia.length > 0 || newMedia.length > 0;

      return {
        ...prev,
        newMedia,
        newMediaPreview: newPreviews,
        mediaType: hasMediaLeft ? prev.mediaType : '',
        category: hasMediaLeft && prev.mediaType === 'video' ? prev.category : '',
      };
    });
  };

  const handleRemoveAllMedia = () => {
    // Cleanup video blob URLs
    if (formData.mediaType === 'video') {
      formData.newMediaPreview.forEach(preview => {
        try {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        } catch {}
      });
    }

    setFormData((prev) => ({
      ...prev,
      existingMedia: [],
      newMedia: [],
      newMediaPreview: [],
      mediaType: '',
      category: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const totalMediaCount = formData.existingMedia.length + formData.newMedia.length;

    if (!formData.content.trim() && totalMediaCount === 0) {
      return toast.error('Content or media is required.');
    }

    if (formData.mediaType === 'video' && formData.category === '') {
      return toast.error('Please select a category for your video.');
    }

    setLoading(true);
    try {
      // Combine existing and new media
      const allMedia = [...formData.existingMedia, ...formData.newMedia];

      const payload = {
        content: formData.content,
        media: allMedia.length > 0 ? allMedia : null,
        mediaType: allMedia.length > 0 ? formData.mediaType : 'text',
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        location: formData.location,
      };

      if (formData.mediaType === 'video' && formData.category) {
        payload.category = formData.category;
      }

      const res = await axiosInstance.put(
        `/pages/${pageId}/posts/${post.id || post._id}`,
        payload
      );

      if (res.data.success) {
        toast.success('Post updated successfully');
        onPostUpdated(res.data.post);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const totalMediaCount = formData.existingMedia.length + formData.newMedia.length;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Content</label>
          <textarea
            className="form-control"
            name="content"
            rows="4"
            value={formData.content}
            onChange={handleChange}
            placeholder="What would you like to share?"
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-semibold mb-0 text-dark">
              Media ({totalMediaCount} {totalMediaCount === 1 ? 'item' : 'items'})
            </label>
            {totalMediaCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleRemoveAllMedia}
              >
                <BsTrash className="me-1" />
                Remove All
              </button>
            )}
          </div>

          {/* Existing Media */}
          {formData.existingMedia.length > 0 && (
            <div className="mb-3">
              <p className="text-muted small mb-2">
                Existing Media ({formData.existingMedia.length})
              </p>
              <div className="d-flex flex-wrap gap-3">
                {formData.existingMedia.map((media, idx) => (
                  <div key={`existing-${idx}`} className="position-relative" style={{ width: 120 }}>
                    <button
                      type="button"
                      className="bg-danger text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                      style={{ 
                        borderRadius: "50%", 
                        width: 28, 
                        height: 28, 
                        zIndex: 10, 
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleRemoveExistingMedia(idx)}
                      title="Remove this image"
                    >
                      <BsTrash size={16} />
                    </button>

                    {formData.mediaType === "video" ? (
                      <video
                        src={media}
                        controls
                        className="rounded shadow-sm border"
                        style={{
                          width: "120px",
                          height: "90px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={media}
                        alt={`existing-${idx}`}
                        className="rounded shadow-sm border"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Media */}
          {formData.newMedia.length > 0 && (
            <div className="mb-3">
              <p className="text-muted small mb-2">
                New Media ({formData.newMedia.length}) 
                <span className="badge bg-success ms-2">To be uploaded</span>
              </p>
              <div className="d-flex flex-wrap gap-3">
                {formData.newMediaPreview.map((preview, idx) => (
                  <div key={`new-${idx}`} className="position-relative" style={{ width: 120 }}>
                    <button
                      type="button"
                      className="bg-danger text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                      style={{ 
                        borderRadius: "50%", 
                        width: 28, 
                        height: 28, 
                        zIndex: 10, 
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleRemoveNewMedia(idx)}
                      title="Remove this image"
                    >
                      <BsTrash size={16} />
                    </button>

                    {formData.mediaType === "video" ? (
                      <video
                        src={preview}
                        controls
                        className="rounded shadow-sm border"
                        style={{
                          width: "120px",
                          height: "90px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img
                        src={preview}
                        alt={`new-${idx}`}
                        className="rounded shadow-sm border"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Input */}
          <div className="mt-3">
            <label className="btn btn-outline-primary w-100">
              <input
                type="file"
                className="d-none"
                name="media"
                accept="image/*,video/*"
                multiple
                onChange={handleChange}
              />
              {totalMediaCount > 0 ? '+ Add More Media' : '+ Add Media'}
            </label>
            <small className="text-muted d-block mt-2">
              {formData.mediaType 
                ? `Currently using ${formData.mediaType}s. You can add more ${formData.mediaType}s or remove existing ones.`
                : 'Upload images or videos (all must be the same type)'}
            </small>
          </div>
        </div>

        {formData.mediaType === 'video' && totalMediaCount > 0 && (
          <div className="mb-3">
            <label className="form-label fw-semibold text-dark">
              Video Category <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category...</option>
              {VIDEO_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold text-dark">Tags (comma separated)</label>
          <input
            type="text"
            className="form-control"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. business, announcement, products"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-dark">Location</label>
          <input
            type="text"
            className="form-control"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Business location or event venue"
          />
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary flex-grow-1"
            disabled={loading || (formData.mediaType === 'video' && totalMediaCount > 0 && !formData.category)}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Updating...
              </>
            ) : (
              'Update Post'
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {formData.mediaType === 'video' && totalMediaCount > 0 && !formData.category && (
          <div className="text-center mt-2">
            <small className="text-warning">
              📹 Please select a category for your video to continue
            </small>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditPagePost;
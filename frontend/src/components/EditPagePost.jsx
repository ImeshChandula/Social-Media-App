import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { BsTrash } from "react-icons/bs";

const EditPagePost = ({ pageId, post, onPostUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    content: '',
    media: [],
    mediaPreview: [],
    mediaType: '',
    category: '',
    tags: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [mediaChanged, setMediaChanged] = useState(false);

  const VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];

  useEffect(() => {
    if (post) {
      setFormData({
        content: post.content || '',
        media: post.media || [],
        mediaPreview: post.media || [],
        mediaType: post.mediaType || '',
        category: post.category || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        location: post.location || '',
      });
    }
  }, [post]);

  useEffect(() => {
    return () => {
      if (mediaChanged && formData.mediaType === 'video') {
        formData.mediaPreview.forEach(preview => {
          try {
            if (preview.startsWith('blob:')) {
              URL.revokeObjectURL(preview);
            }
          } catch {}
        });
      }
    };
  }, [formData.mediaPreview, formData.mediaType, mediaChanged]);

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

      let detectedType = formData.mediaType;

      for (const file of files) {
        const base64 = await handleMediaUpload(file);
        const type = file.type.startsWith('video') ? 'video' : 'image';

        if (!detectedType) {
          detectedType = type;
        } else if (detectedType !== type) {
          toast.error('You can only upload one type: all images or all videos.');
          return;
        }

        base64Files.push(base64);
        previews.push(type === 'video' ? URL.createObjectURL(file) : base64);
      }

      setMediaChanged(true);
      setFormData((prev) => ({
        ...prev,
        media: base64Files,
        mediaPreview: previews,
        mediaType: detectedType,
        category: detectedType === 'video' ? prev.category : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveMedia = () => {
    if (mediaChanged && formData.mediaType === 'video') {
      formData.mediaPreview.forEach(preview => {
        try {
          if (preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
          }
        } catch {}
      });
    }

    setMediaChanged(true);
    setFormData((prev) => ({
      ...prev,
      media: [],
      mediaPreview: [],
      mediaType: '',
      category: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.content.trim() && !formData.media.length) {
      return toast.error('Content or media is required.');
    }

    if (formData.mediaType === 'video' && !formData.category) {
      return toast.error('Please select a category for your video.');
    }

    setLoading(true);
    try {
      const payload = {
        content: formData.content,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        location: formData.location,
      };

      // Only include media if it was changed
      if (mediaChanged) {
        payload.media = formData.media.length > 0 ? formData.media : null;
      }

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
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label fw-semibold mb-0 text-dark">
              Update Media {mediaChanged && <span className="badge bg-info ms-2">Changed</span>}
            </label>
            {formData.media.length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleRemoveMedia}
              >
                Remove All
              </button>
            )}
          </div>
          <input
            type="file"
            className="form-control"
            name="media"
            accept="image/*,video/*"
            multiple
            onChange={handleChange}
          />
          <small className="text-muted">
            Leave empty to keep existing media, or upload new files to replace
          </small>
          
          {formData.mediaPreview.length > 0 && (
            <div className="mt-3">
              <p className="text-muted small mb-2">
                {formData.mediaType === "video" ? "Video Preview:" : "Image Preview:"}
              </p>

              <div className="d-flex flex-wrap gap-3">
                {formData.mediaPreview.map((preview, idx) => (
                  <div key={idx} className="position-relative" style={{ width: 120 }}>
                    {mediaChanged && (
                      <button
                        type="button"
                        className="bg-danger text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                        style={{ borderRadius: "50%", width: 28, height: 28, zIndex: 10, border: 'none' }}
                        onClick={() => {
                          const newMedia = [...formData.media];
                          const newPreviews = [...formData.mediaPreview];

                          if (formData.mediaType === "video" && preview.startsWith('blob:')) {
                            try {
                              URL.revokeObjectURL(preview);
                            } catch {}
                          }

                          newMedia.splice(idx, 1);
                          newPreviews.splice(idx, 1);

                          setFormData((prev) => ({
                            ...prev,
                            media: newMedia,
                            mediaPreview: newPreviews,
                            mediaType: newMedia.length === 0 ? "" : prev.mediaType,
                            category: newMedia.length === 0 ? "" : prev.category,
                          }));
                        }}
                      >
                        <BsTrash size={16} />
                      </button>
                    )}

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
                        alt={`preview-${idx}`}
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
        </div>

        {formData.mediaType === 'video' && (
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
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Post'}
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
      </form>
    </div>
  );
};

export default EditPagePost;
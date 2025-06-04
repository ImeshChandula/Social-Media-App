import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const initialState = {
    content: '',
    media: null,
    mediaPreview: '',
    mediaType: '',
    privacy: 'public',
    tags: '',
    location: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/${postId}`);
        const { content, media, mediaType, tags, privacy, location } = res.data;

        setFormData({
          content,
          media: media || null,
          mediaPreview: media || '',
          mediaType: mediaType || '',
          tags: tags?.join(', ') || '',
          privacy: privacy || 'public',
          location: location || '',
        });
      } catch (error) {
        toast.error("Failed to load post.");
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();

    return () => {
      if (formData.mediaType === 'video' && formData.mediaPreview) {
        URL.revokeObjectURL(formData.mediaPreview);
      }
    };
  }, [postId]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.content.trim() && !formData.media) {
      return toast.error("Content or media is required.");
    }

    setUpdating(true);
    try {
      const payload = {
        content: formData.content,
        media: formData.media,
        mediaType: formData.media ? formData.mediaType : 'text',
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        privacy: formData.privacy,
        location: formData.location,
      };

      const res = await axiosInstance.patch(`/posts/update/${postId}`, payload);
      toast.success(res.data.message || "Post updated successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5 text-white">
        Loading post<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <div className="card shadow-lg border-secondary rounded-4 bg-dark text-white">
        <div className="card-body p-4">
          <h3 className="text-center mb-4">✏️ Edit Your Post</h3>

          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea
                className="form-control bg-dark text-white custom-placeholder"
                name="content"
                rows="4"
                value={formData.content}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Edit Media</label>
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
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
              />
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

            <div className="mb-4">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex gap-3">
              <button
                type="submit"
                className="btn btn-success w-100 fw-bold rounded-pill"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                className="btn btn-outline-light w-100 fw-bold rounded-pill"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPost;

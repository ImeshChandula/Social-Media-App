import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const videoPreviewRef = useRef(null);

  const [formData, setFormData] = useState({
    content: '',
    media: null,
    mediaPreview: '',
    mediaType: '',
    privacy: 'public',
    tags: '',
    location: '',
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axiosInstance.get(`/posts/getPostById/${postId}`);
        const { content, media, mediaType, tags, privacy, location } = data;

        setFormData({
          content: content || '',
          media: null,
          mediaPreview: media || '',
          mediaType: mediaType || '',
          tags: tags?.join(', ') || '',
          privacy: privacy || 'public',
          location: location || '',
        });

        if (mediaType === 'video') {
          videoPreviewRef.current = media;
        }
      } catch (error) {
        toast.error("Failed to load post.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    return () => {
      if (videoPreviewRef.current && typeof videoPreviewRef.current === "string") {
        URL.revokeObjectURL(videoPreviewRef.current);
      }
    };
  }, [postId]);

  const handleMediaUpload = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === 'media' && files?.[0]) {
      const file = files[0];
      const type = file.type.startsWith('video') ? 'video' : 'image';
      const base64 = await handleMediaUpload(file);

      if (videoPreviewRef.current && typeof videoPreviewRef.current === "string") {
        URL.revokeObjectURL(videoPreviewRef.current);
      }

      const objectURL = type === 'video' ? URL.createObjectURL(file) : base64;
      if (type === 'video') videoPreviewRef.current = objectURL;

      setFormData((prev) => ({
        ...prev,
        media: base64,
        mediaPreview: objectURL,
        mediaType: type,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveMedia = () => {
    if (videoPreviewRef.current && typeof videoPreviewRef.current === "string") {
      URL.revokeObjectURL(videoPreviewRef.current);
      videoPreviewRef.current = null;
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

    const { content, media, mediaPreview, mediaType, tags, privacy, location } = formData;

    if (!content.trim() && !mediaPreview) {
      return toast.error("Post must contain either content or media.");
    }

    const payload = {
      content: content.trim(),
      media: media || null,
      mediaType: media ? mediaType : mediaPreview ? mediaType : 'text',
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      privacy,
      location: location.trim(),
    };

    try {
      setUpdating(true);
      const { data } = await axiosInstance.patch(`/posts/update/${postId}`, payload);
      toast.success(data.message || "Post updated successfully!");
      navigate("/profile");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update post.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center my-5 fs-5 normal-loading-spinner">
        Loading post<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </div>
    )
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
                className="form-control bg-dark text-white"
                name="content"
                rows="4"
                value={formData.content}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label mb-0">Edit Media</label>
                {formData.mediaPreview && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
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
                  <img
                    src={formData.mediaPreview}
                    alt="Media Preview"
                    className="w-100 rounded shadow"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Tags (comma-separated)</label>
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
                {updating ? "Updating..." : "Update Post"}
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

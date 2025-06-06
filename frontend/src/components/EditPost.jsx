import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const detectMediaType = (media) => {
  if (!media) return "";
  if (media.startsWith("data:")) {
    if (media.includes("image")) return "image";
    if (media.includes("video")) return "video";
  } else {
    const lower = media.toLowerCase();
    if (lower.match(/\.(jpeg|jpg|png|gif|bmp|webp|svg)$/)) return "image";
    if (lower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) return "video";
  }
  return "";
};

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    content: "",
    media: "", // media URL or base64 string or empty string
    mediaType: "",
    tags: "",
    privacy: "public",
    location: "",
  });

  const [newMediaFile, setNewMediaFile] = useState(null); // holds File object if user uploads new media
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(""); // URL or base64 for preview

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/getPostById/${postId}`);
        if (response.data.success) {
          const post = response.data.post;
          setForm({
            content: post.content || "",
            media: post.media || "",
            mediaType: post.mediaType || detectMediaType(post.media || ""),
            tags: (post.tags || []).join(", "),
            privacy: post.privacy || "public",
            location: post.location || "",
          });
          setMediaPreviewUrl(post.media || "");
          setNewMediaFile(null);
        } else {
          toast.error("Post not found");
          navigate(-1);
        }
      } catch (error) {
        toast.error("Failed to fetch post data");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  // Cleanup object URLs when newMediaFile changes or component unmounts
  useEffect(() => {
    // If user uploaded a new file, create a preview URL
    if (newMediaFile) {
      const url = URL.createObjectURL(newMediaFile);
      setMediaPreviewUrl(url);

      // Cleanup
      return () => URL.revokeObjectURL(url);
    } else {
      // If no new file, preview is the media string (URL or base64)
      setMediaPreviewUrl(form.media);
    }
  }, [newMediaFile, form.media]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type (optional)
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml"];
    const validVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska", "video/avi"];

    if (![...validImageTypes, ...validVideoTypes].includes(file.type)) {
      toast.error("Unsupported media type. Please upload an image or video.");
      return;
    }

    // Update form mediaType
    const type = file.type.startsWith("image/") ? "image" : "video";

    setNewMediaFile(file);
    setForm((prev) => ({
      ...prev,
      media: "", // Clear media URL since user uploaded new file
      mediaType: type,
    }));
  };

  const handleRemoveMedia = () => {
    setNewMediaFile(null);
    setForm((prev) => ({
      ...prev,
      media: "",
      mediaType: "",
    }));
    setMediaPreviewUrl("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, tags: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true); // Disable the button

    const tagsArray = form.tags
      ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      content: form.content,
      mediaType: form.mediaType || "text",
      tags: tagsArray,
      privacy: form.privacy,
      location: form.location,
    };

    // If user uploaded a new file, convert to base64 or send file directly (depending on your backend)
    if (newMediaFile) {
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

      try {
        const base64String = await toBase64(newMediaFile);
        payload.media = base64String;
      } catch (error) {
        toast.error("Failed to read media file");
        setIsUpdating(false);
        return;
      }
    } else {
      payload.media = form.media;
    }

    try {
      await axiosInstance.patch(`/posts/update/${postId}`, payload);
      toast.success("Post updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="container my-4" style={{ maxWidth: 650 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="mb-4 text-black fw-bold text-center">Edit Post</h2>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="mb-3">
              <label htmlFor="content" className="form-label fw-semibold">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                className="form-control"
                value={form.content}
                onChange={handleChange}
                placeholder="Write something..."
                rows={4}
              />
            </div>

            {/* Media Upload */}
            <div className="mb-3">
              <label htmlFor="mediaFile" className="form-label fw-semibold">
                Upload Image or Video
              </label>
              <input
                id="mediaFile"
                type="file"
                accept="image/*,video/*"
                className="form-control"
                onChange={handleFileChange}
              />
              {(mediaPreviewUrl || mediaPreviewUrl === "") && (
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="btn btn-sm btn-outline-danger mt-2"
                >
                  Remove Media
                </button>
              )}
            </div>

            {/* Media Preview */}
            {mediaPreviewUrl && (
              <div className="mb-3">
                {form.mediaType === "video" ? (
                  <video
                    src={mediaPreviewUrl}
                    controls
                    className="img-fluid rounded"
                    style={{ maxHeight: 320 }}
                  />
                ) : form.mediaType === "image" ? (
                  <img
                    src={mediaPreviewUrl}
                    alt="media preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: 320 }}
                  />
                ) : (
                  <p className="text-muted fst-italic">Media preview not available for this media type</p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="mb-3">
              <label htmlFor="tags" className="form-label fw-semibold">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                className="form-control"
                value={form.tags}
                onChange={handleTagsChange}
                placeholder="e.g. nature, travel, fun"
              />
            </div>

            {/* Privacy */}
            <div className="mb-3">
              <label htmlFor="privacy" className="form-label fw-semibold">
                Privacy
              </label>
              <select
                id="privacy"
                name="privacy"
                className="form-select"
                value={form.privacy}
                onChange={handleChange}
                required
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Only Me</option>
              </select>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className="form-label fw-semibold">
                Location
              </label>
              <input
                id="location"
                type="text"
                name="location"
                className="form-control"
                value={form.location}
                onChange={handleChange}
                placeholder="Add a location"
              />
            </div>

            {/* Submit and Cancel */}
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary"
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

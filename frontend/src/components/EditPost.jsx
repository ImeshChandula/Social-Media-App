import React, { useState, useEffect } from "react";
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
    media: "", // URL or base64
    mediaType: "", // image | video | ''
    tags: "",
    privacy: "public",
    location: "",
  });

  const [newMediaFile, setNewMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/getPostById/${postId}`);
        if (res.data.success) {
          const post = res.data.post;
          setForm({
            content: post.content || "",
            media: post.media || "",
            mediaType: post.mediaType || detectMediaType(post.media),
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
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error("Failed to fetch post");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  useEffect(() => {
    if (newMediaFile) {
      const url = URL.createObjectURL(newMediaFile);
      setMediaPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMediaPreviewUrl(form.media);
    }
  }, [newMediaFile, form.media]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Only image or video files are allowed");
      return;
    }

    setNewMediaFile(file);
    setForm((prev) => ({
      ...prev,
      media: "",
      mediaType: isImage ? "image" : "video",
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
    setForm((prev) => ({ ...prev, tags: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const tagsArray = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      content: form.content.trim(),
      tags: tagsArray,
      privacy: form.privacy,
      location: form.location.trim(),
    };

    // Only include mediaType if media is present
    if (newMediaFile || form.media) {
      payload.mediaType = form.mediaType;
    }

    // Convert media file to base64
    if (newMediaFile) {
      const toBase64 = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });

      try {
        const base64 = await toBase64(newMediaFile);
        payload.media = base64;
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error("Failed to read file");
        setIsUpdating(false);
        return;
      }
    } else if (form.media) {
      payload.media = form.media;
    }

    try {
      await axiosInstance.patch(`/posts/update/${postId}`, payload);
      toast.success("Post updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ maxWidth: 650 }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h2 className="mb-4 text-center fw-bold">Edit Post</h2>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Content</label>
              <textarea
                name="content"
                rows={4}
                className="form-control"
                value={form.content}
                onChange={handleChange}
                placeholder="Write something..."
              />
            </div>

            {/* Media Upload */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Upload Image or Video</label>
              <input
                type="file"
                accept="image/*,video/*"
                className="form-control"
                onChange={handleFileChange}
              />
              {mediaPreviewUrl && (
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
                  <video src={mediaPreviewUrl} controls className="img-fluid rounded" style={{ maxHeight: 320 }} />
                ) : (
                  <img src={mediaPreviewUrl} alt="Preview" className="img-fluid rounded" style={{ maxHeight: 320 }} />
                )}
              </div>
            )}

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                value={form.tags}
                onChange={handleTagsChange}
                placeholder="e.g. travel, fun"
              />
            </div>

            {/* Privacy */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Privacy</label>
              <select
                name="privacy"
                className="form-select"
                value={form.privacy}
                onChange={handleChange}
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Only Me</option>
              </select>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={form.location}
                onChange={handleChange}
                placeholder="Add a location"
              />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary me-2" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  "Update Post"
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
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

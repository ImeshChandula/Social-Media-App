import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { BsTrash } from "react-icons/bs";
import useThemeStore from "../store/themeStore";

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
  const { isDarkMode } = useThemeStore();

  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    content: "",
    media: [], // array of base64 or URLs
    mediaPreview: [], // array of preview URLs
    mediaType: "", // image | video | ''
    tags: "",
    privacy: "public",
    location: "",
  });

  // Fetch post data and initialize form
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/posts/getPostById/${postId}`);
        if (res.data.success) {
          const post = res.data.post;

          // Setup media as array
          const mediaArray = post.media
            ? Array.isArray(post.media)
              ? post.media
              : [post.media]
            : [];

          // Detect mediaType from first media or post.mediaType
          let detectedType = post.mediaType || "";
          if (!detectedType && mediaArray.length > 0) {
            detectedType = detectMediaType(mediaArray[0]);
          }

          // Setup mediaPreview array for videos: createObjectURL for local files is not needed here because data from backend likely URLs/base64
          const mediaPreviewArray = [...mediaArray];

          setForm({
            content: post.content || "",
            media: mediaArray,
            mediaPreview: mediaPreviewArray,
            mediaType: detectedType,
            tags: (post.tags || []).join(", "),
            privacy: post.privacy || "public",
            location: post.location || "",
          });
        } else {
          toast.error("Post not found");
          navigate(-1);
        }
      } catch (err) {
        toast.error("Failed to fetch post");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  // Revoke video preview URLs on unmount or when mediaPreview changes
  useEffect(() => {
    // Only revoke URLs created with URL.createObjectURL (typically for local files)
    return () => {
      if (form.mediaType === "video") {
        form.mediaPreview.forEach((preview) => {
          try {
            URL.revokeObjectURL(preview);
          } catch {
            // ignore
          }
        });
      }
    };
  }, [form.mediaPreview, form.mediaType]);

  // Convert file to base64 helper
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // Handle new file uploads and append to media array
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    let detectedType = form.mediaType || "";

    // Check that new files are consistent type
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error("Only image or video files are allowed");
        return;
      }

      const fileType = isImage ? "image" : "video";
      if (detectedType && fileType !== detectedType) {
        toast.error("You can only upload one media type at a time: all images or all videos.");
        return;
      }
      if (!detectedType) detectedType = fileType;
    }

    try {
      // Convert all files to base64, generate preview URLs
      const base64Files = [];
      const previewUrls = [];

      for (const file of files) {
        const base64 = await fileToBase64(file);
        base64Files.push(base64);

        // For videos, createObjectURL for preview (since base64 preview for videos is heavy)
        if (detectedType === "video") {
          previewUrls.push(URL.createObjectURL(file));
        } else {
          previewUrls.push(base64);
        }
      }

      // If previous mediaType is video and new files are images or vice versa, revoke previous video preview URLs
      if (form.mediaType === "video" && detectedType !== "video") {
        form.mediaPreview.forEach((preview) => {
          try {
            URL.revokeObjectURL(preview);
          } catch { }
        });
      }

      setForm((prev) => ({
        ...prev,
        media: [...prev.media, ...base64Files],
        mediaPreview: [...prev.mediaPreview, ...previewUrls],
        mediaType: detectedType,
      }));
    } catch (error) {
      toast.error("Failed to read files");
    }

    // Reset input value so same file can be reselected if needed
    e.target.value = null;
  };

  // Remove a single media item by index
  const handleRemoveMediaItem = (index) => {
    if (form.mediaType === "video") {
      // Revoke video preview URL for removed item
      try {
        URL.revokeObjectURL(form.mediaPreview[index]);
      } catch { }
    }

    const newMedia = [...form.media];
    const newPreviews = [...form.mediaPreview];

    newMedia.splice(index, 1);
    newPreviews.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      media: newMedia,
      mediaPreview: newPreviews,
      mediaType: newMedia.length === 0 ? "" : prev.mediaType,
    }));
  };

  // Remove all media
  const handleRemoveAllMedia = () => {
    if (form.mediaType === "video") {
      form.mediaPreview.forEach((preview) => {
        try {
          URL.revokeObjectURL(preview);
        } catch { }
      });
    }

    setForm((prev) => ({
      ...prev,
      media: [],
      mediaPreview: [],
      mediaType: "",
    }));
  };

  // Normal field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Tags input handler
  const handleTagsChange = (e) => {
    setForm((prev) => ({ ...prev, tags: e.target.value }));
  };

  // Submit updated post
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

    if (form.media.length > 0) {
      payload.mediaType = form.mediaType;
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
    <div
      className={`container my-4 ${isDarkMode ? "text-white" : "text-black"}`}
      style={{ maxWidth: 650 }}
    >
      <div
        className={`card-body p-4 rounded-4 shadow ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
          }`}
      >
        <h2 className="mb-4 text-center fw-bold" >Edit Post</h2>

        <form onSubmit={handleSubmit}>
          {/* Content */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Content</label>
            <textarea
              name="content"
              rows={4}
              className={`form-control ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
              value={form.content}
              onChange={handleChange}
              placeholder="Write something..."
            />
          </div>

          {/* Media Upload */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label className={`form-label fw-semibold mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>Upload Images or Videos</label>
              {form.media.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger m-1"
                  onClick={handleRemoveAllMedia}
                >
                  Remove All Media
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              className={`form-control ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Media Previews */}
          {form.mediaPreview.length > 0 && (
            <div className="mb-3 d-flex flex-wrap gap-3">
              {form.mediaPreview.map((preview, idx) => (
                <div key={idx} className="position-relative" style={{ width: 120 }}>
                  <button
                    type="button"
                    className="bg-red-600 text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: 28, height: 28, zIndex: 10 }}
                    onClick={() => handleRemoveMediaItem(idx)}
                  >
                    <BsTrash size={16} />
                  </button>
                  {form.mediaType === "video" ? (
                    <video
                      src={preview}
                      controls
                      className={`rounded shadow-sm border ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      style={{ width: "120px", height: "90px", objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`preview-${idx}`}
                      className={`rounded shadow-sm border ${isDarkMode ? "border-gray-600" : "border-gray-300"
                        }`}
                      style={{ width: "120px", height: "120px", objectFit: "contain" }}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              className={`form-control ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
              value={form.tags}
              onChange={handleTagsChange}
              placeholder="e.g. travel, fun"
            />
          </div>

          {/* Privacy */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Privacy</label>
            <select
              name="privacy"
              className={`form-select ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
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
            <label className={`form-label fw-semibold ${isDarkMode ? "text-white" : "text-black"}`}>Location</label>
            <input
              type="text"
              name="location"
              className={`form-control ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900"
                }`}
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
  );
};

export default EditPost;

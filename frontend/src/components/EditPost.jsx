import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const EditPost = () => {
  const { postId } = useParams(); // postId from URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    content: "",
    media: "",      // media URL or base64 string
    mediaType: "",  // e.g. 'image', 'video', 'audio'
    tags: "",
    privacy: "public", // default value
    location: "",
  });

  // For media preview if video/image
  const mediaPreviewRef = useRef(null);

  // Fetch post data to prefill form
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/getPostById/${postId}`);

        if (response.data.success) {
          const post = response.data.post;

          setForm({
            content: post.content || "",
            media: post.media || "",
            mediaType: post.mediaType || "",
            tags: (post.tags || []).join(", "),
            privacy: post.privacy || "public",
            location: post.location || "",
          });
        } else {
          toast.error("Post not found");
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tags input change - split by comma for backend
  const handleTagsChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, tags: value }));
  };

  // Handle media input change (for URL or base64 input)
  const handleMediaChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, media: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare tags array (split by comma, trim spaces)
    const tagsArray = form.tags
      ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    // Prepare update payload
    const payload = {
      content: form.content,
      media: form.media || undefined,  // send undefined if empty
      mediaType: form.media ? form.mediaType : undefined, // require mediaType only if media exists
      tags: tagsArray,
      privacy: form.privacy,
      location: form.location,
    };

    try {
      await axiosInstance.patch(`/posts/update/${postId}`, payload, {
        withCredentials: true,
      });

      toast.success("Post updated successfully");
      navigate(-1); // go back to previous page or feed
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to update post"
      );
    }
  };

  if (loading) {
    return <p>Loading post data...</p>;
  }

  return (
    <div className="edit-post-container" style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit}>
        {/* Content */}
        <div>
          <label>Content</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write something..."
            rows={4}
            style={{ width: "100%" }}
          />
        </div>

        {/* Media URL or Base64 */}
        <div>
          <label>Media URL or Base64 Data</label>
          <input
            type="text"
            name="media"
            value={form.media}
            onChange={handleMediaChange}
            placeholder="Paste media URL or base64 string"
            style={{ width: "100%" }}
          />
        </div>

        {/* Media Preview */}
        {form.media && (
          <div style={{ margin: "10px 0" }}>
            {form.mediaType === "video" ? (
              <video
                ref={mediaPreviewRef}
                src={form.media}
                controls
                style={{ maxWidth: "100%" }}
              />
            ) : form.mediaType === "image" ? (
              <img
                ref={mediaPreviewRef}
                src={form.media}
                alt="media preview"
                style={{ maxWidth: "100%" }}
              />
            ) : (
              <p>Media preview not available for type: {form.mediaType}</p>
            )}
          </div>
        )}

        {/* Media Type */}
        <div>
          <label>Media Type</label>
          <select
            name="mediaType"
            value={form.mediaType}
            onChange={handleChange}
            disabled={!form.media} // disable if no media
            required={!!form.media}
          >
            <option value="">Select media type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label>Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleTagsChange}
            placeholder="e.g. nature, travel, fun"
            style={{ width: "100%" }}
          />
        </div>

        {/* Privacy */}
        <div>
          <label>Privacy</label>
          <select
            name="privacy"
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
        <div>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Add a location"
            style={{ width: "100%" }}
          />
        </div>

        {/* Submit */}
        <button type="submit" style={{ marginTop: 10 }}>
          Update Post
        </button>
      </form>
    </div>
  );
};

export default EditPost;

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const detectMediaType = (media) => {
  if (!media) return "";
  // Basic detection based on file extension or base64 mime type
  if (media.startsWith("data:")) {
    if (media.includes("image")) return "image";
    if (media.includes("video")) return "video";
    if (media.includes("audio")) return "audio";
  } else {
    const lower = media.toLowerCase();
    if (lower.match(/\.(jpeg|jpg|png|gif|bmp|webp|svg)$/)) return "image";
    if (lower.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/)) return "video";
    if (lower.match(/\.(mp3|wav|ogg|m4a|flac)$/)) return "audio";
  }
  return "";
};

const EditPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    content: "",
    media: "",
    mediaType: "",
    tags: "",
    privacy: "public",
    location: "",
  });

  const mediaPreviewRef = useRef(null);

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

  // Update media and detect mediaType automatically
  const handleMediaChange = (e) => {
    const media = e.target.value;
    const detectedType = detectMediaType(media);
    setForm((prev) => ({
      ...prev,
      media,
      mediaType: detectedType,
    }));
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

    const tagsArray = form.tags
      ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      content: form.content,
      media: form.media || undefined,
      mediaType: form.media ? form.mediaType : undefined,
      tags: tagsArray,
      privacy: form.privacy,
      location: form.location,
    };

    try {
      await axiosInstance.patch(`/posts/update/${postId}`, payload);
      toast.success("Post updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    }
  };

  if (loading) return <p>Loading post data...</p>;

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

        {/* Auto Media Preview */}
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
            ) : form.mediaType === "audio" ? (
              <audio
                ref={mediaPreviewRef}
                src={form.media}
                controls
                style={{ width: "100%" }}
              />
            ) : (
              <p>Media preview not available for this media type</p>
            )}
          </div>
        )}

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

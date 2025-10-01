import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import useThemeStore from "../store/themeStore";

const CreateStory = () => {
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [type, setType] = useState("image");
  const [privacy, setPrivacy] = useState("friends");
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();

  /* helper: convert File → base-64 */
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  /* choose / convert file */
  const handleFile = async (e) => {
    const chosen = e.target.files[0];
    if (!chosen) return;

    // Validate file size (optional, can adjust based on backend limits)
    if (chosen.size > 10 * 1024 * 1024) { // 10MB limit
      setError("File size exceeds 10MB limit");
      return;
    }

    setFile(chosen);
    try {
      const b64 = await toBase64(chosen);
      setFileData(b64);
      setError("");
    } catch {
      setError("Could not read file. Please try another file.");
    }
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate inputs (matching backend requirements)
    if (!content.trim() && !fileData) {
      setError("Please provide either text content or a media file");
      return;
    }

    // Validate media type
    if (fileData && !["image", "video"].includes(type)) {
      setError("Invalid media type. Please select image or video");
      return;
    }

    // Validate privacy setting
    if (!["friends", "public"].includes(privacy)) {
      setError("Invalid privacy setting");
      return;
    }

    const payload = {
      content: content.trim() || undefined,
      media: fileData || undefined,
      type: fileData ? type : "text",
      caption: caption.trim() || undefined,
      privacy
    };

    try {
      setSaving(true);
      const response = await axiosInstance.post("/stories/createStory", payload);
      setSuccess(response.data.message || "Story created successfully!");

      // Reset form
      setContent("");
      setCaption("");
      setType("image");
      setPrivacy("friends");
      setFile(null);
      setFileData("");

      // Redirect to feed after 1 second
      setTimeout(() => {
        //navigate("/stories/feed");
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to create story. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '720px' }}>
      <div className={`createpost-bg card-body p-4 text-dark rounded-4 ${isDarkMode ? "" : "createpost-bg-light"}`}>
        <h3 className={`text-center mb-4 fw-bold ${isDarkMode ? "text-white" : "text-black"}`}>📝 Create a Story</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* story text */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Story text</label>
            <textarea
              className="form-control"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              disabled={saving}
            />
          </div>

          {/* media type selector */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Media type</label>
            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={saving}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {/* file picker */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>
              {type === "image" ? "Choose image" : "Choose video"}
            </label>
            <input
              className="form-control"
              type="file"
              accept={type === "image" ? "image/*" : "video/*"}
              onChange={handleFile}
              disabled={saving}
            />
            {file && (
              <small className="text-info d-block mt-1">✔ {file.name}</small>
            )}
          </div>

          {/* caption */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Caption (optional)</label>
            <input
              className="form-control"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Nice sunset!"
              disabled={saving}
            />
          </div>

          {/* privacy */}
          <div className="mb-3">
            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Privacy</label>
            <select
              className="form-select"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              disabled={saving}
            >
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={saving}
          >
            {saving ? "Posting…" : "Post Story"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;
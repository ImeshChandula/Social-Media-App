import React, { useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const CreatePageStory = ({ pageId, pageData, onStoryCreated, onCancel, isModal = false }) => {
  const [content, setContent] = useState("");
  const [caption, setCaption] = useState("");
  const [type, setType] = useState("image");
  const [privacy, setPrivacy] = useState("public");
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    
    // Validate file size
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

    // Validate inputs
    if (!content.trim() && !fileData) {
      setError("Please provide either text content or a media file");
      return;
    }

    if (fileData && !["image", "video"].includes(type)) {
      setError("Invalid media type. Please select image or video");
      return;
    }

    if (!["public", "friends"].includes(privacy)) {
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
      const response = await axiosInstance.post(`/pages/${pageId}/stories`, payload);
      
      if (response.data.success) {
        const newStory = response.data.story;
        
        // Add page data to the story for proper display
        const populatedStory = {
          ...newStory,
          user: {
            id: pageData.id,
            firstName: '',
            lastName: '',
            username: pageData.username || pageData.pageName,
            profilePicture: pageData.profilePicture,
            pageName: pageData.pageName,
            isPage: true
          },
          authorType: 'page'
        };
        
        onStoryCreated(populatedStory);
        
        // Reset form
        setContent("");
        setCaption("");
        setType("image");
        setPrivacy("public");
        setFile(null);
        setFileData("");
        setSuccess(response.data.message || "Page story created successfully!");
        
        if (!isModal) {
          // If not in modal, show success and redirect
          setTimeout(() => {
            onCancel && onCancel();
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create page story. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const containerClass = isModal ? "" : "container mt-5";
  const cardClass = isModal ? "" : "card shadow-lg rounded-4 border border-light";
  const bodyClass = isModal ? "" : "card-body p-4 bg-white text-dark";

  return (
    <div className={containerClass} style={!isModal ? { maxWidth: '720px' } : {}}>
      <div className={cardClass}>
        <div className={bodyClass}>
          
          {/* Page Info Header - only show if not in modal */}
          {!isModal && pageData && (
            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
              <img
                src={pageData.profilePicture || '/default-page-avatar.png'}
                alt={pageData.pageName}
                className="rounded-circle me-3"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              />
              <div>
                <h6 className="mb-0 fw-bold">{pageData.pageName}</h6>
                <small className="text-muted">Creating story as page</small>
              </div>
            </div>
          )}

          {!isModal && (
            <h3 className="text-center mb-4">Create Page Story</h3>
          )}
          
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* story text */}
            <div className="mb-3">
              <label className="form-label text-white">Story text</label>
              <textarea
                className="form-control bg-dark text-white border-secondary"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update from your page..."
                disabled={saving}
              />
            </div>

            {/* media type selector */}
            <div className="mb-3">
              <label className="form-label text-white">Media type</label>
              <select
                className="form-select bg-dark text-white border-secondary"
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
              <label className="form-label text-white">
                {type === "image" ? "Choose image" : "Choose video"}
              </label>
              <input
                className="form-control bg-dark text-white border-secondary"
                type="file"
                accept={type === "image" ? "image/*" : "video/*"}
                onChange={handleFile}
                disabled={saving}
              />
              {file && (
                <small className="text-info d-block mt-1">Selected: {file.name}</small>
              )}
            </div>

            {/* caption */}
            <div className="mb-3">
              <label className="form-label text-white">Caption (optional)</label>
              <input
                className="form-control bg-dark text-white border-secondary"
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption for your story..."
                disabled={saving}
              />
            </div>

            {/* privacy */}
            <div className="mb-3">
              <label className="form-label text-white">Privacy</label>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                disabled={saving}
              >
                <option value="public">Public</option>
                <option value="friends">Followers Only</option>
              </select>
              <div className="form-text text-muted">
                Most page stories should be public to reach the widest audience.
              </div>
            </div>

            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary flex-grow-1" 
                type="submit"
                disabled={saving}
              >
                {saving ? "Publishing..." : "Publish Story"}
              </button>
              
              {isModal && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={onCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePageStory;
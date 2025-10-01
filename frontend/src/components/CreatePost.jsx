import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BsTrash } from "react-icons/bs";
import useThemeStore from '../store/themeStore';

const CreatePost = () => {
    const initialState = {
        content: '',
        media: [],            // now an array
        mediaPreview: [],
        mediaType: '',
        category: '',         // NEW: Category field for videos
        privacy: 'public',
        tags: '',
        location: '',
    };

    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const { isDarkMode } = useThemeStore();

    //video category matching backend model
    const VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];


    useEffect(() => {
        return () => {
            if (formData.mediaType === 'video' && formData.mediaPreview) {
                URL.revokeObjectURL(formData.mediaPreview);
            }
        };
    }, [formData.mediaPreview, formData.mediaType]);

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

            let detectedType = formData.mediaType; // start from existing mediaType

            for (const file of files) {
                const base64 = await handleMediaUpload(file);
                const type = file.type.startsWith('video') ? 'video' : 'image';

                // If no detectedType yet, set it
                if (!detectedType) {
                    detectedType = type;
                }
                // If detectedType differs from file's type, show error and exit
                else if (detectedType !== type) {
                    toast.error('You can only upload one type: all images or all videos.');
                    return;
                }

                base64Files.push(base64);
                previews.push(type === 'video' ? URL.createObjectURL(file) : base64);
            }

            // If changing from video to image or vice versa, revoke old video URLs
            if (
                formData.mediaType === 'video' &&
                detectedType !== 'video' &&
                formData.mediaPreview.length > 0
            ) {
                formData.mediaPreview.forEach((preview) => URL.revokeObjectURL(preview));
            }

            setFormData((prev) => ({
                ...prev,
                media: [...prev.media, ...base64Files],         // append new base64 files
                mediaPreview: [...prev.mediaPreview, ...previews], // append new previews
                mediaType: detectedType,
                category: detectedType === 'video' ? prev.category : '', // Reset category if switching from video to image
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveMedia = () => {
        if (formData.mediaType === 'video') {
            formData.mediaPreview.forEach(preview => URL.revokeObjectURL(preview));
        }

        setFormData((prev) => ({
            ...prev,
            media: [],
            mediaPreview: [],
            mediaType: '',
            category: '', // Reset category when removing media
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content.trim() && !formData.media) {
            return toast.error('Content or media is required.')
        }

        // Validate category for video posts
        if (formData.mediaType === 'video' && !formData.category) {
            return toast.error('Please select a category for your video.');
        }

        setLoading(true);
        try {
            const payload = {
                content: formData.content,
                media: formData.media.length > 0 ? formData.media : null,
                mediaType: formData.media.length > 0 ? formData.mediaType : 'text',
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                privacy: formData.privacy,
                location: formData.location,
            };

            // Add category only for video posts
            if (formData.mediaType === 'video' && formData.category) {
                payload.category = formData.category;
            }

            const res = await axiosInstance.post('/posts/createPost', payload);
            toast.success(res.data.message || 'Post created successfully!');
            setFormData(initialState);
            navigate(-1)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '720px' }}>
            <div className={`createpost-bg card-body p-4 text-dark rounded-4 ${isDarkMode ? "" : "createpost-bg-light"}`}>
                <h3 className={`text-center mb-4 fw-bold ${isDarkMode ? "text-white" : "text-black"}`}>📝 Create a Post</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Content</label>
                        <textarea
                            className="form-control"
                            name="content"
                            rows="4"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="What's on your mind?"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <label className={`form-label fw-semibold mb-0 ${isDarkMode ? "" : "form-label-light"}`}>Upload Media</label>
                            {formData.media && (
                                <button
                                    type="button"
                                    className="btn btn-sm p-2 m-1 btn-outline-danger border border-danger"
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
                        {formData.mediaPreview.length > 0 && (
                            <div className="mt-3">
                                <p className="text-white-50 small mb-2">
                                    {formData.mediaType === "video" ? "Video Preview:" : "Image Preview:"}
                                </p>

                                <div className="d-flex flex-wrap gap-3">
                                    {formData.mediaPreview.map((preview, idx) => (
                                        <div key={idx} className="position-relative" style={{ width: 120 }}>
                                            {/* Delete button */}
                                            <button
                                                type="button"
                                                className="bg-danger text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                                                style={{ borderRadius: "50%", width: 28, height: 28, zIndex: 10 }}
                                                aria-label="Remove media"
                                                onClick={() => {
                                                    if (formData.mediaType === "video") {
                                                        URL.revokeObjectURL(preview);
                                                    }

                                                    const newMedia = [...formData.media];
                                                    const newPreviews = [...formData.mediaPreview];

                                                    newMedia.splice(idx, 1);
                                                    newPreviews.splice(idx, 1);

                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        media: newMedia,
                                                        mediaPreview: newPreviews,
                                                        mediaType: newMedia.length === 0 ? "" : prev.mediaType,
                                                        category: newMedia.length === 0 ? "" : prev.category, // Reset category if no more media
                                                    }));
                                                }}
                                            >
                                                <BsTrash size={16} />
                                            </button>

                                            {/* Render media */}
                                            {formData.mediaType === "video" ? (
                                                <video
                                                    src={preview}
                                                    controls
                                                    className="rounded shadow-sm border"
                                                    style={{
                                                        width: "120px",
                                                        height: "90px",
                                                        objectFit: "cover",
                                                        userSelect: "none",
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
                                                        userSelect: "none",
                                                    }}
                                                    loading="lazy"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Selection - Only show for videos */}
                    {formData.mediaType === 'video' && (
                        <div className="mb-3">
                            <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>
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
                            <div className="form-text text-muted">
                                Selecting a category helps others discover your video content on the Videos page.
                            </div>
                            {formData.mediaType === 'video' && !formData.category && (
                                <div className="text-warning small mt-1">
                                    ⚠️ Category is required for video posts
                                </div>
                            )}
                        </div>
                    )}


                    <div className="mb-3">
                        <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Tags (comma separated)</label>
                        <input
                            type="text"
                            className="form-control"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g. travel, food, nature"
                        />
                    </div>

                    <div className="mb-3">
                        <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Privacy</label>
                        <select
                            className="form-select"
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
                        <label className={`form-label fw-semibold ${isDarkMode ? "" : "form-label-light"}`}>Location</label>
                        <input
                            type="text"
                            className="form-control"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City or place name"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 fw-bold rounded-pill"
                        disabled={loading || (formData.mediaType === 'video' && !formData.category)}
                    >
                        {loading ? 'Posting...' : 'Post Now'}
                    </button>

                    {/* Category Reminder for Video Posts */}
                    {formData.mediaType === 'video' && !formData.category && (
                        <div className="text-center mt-2">
                            <small className="text-warning">
                                📹 Please select a category for your video to continue
                            </small>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default CreatePost;



import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { BsTrash } from "react-icons/bs";

const CreatePagePost = ({ pageId, pageData, onPostCreated, onCancel, isModal = false }) => {
    const initialState = {
        content: '',
        media: [],
        mediaPreview: [],
        mediaType: '',
        category: '',
        privacy: 'public',
        tags: '',
        location: '',
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];

    useEffect(() => {
        return () => {
            if (formData.mediaType === 'video' && formData.mediaPreview) {
                formData.mediaPreview.forEach(preview => {
                    try {
                        URL.revokeObjectURL(preview);
                    } catch (e) {
                        // Ignore errors for non-object URLs
                    }
                });
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

            let detectedType = formData.mediaType;

            for (const file of files) {
                const base64 = await handleMediaUpload(file);
                const type = file.type.startsWith('video') ? 'video' : 'image';

                if (!detectedType) {
                    detectedType = type;
                } else if (detectedType !== type) {
                    toast.error('You can only upload one type: all images or all videos.');
                    return;
                }

                base64Files.push(base64);
                previews.push(type === 'video' ? URL.createObjectURL(file) : base64);
            }

            if (
                formData.mediaType === 'video' &&
                detectedType !== 'video' &&
                formData.mediaPreview.length > 0
            ) {
                formData.mediaPreview.forEach((preview) => {
                    try {
                        URL.revokeObjectURL(preview);
                    } catch (e) {
                        // Ignore errors
                    }
                });
            }

            setFormData((prev) => ({
                ...prev,
                media: [...prev.media, ...base64Files],
                mediaPreview: [...prev.mediaPreview, ...previews],
                mediaType: detectedType,
                category: detectedType === 'video' ? prev.category : '',
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveMedia = () => {
        if (formData.mediaType === 'video') {
            formData.mediaPreview.forEach(preview => {
                try {
                    URL.revokeObjectURL(preview);
                } catch (e) {
                    // Ignore errors
                }
            });
        }

        setFormData((prev) => ({
            ...prev,
            media: [],
            mediaPreview: [],
            mediaType: '',
            category: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content.trim() && !formData.media.length) {
            return toast.error('Content or media is required.')
        }

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

            if (formData.mediaType === 'video' && formData.category) {
                payload.category = formData.category;
            }

            const res = await axiosInstance.post(`/pages/${pageId}/posts`, payload);
            
            if (res.data.success) {
                const newPost = res.data.post;
                
                // Add page data to the post for proper display
                const populatedPost = {
                    ...newPost,
                    author: {
                        id: pageData.id,
                        username: pageData.username || pageData.pageName,
                        firstName: '',
                        lastName: '',
                        profilePicture: pageData.profilePicture,
                        pageName: pageData.pageName,
                        isPage: true
                    },
                    authorType: 'page'
                };
                
                onPostCreated(populatedPost);
                setFormData(initialState);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create page post.')
        } finally {
            setLoading(false);
        }
    };

    const containerClass = isModal ? "" : "container mt-5";
    const cardClass = isModal ? "" : "createpost-bg card-body p-4 text-dark rounded-4";

    return (
        <div className={containerClass} style={!isModal ? { maxWidth: '720px' } : {}}>
            <div className={cardClass}>
                {/* Page Info Header - only show if not in modal (modal has its own header) */}
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
                            <small className="text-muted">Creating post as page</small>
                        </div>
                    </div>
                )}

                {!isModal && (
                    <h3 className="text-center mb-4 text-primary fw-bold">📝 Create Page Post</h3>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-white">Content</label>
                        <textarea
                            className="form-control bg-dark text-white border-secondary"
                            name="content"
                            rows="4"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="What would you like to share from your page?"
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <label className="form-label fw-semibold mb-0 text-white">Upload Media</label>
                            {formData.media.length > 0 && (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger m-1"
                                    onClick={handleRemoveMedia}
                                >
                                    Remove All
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            className="form-control bg-dark text-white border-secondary"
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
                                            <button
                                                type="button"
                                                className="bg-danger text-white position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                                                style={{ borderRadius: "50%", width: 28, height: 28, zIndex: 10, border: 'none' }}
                                                aria-label="Remove media"
                                                onClick={() => {
                                                    if (formData.mediaType === "video") {
                                                        try {
                                                            URL.revokeObjectURL(preview);
                                                        } catch (e) {
                                                            // Ignore errors
                                                        }
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
                                                        category: newMedia.length === 0 ? "" : prev.category,
                                                    }));
                                                }}
                                            >
                                                <BsTrash size={16} />
                                            </button>

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

                    {formData.mediaType === 'video' && (
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-white">
                                Video Category <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select bg-dark text-white border-secondary"
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
                                Selecting a category helps others discover your video content.
                            </div>
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label fw-semibold text-white">Tags (comma separated)</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="e.g. business, announcement, products"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold text-white">Privacy</label>
                        <select
                            className="form-select bg-dark text-white border-secondary"
                            name="privacy"
                            value={formData.privacy}
                            onChange={handleChange}
                        >
                            <option value="public">Public</option>
                            <option value="friends">Followers Only</option>
                        </select>
                        <div className="form-text text-muted">
                            Most page posts should be public to reach the widest audience.
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold text-white">Location</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Business location or event venue"
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary flex-grow-1 py-2 fw-bold rounded-pill"
                            disabled={loading || (formData.mediaType === 'video' && !formData.category)}
                        >
                            {loading ? 'Publishing...' : 'Publish Page Post'}
                        </button>
                        
                        {isModal && (
                            <button
                                type="button"
                                className="btn btn-secondary py-2"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        )}
                    </div>

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

export default CreatePagePost;
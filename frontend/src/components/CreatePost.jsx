import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BsTrash } from "react-icons/bs";

const CreatePost = () => {
    const initialState = {
        content: '',
        media: [],            // now an array
        mediaPreview: [],
        mediaType: '',
        privacy: 'public',
        tags: '',
        location: '',
    };

    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);

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

            let detectedType = '';

            for (const file of files) {
                const base64 = await handleMediaUpload(file);
                const type = file.type.startsWith('video') ? 'video' : 'image';

                if (!detectedType) detectedType = type;
                if (detectedType !== type) {
                    toast.error('You can only upload one type: all images or all videos.');
                    return;
                }

                base64Files.push(base64);
                previews.push(type === 'video' ? URL.createObjectURL(file) : base64);
            }

            // Revoke previous previews if videos
            if (formData.mediaType === 'video') {
                formData.mediaPreview.forEach(preview => URL.revokeObjectURL(preview));
            }

            setFormData((prev) => ({
                ...prev,
                media: base64Files,
                mediaPreview: previews,
                mediaType: detectedType,
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
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content.trim() && !formData.media) {
            return toast.error('Content or media is required.')
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
            <div className="createpost-bg card-body p-4 text-dark rounded-4">
                <h3 className="text-center mb-4 text-primary fw-bold">📝 Create a Post</h3>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Content</label>
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
                            <label className="form-label fw-semibold mb-0">Upload Media</label>
                            {formData.media && (
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

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Tags (comma separated)</label>
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
                        <label className="form-label fw-semibold">Privacy</label>
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
                        <label className="form-label fw-semibold">Location</label>
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
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Post Now'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;

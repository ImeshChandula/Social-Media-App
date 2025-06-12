import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const CreateStory = () => {
    const initialState = {
        content: '',
        media: null,
        mediaPreview: '',
        mediaType: '',
        type: '',
        privacy: 'public',
        caption: '',
    };

    const [formData, setFormData] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

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

        if (name === 'media' && files?.[0]) {
            const file = files[0];
            const base64 = await handleMediaUpload(file);
            const type = file.type.startsWith('video') ? 'video' : 'image';

            if (formData.mediaType === 'video' && formData.mediaPreview) {
                URL.revokeObjectURL(formData.mediaPreview);
            }

            setFormData((prev) => ({
                ...prev,
                media: base64,
                mediaPreview: type === 'video' ? URL.createObjectURL(file) : base64,
                mediaType: type,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleRemoveMedia = () => {
        if (formData.mediaType === 'video' && formData.mediaPreview) {
            URL.revokeObjectURL(formData.mediaPreview);
        }

        setFormData((prev) => ({
            ...prev,
            media: null,
            mediaPreview: '',
            mediaType: '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content.trim() && !formData.media) {
            return setMessage({ type: 'danger', text: 'Content or media is required.' });
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                content: formData.content,
                media: formData.media,
                type: formData.media ? formData.mediaType : 'text',
                caption: 'text',
                privacy: formData.privacy,
            };

            const res = await axiosInstance.post('/stories/createStory', payload);

            setMessage({ type: 'success', text: res.data.message || 'Post created successfully!' });
            setFormData(initialState);
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || 'Failed to create post.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '720px' }}>
            <div className="card shadow-lg rounded-4 border border-light">
                <div className="card-body p-4 bg-white text-dark">
                    <h3 className="text-center mb-4">Add story </h3>

                    {message && (
                        <div className={`alert alert-${message.type}`} role="alert">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Content</label>
                            <textarea
                                className="form-control"
                                name="content"
                                rows="4"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="What's on your mind?"
                            />
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <label className="form-label mb-0">Upload Media</label>
                                {formData.media && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger my-2"
                                        onClick={handleRemoveMedia}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                className="form-control"
                                name="media"
                                accept="image/*,video/*"
                                onChange={handleChange}
                            />
                            {formData.mediaPreview && formData.mediaType === 'video' && (
                                <div className="mt-3">
                                    <p className="text-white-50">Video Preview:</p>
                                    <video
                                        src={formData.mediaPreview}
                                        controls
                                        className="w-100 rounded shadow"
                                        style={{ maxHeight: '300px' }}
                                    />
                                </div>
                            )}
                            {formData.mediaPreview && formData.mediaType === 'image' && (
                                <div className="mt-3">
                                    <p className="text-white-50">Image Preview:</p>
                                    <img
                                        src={formData.mediaPreview}
                                        alt="preview"
                                        className="w-100 rounded shadow"
                                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                                    />
                                </div>
                            )}
                        </div>


                        <div className="mb-3">
                            <label className="form-label">Privacy</label>
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
        </div>
    );
};

export default CreateStory;

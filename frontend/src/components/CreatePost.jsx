import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const CreatePost = () => {
    const initialState = {
        content: '',
        media: null,
        mediaPreview: '',
        mediaType: '',
        privacy: 'public',
        tags: '',
        location: '',
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

            // Clean up old preview
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.content.trim() && !formData.media) {
            return setMessage({ type: 'danger', text: 'Content or media is required.' });
        }

        setLoading(true);
        setMessage(null);

        const payload = {
            content: formData.content.trim(),
            media: formData.media || '',
            mediaType: formData.media ? formData.mediaType : '', // empty string if no media
            privacy: formData.privacy,
            location: formData.location.trim(),
            tags: formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag),
        };

        console.log('🚀 SUBMITTING PAYLOAD:', payload);

        try {
            const res = await axiosInstance.post('/posts/createPost', payload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });
            setMessage({ type: 'success', text: res.data.msg || 'Post created successfully!' });
            setFormData(initialState);
        } catch (err) {
            console.error('❌ POST ERROR:', err.response?.data || err.message);
            const errorMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to create post.';
            setMessage({ type: 'danger', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '720px' }}>
            <div className="card shadow-lg border-0 rounded-4 bg-dark text-white">
                <div className="card-body p-4">
                    <h3 className="text-center mb-4">📝 Create a Post</h3>

                    {message && (
                        <div className={`alert alert-${message.type} mt-2`} role="alert">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Content</label>
                            <textarea
                                className="form-control bg-dark text-white"
                                name="content"
                                rows="4"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="What's on your mind?"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Upload Media</label>
                            <input
                                type="file"
                                className="form-control bg-dark text-white"
                                name="media"
                                accept="image/*,video/*"
                                onChange={handleChange}
                            />
                            {formData.mediaPreview && (
                                <div className="mt-3">
                                    <p className="text-muted">Preview:</p>
                                    {formData.mediaType === 'image' ? (
                                        <img
                                            src={formData.mediaPreview}
                                            alt="Preview"
                                            className="img-fluid rounded shadow"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    ) : (
                                        <video
                                            src={formData.mediaPreview}
                                            controls
                                            className="w-100 rounded shadow"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Tags (comma separated)</label>
                            <input
                                type="text"
                                className="form-control bg-dark text-white"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g. travel, food, nature"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Privacy</label>
                            <select
                                className="form-select bg-dark text-white"
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
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                className="form-control bg-dark text-white"
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
        </div>
    );
};

export default CreatePost;

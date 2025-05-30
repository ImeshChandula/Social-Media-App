import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

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
                mediaType: formData.media ? formData.mediaType : 'text',
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                privacy: formData.privacy,
                location: formData.location,
            };

            const res = await axiosInstance.post('/posts/createPost', payload);

            setMessage({ type: 'success', text: res.data.message || 'Post created successfully!' });
            toast.success(res.data.message || 'Post created successfully!');
            setFormData(initialState);
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || 'Failed to create post.',
            });
            toast.error(error.response?.data?.message || 'Failed to create post.')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '720px' }}>
            <div className="card shadow-lg border-secondary rounded-4 bg-dark text-white">
                <div className="card-body p-4">
                    <h3 className="text-center mb-4">📝 Create a Post</h3>

                    {message && (
                        <div className={`alert alert-${message.type}`} role="alert">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Content</label>
                            <textarea
                                className="form-control bg-dark text-white custom-placeholder"
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
                                className="form-control bg-dark text-white"
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
                            <label className="form-label">Tags (comma separated)</label>
                            <input
                                type="text"
                                className="form-control bg-dark text-white custom-placeholder"
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
                                className="form-control bg-dark text-white custom-placeholder"
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

import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        content: '',
        media: null,          // base64 string for upload
        mediaPreview: '',     // URL or base64 string for preview
        mediaType: '',        // 'image' or 'video'
        privacy: 'public',
        tags: '',
        location: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        return () => {
            if (formData.mediaType === 'video' && formData.mediaPreview) {
                URL.revokeObjectURL(formData.mediaPreview);
            }
        };
    }, [formData.mediaPreview, formData.mediaType]);

    // Convert file to base64 string for upload
    const handleMediaUpload = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleChange = async (e) => {
        const { name, value, files } = e.target;

        if (name === 'media' && files && files[0]) {
            const file = files[0];
            const base64 = await handleMediaUpload(file);

            if (file.type.startsWith('video')) {
                // If previous preview was a video URL, revoke it to prevent memory leaks
                if (formData.mediaType === 'video' && formData.mediaPreview) {
                    URL.revokeObjectURL(formData.mediaPreview);
                }

                setFormData({
                    ...formData,
                    media: base64,
                    mediaPreview: URL.createObjectURL(file), // video preview with URL object
                    mediaType: 'video'
                });
            } else {
                // For images use base64 for preview
                // Also revoke previous video preview URL if exists
                if (formData.mediaType === 'video' && formData.mediaPreview) {
                    URL.revokeObjectURL(formData.mediaPreview);
                }

                setFormData({
                    ...formData,
                    media: base64,
                    mediaPreview: base64,
                    mediaType: 'image'
                });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: content or media must exist
        if (!formData.content.trim() && !formData.media) {
            setMessage({ type: 'danger', text: 'Please add content or upload media.' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const payload = {
                content: formData.content,
                media: formData.media,
                mediaType: formData.mediaType,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0), // convert tags string to array
                privacy: formData.privacy,
                location: formData.location
            };

            console.log("Payload being sent:", payload);
            const res = await axiosInstance.post('/posts/createPost', payload);

            setMessage({ type: 'success', text: res.data.message || 'Post created successfully!' });
            setFormData({
                content: '',
                media: null,
                mediaPreview: '',
                mediaType: '',
                privacy: 'public',
                tags: '',
                location: ''
            });
        } catch (error) {
            setMessage({
                type: 'danger',
                text: error.response?.data?.error || 'Failed to create post.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '720px' }}>
            <div className="card shadow rounded-4 border-secondary bg-dark">
                <div className="card-body p-4">
                    <h3 className="card-title mb-4 text-center text-white">📝 Create a Post</h3>

                    {message.text && (
                        <div className={`alert alert-${message.type}`} role="alert">
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-white">Content</label>
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
                            <label className="form-label text-white">Upload Media</label>
                            <input
                                type="file"
                                className="form-control bg-dark text-white"
                                name="media"
                                accept="image/*,video/*"
                                onChange={handleChange}
                            />
                            {formData.mediaPreview && (
                                <div className="mt-3">
                                    <p className="text-white-50">Preview:</p>
                                    {formData.mediaType === 'image' ? (
                                        <img
                                            src={formData.mediaPreview}
                                            alt="preview"
                                            className="img-fluid rounded shadow-sm"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    ) : (
                                        <video
                                            src={formData.mediaPreview}
                                            controls
                                            className="w-100 rounded shadow-sm"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-white">Tags (comma separated)</label>
                            <input
                                type="text"
                                className="form-control bg-dark text-white custom-placeholder"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g. travel,food,nature"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label text-white">Privacy</label>
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
                            <label className="form-label text-white">Location</label>
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

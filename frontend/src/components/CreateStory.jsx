import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';

const CreateStory = ({ onClose }) => {
    const [storyFile, setStoryFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [fileType, setFileType] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        return () => {
            if (fileType === 'video' && preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview, fileType]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video');
        const isImage = file.type.startsWith('image');

        if (preview && fileType === 'video') {
            URL.revokeObjectURL(preview);
        }

        setStoryFile(file);
        setFileType(isVideo ? 'video' : isImage ? 'image' : '');
        setPreview(isVideo ? URL.createObjectURL(file) : URL.createObjectURL(file));
    };

    const handleCreateStory = async () => {
        if (!storyFile) {
            return setMessage({ type: 'danger', text: 'Please select a story file.' });
        }

        const formData = new FormData();
        formData.append('file', storyFile);

        try {
            setUploading(true);
            setMessage(null);

            await axiosInstance.post('/stories/createStory', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage({ type: 'success', text: 'Story uploaded successfully!' });
            setStoryFile(null);
            setPreview('');
            setFileType('');
            setTimeout(() => onClose(), 1000); // Auto-close after success
        } catch (error) {
            console.error(error);
            setMessage({
                type: 'danger',
                text: error.response?.data?.message || error.message || 'Server error',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal d-block bg-dark bg-opacity-75">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-dark text-white p-4 rounded-4 shadow-lg">
                    <h4 className="mb-3 text-center">📸 Create Story</h4>

                    {message && (
                        <div className={`alert alert-${message.type}`} role="alert">
                            {message.text}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="form-control mb-3 bg-dark text-white"
                    />

                    {preview && fileType === 'image' && (
                        <img
                            src={preview}
                            alt="Story preview"
                            className="w-100 rounded shadow"
                            style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                    )}
                    {preview && fileType === 'video' && (
                        <video
                            src={preview}
                            controls
                            className="w-100 rounded shadow"
                            style={{ maxHeight: '300px' }}
                        />
                    )}

                    <div className="d-flex justify-content-between mt-4">
                        <button className="btn btn-outline-light" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-success"
                            disabled={!storyFile || uploading}
                            onClick={handleCreateStory}
                        >
                            {uploading ? 'Uploading...' : 'Upload Story'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;

import cloudinary from '../config/cloudinary.js';

const uploadImage = async (imageData) => {
    try {
        // Ensure Cloudinary is configured
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }

        // If imageData is an array
        if (Array.isArray(imageData)) {
            throw new Error("Only one profile picture is allowed");
        }

        let uploadResponse;

        // If it's a file object (e.g., from multer)
        if (typeof imageData === 'object' && imageData !== null && imageData.path) {
            uploadResponse = await cloudinary.uploader.upload(imageData.path);
        }
        // If it's a base64 string or direct URL
        else if (typeof imageData === 'string') {
            uploadResponse = await cloudinary.uploader.upload(imageData);
        }
        else {
            throw new Error('Invalid image format');
        }

        return uploadResponse.secure_url;
    } catch (error) {
        console.error('Upload Image Error:', error.message);
        throw error;
    }
};

export default uploadImage;
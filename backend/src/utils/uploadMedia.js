const cloudinary = require('../config/cloudinary');

const uploadImage = async (imageData) => {
    try {
        // Ensure Cloudinary is configured
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }

        // If imageData is an array
        if (Array.isArray(imageData)) {
            throw new Error("Only one picture is allowed");
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


const uploadMedia = async (media) => {
    try {
        // Make sure cloudinary is properly initialized
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }
        
        let uploadResponse;
        // Check the type of media and handle appropriately
        if (Array.isArray(media)) {
            // If it's an array of media files
            const uploadPromises = media.map(item => cloudinary.uploader.upload(item.path || item));
            const uploadResults = await Promise.all(uploadPromises);
            uploadResponse = uploadResults.map(result => result.secure_url);
        } else if (typeof media === 'object' && media !== null && media.path) {
            // If it's a file object from multer
            const uploadResults = await cloudinary.uploader.upload(media.path);
            uploadResponse = uploadResults.secure_url;
        } else if (typeof media === 'string') {
            // If it's a base64 string or a URL
            const uploadResults = await cloudinary.uploader.upload(media);
            uploadResponse = uploadResults.secure_url;
        } else {
            throw new Error('Invalid media format');
        }

        return uploadResponse;
    } catch (uploadError) {
        console.error('Media upload error:', uploadError);
        return res.status(400).json({ 
            error: "Failed to upload media. Invalid format or Cloudinary configuration issue.",
            details: uploadError.message
        });
    }
};


module.exports = {uploadImage, uploadMedia};
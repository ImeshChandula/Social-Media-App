const { connectFirebase } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const { storage } = connectFirebase();

const uploadImages = async (images, folder = 'uploads', subfolder = '') => {
    try {
        // Handle different input formats
        let imageArray = [];
        
        if (!images) {
            return [];
        }
        
        // Convert to array if it's not already
        if (!Array.isArray(images)) {
            imageArray = [images];
        } else {
            imageArray = images;
        }
        
        // Filter out empty values
        imageArray = imageArray.filter(img => img !== null && img !== undefined);
        
        if (imageArray.length === 0) {
            return [];
        }

        const bucket = storage.bucket();
        const uploadPromises = imageArray.map(async (image) => {
            // Handle different image formats
            let imageBuffer, mimetype, originalname;
            
            if (typeof image === 'string') {
                // Handle URI strings - return as is (assuming they're already uploaded)
                if (image.startsWith('http://') || image.startsWith('https://')) {
                    return image;
                }
                
                // Handle base64 strings
                if (image.startsWith('data:')) {
                    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        mimetype = matches[1];
                        imageBuffer = Buffer.from(matches[2], 'base64');
                        
                        // Generate filename based on mimetype
                        const extension = mimetype.split('/')[1] || 'jpg';
                        originalname = `upload.${extension}`;
                    } else {
                        throw new Error('Invalid base64 format');
                    }
                } else {
                    throw new Error('Invalid string format for image');
                }
            } else if (image && typeof image === 'object') {
                // Handle file objects
                if (image.buffer && image.mimetype && image.originalname) {
                    imageBuffer = image.buffer;
                    mimetype = image.mimetype;
                    originalname = image.originalname;
                } else {
                    throw new Error('Invalid image object format');
                }
            } else {
                throw new Error('Unsupported image format');
            }
            
            // Generate unique filename
            const fileExtension = originalname.split('.').pop() || 'jpg';
            const fileName = `${uuidv4()}.${fileExtension}`;
            const filePath = subfolder 
                ? `${folder}/${subfolder}/${fileName}`
                : `${folder}/${fileName}`;

            // Create file reference
            const file = bucket.file(filePath);

            // Upload file
            await file.save(imageBuffer, {
                metadata: {
                    contentType: mimetype,
                    metadata: {
                        originalName: originalname,
                        uploadedAt: new Date().toISOString()
                    }
                }
            });

            // Make file publicly accessible
            await file.makePublic();

            // Return download URL
            return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        });

        const downloadUrls = await Promise.all(uploadPromises);
        return downloadUrls;

    } catch (error) {
        console.error('Upload images error:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
    }
};

const deleteImages = async (imageUrls) => {
    try {
        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return true;
        }

        const bucket = storage.bucket();
        const deletePromises = imageUrls.map(async (url) => {
            try {
                // Check if it's a Firebase Storage URL
                // Skip external URLs
                if (!url.includes(`https://storage.googleapis.com/${bucket.name}/`)) {
                    console.log(`Skipping external URL: ${url}`);
                    return; 
                }

                // Extract file path from URL
                const filePath = url.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
                if (filePath) {
                    const file = bucket.file(filePath);
                    await file.delete();
                    console.log(`Deleted Firebase Storage file: ${filePath}`);
                }
            } catch (err) {
                console.error(`Failed to delete image: ${url}`, err);
            }
        });

        await Promise.all(deletePromises);
        return true;

    } catch (error) {
        console.error('Delete images error:', error);
        throw new Error(`Failed to delete images: ${error.message}`);
    }
};

const uploadSingleImage = async (image, folder = 'uploads', subfolder = '') => {
    const result = await uploadImages([image], folder, subfolder);
    return result[0] || null;
};

module.exports = { uploadImages, deleteImages, uploadSingleImage };
const cloudinary = require('../config/cloudinary');

const uploadImage = async (imageData) => {
    try {
        // Ensure Cloudinary is configured
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }

        // If imageData is an array
        if (Array.isArray(imageData)) {
            // If it's an array of media files
            /*const uploadPromises = media.map(item => 
                cloudinary.uploader.upload(item.path || item, uploadOptions)
            );
            const uploadResults = await Promise.all(uploadPromises);
            uploadResponse = uploadResults.map(result => result.secure_url);*/

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


const uploadMedia = async (media, mediaType) => {
    try {
        // Make sure cloudinary is properly initialized
        if (!cloudinary || typeof cloudinary.uploader.upload !== 'function') {
            throw new Error('Cloudinary is not properly configured');
        }

        // Calculate file size
        let fileSize = 0;
        if (typeof media === 'string' && media.startsWith('data:')) {
            const base64Data = media.split(',')[1];
            const sizeInBytes = (base64Data.length * 3) / 4;
            fileSize = sizeInBytes / (1024 * 1024);
        }

        // Determine upload options based on media type
        const getUploadOptions = (type, fileSize) => {
            const options = {
                quality: 'auto',
                fetch_format: 'auto',
                timeout: 10 * 60 * 1000, // 10 minutes
                chunk_size: 6 * 1000 * 1000, // 6MB chunks
            };
            
            if (type === 'video') {
                options.resource_type = 'video';
                // For very large videos (>60MB), upload as raw file
                if (fileSize > 60) {
                    console.log('Uploading large video as raw file...');
                    options.resource_type = 'raw';
                    options.format = 'mp4'; // Preserve format
                } else if (fileSize > 50) {
                    // Just upload without any transformations to avoid sync processing
                    options.eager_async = true;
                    options.eager = [{ format: 'mp4' }];
                } else {
                    // For smaller videos, apply basic optimizations
                    options.quality = 'auto';
                    options.eager_async = true;
                    options.eager = [
                        { 
                            quality: 'auto',
                            format: 'mp4'
                        }
                    ];
                }
            } else if (type === 'image') {
                options.resource_type = 'image';
                options.quality = 'auto';
                options.fetch_format = 'auto';
                options.transformation = [
                    { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
                ];
            } else {
                options.resource_type = 'auto';
                options.quality = 'auto';
                options.fetch_format = 'auto';
            }
            
            return options;
        };


        // Add retry logic for timeout errors
        const uploadWithRetry = async (mediaData, options, maxRetries = 2) => {
            // Calculate file size for options
            let fileSize = 0;
            if (typeof mediaData === 'string' && mediaData.startsWith('data:')) {
                const base64Data = mediaData.split(',')[1];
                const sizeInBytes = (base64Data.length * 3) / 4;
                fileSize = sizeInBytes / (1024 * 1024);
            }
            
            // Get options with file size consideration
            const uploadOptions = getUploadOptions(mediaType, fileSize);
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Upload attempt ${attempt}/${maxRetries}`);
                    return await cloudinary.uploader.upload(mediaData, uploadOptions);
                } catch (error) {
                    console.error(`Upload attempt ${attempt} failed:`, error.message);
                    
                    if (attempt === maxRetries) {
                        throw error;
                    }
                    
                    // Wait before retry (exponential backoff)
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`Retrying in ${delay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        };

        const uploadOptions = getUploadOptions(mediaType);

        let uploadResponse;

        if (Array.isArray(media)) {
            // If it's an array of media files
            const uploadPromises = media.map(item => 
                uploadWithRetry(item.path || item, uploadOptions)
            );
            const uploadResults = await Promise.all(uploadPromises);
            uploadResponse = uploadResults.map(result => result.secure_url);
        } else if (typeof media === 'object' && media !== null && media.path) {
            // If it's a file object from multer
            const uploadResults = await uploadWithRetry(media.path, uploadOptions);
            uploadResponse = uploadResults.secure_url;
        } else if (typeof media === 'string') {
            // If it's a base64 string or a URL
            const uploadResults = await uploadWithRetry(media, uploadOptions);
            uploadResponse = uploadResults.secure_url;
        } else {
            throw new Error('Invalid media format');
        }

        return uploadResponse;
    } catch (uploadError) {
        console.error('Media upload error:', uploadError);

        if (uploadError.message.includes('File size too large')) {
            throw new Error('File size exceeds maximum limit. Please compress your video or use a smaller file.');
        } else if (uploadError.message.includes('Invalid image file')) {
            throw new Error('Invalid media file format. Please use supported image or video formats.');
        } else if (uploadError.message.includes('timeout') || uploadError.http_code === 499) {
            throw new Error('Upload timeout. Your file is too large or connection is slow. Please try a smaller file or compress the video.');
        } else if (uploadError.message.includes('ECONNRESET') || uploadError.message.includes('socket hang up')) {
            throw new Error('Connection lost during upload. Please check your internet connection and try again.');
        }
        
        throw new Error(`Failed to upload media: ${uploadError.message}`);
    }
};


module.exports = {uploadImage, uploadMedia};
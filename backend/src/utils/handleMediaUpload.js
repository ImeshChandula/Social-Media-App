const {validateAndProcessMedia} = require('../middleware/mediaValidation');
const {uploadMedia} = require('../utils/uploadMedia');

async function handleMediaUpload(mediaInput, mediaType = 'image') {
    try {
        console.log("===Starting Images Uploading===");
        const validatedMedia = validateAndProcessMedia(mediaInput, mediaType);
        const imageUrl = await uploadMedia(validatedMedia, mediaType);
        console.log("===Images uploaded successfully===");
        
        return { success: true, imageUrl };
    } catch (error) {
        console.log("===Uploading images failed===");
        if (error.message.includes('timeout')) {
            return {
                success: false,
                code: 408,
                error: "Upload timeout",
                message: "Your file is too large or upload is taking too long.",
                suggestion: "For videos over 25MB, consider compressing to reduce file size."
            };
        } else if (error.message.includes('File size')) {
            return {
                success: false,
                code: 413,
                error: "File too large",
                message: error.message,
                maxSize: mediaType === 'video' ? '50MB' : '15MB'
            };
        } else {
            return {
                success: false,
                code: 400,
                error: "Failed to upload media",
                message: error.message
            };
        }
    }
}

module.exports = { handleMediaUpload };

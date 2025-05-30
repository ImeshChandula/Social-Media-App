const validateAndProcessMedia = (mediaData, mediaType) => {
    try {
        // Check if it's a valid base64 data URL
        if (typeof mediaData === 'string' && mediaData.startsWith('data:')) {
            // Extract the actual base64 part
            const base64Data = mediaData.split(',')[1];
            
            // Check base64 size (approximate file size)
            const sizeInBytes = (base64Data.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            console.log(`Media size: ${sizeInMB.toFixed(2)} MB`);
            
            // Different handling based on size
            if (mediaType === 'video') {
                if (sizeInMB > 100) {
                    throw new Error(`Video file (${sizeInMB.toFixed(2)}MB) is too large. Maximum size is 100MB. Please compress your video.`);
                } else if (sizeInMB > 70) {
                    console.warn(`Very large video detected (${sizeInMB.toFixed(2)}MB). Processing will be done asynchronously.`);
                } else if (sizeInMB > 25) {
                    console.warn(`Large video file detected (${sizeInMB.toFixed(2)}MB). Upload may take several minutes.`);
                }
            } else {
                if (sizeInMB > 10) {
                    throw new Error(`Image file (${sizeInMB.toFixed(2)}MB) exceeds maximum limit of 10MB.`);
                }
            }
            
            return mediaData;
        } else {
            throw new Error('Invalid media format. Expected base64 data URL.');
        }
    } catch (error) {
        console.error('Media validation error:', error);
        throw error;
    }
};

module.exports = {validateAndProcessMedia};
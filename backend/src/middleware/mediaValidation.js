const validateBase64Media = (mediaData, mediaType) => {
    // Extract the actual base64 part
    const base64Data = mediaData.split(',')[1];
    
    if (!base64Data) {
        throw new Error('Invalid base64 data URL format.');
    }
    
    // Check base64 size (approximate file size)
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    console.log(`Base64 media size: ${sizeInMB.toFixed(2)} MB`);
    
    // Size validation based on media type
    validateMediaSize(sizeInMB, mediaType);
    
    return mediaData;
};

const validateUrlMedia = (mediaData, mediaType) => {
    // Basic URL validation
    try {
        const url = new URL(mediaData);
        
        // Check if it's a valid image/video URL (basic check)
        const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const validVideoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv'];
        
        const pathname = url.pathname.toLowerCase();
        const hasValidExtension = (mediaType === 'image' && validImageExtensions.some(ext => pathname.includes(ext))) ||
                                (mediaType === 'video' && validVideoExtensions.some(ext => pathname.includes(ext))) ||
                                (!pathname.includes('.') && (url.hostname.includes('unsplash') || url.hostname.includes('cloudinary') || url.hostname.includes('imgur')));
        
        if (!hasValidExtension && pathname.includes('.')) {
            console.warn(`URL may not be a valid ${mediaType} file: ${mediaData}`);
        }
        
        console.log(`Processing ${mediaType} URL: ${url.hostname}`);
        return mediaData;
        
    } catch (urlError) {
        throw new Error(`Invalid URL format: ${mediaData}`);
    }
};

const validateMediaSize = (sizeInMB, mediaType) => {
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
};


const validateAndProcessMedia = (mediaData, mediaType) => {
    try {
        // Handle array of media items
        if (Array.isArray(mediaData)) {
            return mediaData.map(item => validateAndProcessMedia(item, mediaType));
        }

        // Handle different media formats
        if (typeof mediaData === 'string') {
            // Case 1: Base64 data URL
            if (mediaData.startsWith('data:')) {
                return validateBase64Media(mediaData, mediaType);
            }
            // Case 2: Regular URL (http/https)
            else if (mediaData.startsWith('http://') || mediaData.startsWith('https://')) {
                return validateUrlMedia(mediaData, mediaType);
            }
            // Case 3: File path (for multer uploads)
            else if (mediaData.includes('/') || mediaData.includes('\\')) {
                console.log(`Processing file path: ${mediaData}`);
                return mediaData;
            }
            else {
                throw new Error('Invalid media format. Expected base64 data URL, HTTP URL, or file path.');
            }
        }
        // Case 4: File object from multer
        else if (typeof mediaData === 'object' && mediaData !== null && mediaData.path) {
            console.log(`Processing file object: ${mediaData.path}`);
            return mediaData;
        }
        else {
            throw new Error('Invalid media format. Expected string URL, base64 data, or file object.');
        }
    } catch (error) {
        console.error('Media validation error:', error);
        throw error;
    }
};

module.exports = {validateAndProcessMedia};
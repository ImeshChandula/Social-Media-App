
// WhatsApp URL generator for contact functionality
const generateWhatsAppURL = (phoneNumber, message = '') => {
    try {
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }

        // Remove all non-numeric characters except +
        let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
        
        // Remove + if it exists at the beginning
        if (cleanNumber.startsWith('+')) {
            cleanNumber = cleanNumber.substring(1);
        }
        
        // Validate that we have a reasonable phone number length
        if (cleanNumber.length < 7 || cleanNumber.length > 15) {
            throw new Error('Invalid phone number format');
        }
        
        // Encode the message for URL
        const encodedMessage = message ? encodeURIComponent(message) : '';
        
        // Generate WhatsApp URL
        const whatsappURL = `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
        
        return whatsappURL;
    } catch (error) {
        console.error('Error generating WhatsApp URL:', error);
        return null;
    }
};

// Generate contact message for page
const generatePageContactMessage = (pageName) => {
    return `Hi! I found your page "${pageName}" and would like to get in touch with you.`;
};

// Generate custom contact message
const generateCustomContactMessage = (pageName, customerMessage = '') => {
    const baseMessage = `Hi! I'm reaching out from your page "${pageName}".`;
    
    if (customerMessage && customerMessage.trim()) {
        return `${baseMessage} ${customerMessage.trim()}`;
    }
    
    return `${baseMessage} I'd like to know more about your services.`;
};

// Validate phone number format
const validatePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return false;
    
    // Remove all non-numeric characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Check if it's a valid length (7-15 digits)
    const digits = cleaned.replace(/\+/g, '');
    return digits.length >= 7 && digits.length <= 15;
};

// Format phone number for display
const formatPhoneForDisplay = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Keep original format for display but clean for processing
    return phoneNumber.trim();
};

module.exports = {
    generateWhatsAppURL,
    generatePageContactMessage,
    generateCustomContactMessage,
    validatePhoneNumber,
    formatPhoneForDisplay
};
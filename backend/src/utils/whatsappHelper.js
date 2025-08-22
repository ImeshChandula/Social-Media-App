// WhatsApp URL generator for contact functionality
const generateWhatsAppURL = (phoneNumber, message = '') => {
    try {
        // Remove all non-numeric characters
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);
        
        // Generate WhatsApp URL
        const whatsappURL = `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
        
        return whatsappURL;
    } catch (error) {
        console.error('Error generating WhatsApp URL:', error);
        return null;
    }
};

// Generate contact message for page
const generatePageContactMessage = (pageName) => {
    return `Hi! I found your page "${pageName}" and would like to get in touch.`;
};

module.exports = {
    generateWhatsAppURL,
    generatePageContactMessage
};
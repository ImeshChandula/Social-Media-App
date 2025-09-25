// Get allowed web origins from environment variables
const getAllowedWebOrigins = () => {
  return [
    process.env.PRODUCTION_WEB_URL,
    process.env.DEVELOPMENT_WEB_URL,
    "http://localhost:4000",
  ].filter(Boolean);
};


const corsOriginHandler = (origin, callback) => {
  const allowedWebOrigins = getAllowedWebOrigins();
  
  // Allow requests with no origin (mobile apps, REST clients)
  if (!origin) {
    return callback(null, true);
  }
  
  // Allow web origins from our list
  if (allowedWebOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Allow localhost for development (Flutter web debug)
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    return callback(null, true);
  }
  
  // For development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    return callback(null, true);
  }
  
  // Reject other origins in production
  callback(new Error('Not allowed by CORS'));
};

module.exports = {
  corsOriginHandler,
  getAllowedWebOrigins
};
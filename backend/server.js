const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./src/middleware/socket");
const { connectFirebase } = require("./src/config/firebase");
const { initializeDefaultSuperAdmin } = require("./src/initialization/defaultSuperAdmin");
const { initializeScheduler, setupGracefulShutdown } = require('./src/utils/initScheduler');

require('dotenv').config();


// connect to firebase
connectFirebase();

initializeDefaultSuperAdmin().then(() => {
  console.log('✅ Server initialization completed...\n');
});

// Configure allowed origins for web clients
const allowedWebOrigins = [
  process.env.PRODUCTION_WEB_URL,
  process.env.DEVELOPMENT_WEB_URL,
  "http://localhost:4000",
].filter(Boolean);



// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup with Flutter-compatible configuration
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, REST clients)
      if (!origin) return callback(null, true);
      
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
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// use socketHandler
socketHandler(io);

// Make io accessible to other files - ADD THIS
global.io = io;

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
// Enhanced CORS for Flutter support
app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps)
    if (!origin) return callback(null, true);
    
    // Allow development origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow specific origins in production
    if (allowedWebOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ]
}));
app.use(cookieParser());

// Handle preflight requests for Flutter
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return res.sendStatus(200);
  }
  next();
});

// Initialize scheduler when server starts
initializeScheduler(60); // Check every 60 minutes
setupGracefulShutdown();


// Routes
// http://localhost:5000
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/posts", require("./src/routes/postRoutes"));
app.use("/api/comments", require("./src/routes/commentRoutes"));
app.use("/api/friends", require("./src/routes/friendRoutes"));
app.use("/api/likes", require("./src/routes/likeRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes"));
app.use("/api/stories", require("./src/routes/storyRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));
app.use("/api/support", require("./src/routes/supportRoutes"));
app.use("/api/appeal", require("./src/routes/appealRoutes"));
app.use("/api/marketplace", require("./src/routes/marketplaceRoutes"));
app.use("/api/feed", require("./src/routes/feedRoutes"));
app.use("/api/activities", require("./src/routes/activityRoutes")); // added activity routes
app.use("/api/pages", require("./src/routes/pageRoutes")); // added page routes
//app.use("/api/pages/posts", require("./src/routes/pagePostRoutes")); // added page post routes
//app.use("/api/pages/stories", require("./src/routes/pageStoryRoutes")); // added page story routes

// Health check endpoint for Flutter apps
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Flutter Social App Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      firebase: '✅ Connected',
      socket: '✅ Active',
      scheduler: '✅ Running'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Flutter Social App API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth - Authentication endpoints',
      users: '/api/users - User management',
      posts: '/api/posts - Post operations',
      comments: '/api/comments - Comment system',
      friends: '/api/friends - Friend management',
      likes: '/api/likes - Like system',
      notifications: '/api/notifications - Push notifications',
      stories: '/api/stories - Story features',
      categories: '/api/categories - Content categories',
      dashboard: '/api/dashboard - Admin dashboard',
      support: '/api/support - Support system',
      appeal: '/api/appeal - Appeal system',
      marketplace: '/api/marketplace - Marketplace features',
      feed: '/api/feed - Content feed',
      activities: '/api/activities - Activity tracking',
      pages: '/api/pages - Page management'
    },
    websocket: {
      enabled: true,
      endpoint: '/socket.io',
      transports: ['websocket', 'polling']
    }
  });
});

//  route handler for the root path
app.get('/', (req, res) => {
  res.send('✅ Server is running...!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '❌ Server error', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Flutter Social App Server running on port ${PORT}`);
  console.log(`📱 Mobile: http://localhost:${PORT}`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/socket.io`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

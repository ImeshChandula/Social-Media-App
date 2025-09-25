const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
const socketHandler = require("./src/middleware/socket");
const { connectFirebase } = require("./src/config/firebase");
const { initializeDefaultSuperAdmin } = require("./src/initialization/defaultSuperAdmin");
const { initializeScheduler, setupGracefulShutdown } = require('./src/utils/initScheduler');
const { getAllowedWebOrigins, corsOriginHandler } = require("./src/middleware/corsOriginHandler");

require('dotenv').config();


// connect to firebase
connectFirebase();

initializeDefaultSuperAdmin().then(() => {
  console.log('✅ Server initialization completed...\n');
});

// Configure allowed origins for web clients
const allowedWebOrigins = getAllowedWebOrigins();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Socket.IO setup with Flutter-compatible configuration
const io = socketIo(server, {
  cors: {
    origin: corsOriginHandler,
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

// Make io accessible to other files
global.io = io;

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Enhanced CORS for Flutter support
app.use(cors({ 
  origin: corsOriginHandler,
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
app.use("/health", require("./src/routes/healthRoutes"));
// API documentation endpoint
app.use("/api", require("./src/routes/API_documentationRoutes"));


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
  console.log(`🚀 Flutter & Web Social App Server running on port ${PORT}`);
  console.log(`📱 Mobile: http://localhost:${PORT}`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

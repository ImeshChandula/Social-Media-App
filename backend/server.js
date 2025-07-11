const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");                    // ADD THIS
const socketIo = require("socket.io");          // ADD THIS
const socketHandler = require("./src/middleware/socket");
const { connectFirebase } = require("./src/config/firebase");
const { initializeDefaultSuperAdmin } = require("./src/initialization/defaultSuperAdmin");
const { initializeScheduler, setupGracefulShutdown } = require('./src/utils/initScheduler');

require('dotenv').config();


// connect to firebase
connectFirebase();

initializeDefaultSuperAdmin().then(() => {
  console.log('Server initialization completed...\n');
});

// starts the server
const app = express();
const server = http.createServer(app);

// Socket.io setup - ADD THIS BLOCK
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:4000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// use socketHandler
socketHandler(io);

// Make io accessible to other files - ADD THIS
global.io = io;

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:4000", credentials: true }));
app.use(cookieParser());


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


//  route handler for the root path
app.get('/', (req, res) => {
  res.send('Its Working...!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : {} });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
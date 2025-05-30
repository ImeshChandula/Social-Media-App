const jwt = require("jsonwebtoken");

const socketHandler = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    try {
      // Get token from cookies instead of auth
      const token = socket.handshake.headers.cookie
        ?.split('; ')
        .find(row => row.startsWith('authToken='))
        ?.split('=')[1];
        
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);
    socket.join(`user_${socket.userId}`);

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Add more socket event handlers here...
  });
};

module.exports = socketHandler;

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require('dotenv').config();
const { connectFirebase } = require("./src/config/firebase");
const { initializeDefaultSuperAdmin } = require("./src/initialization/defaultSuperAdmin");
//const storyRoutes = require('./routes/storyRoutes'); 


// connect to firebase
connectFirebase();

initializeDefaultSuperAdmin().then(() => {
  console.log('Server initialization completed...\n');
});

// starts the server
const app = express();
app.use(express.json()); 
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(cookieParser());




// Routes
// http://localhost:5000
app.use('/api/auth', require('./src/routes/authRoutes'));
// app.use('/api/users', require('./src/routes/userRoutes'));
// app.use('/api/posts', require('./src/routes/postRoutes'));
// app.use('/api/comments', require('./src/routes/commentRoutes'));
//app.use('/api/stories', require('./src/routes/storyRoutes')); // Add this line to include story routes





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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const createDefaultSuperAdmin = require("./src/config/defaultSuperAdmin");

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // starts the server

// functions on server start
//createDefaultSuperAdmin();

app.use(cors({ origin: "http://localhost:4000", credentials: true }));
app.use(cookieParser());

// Routes
// http://localhost:5000




app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
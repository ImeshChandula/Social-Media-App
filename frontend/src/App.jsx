import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./routes/login";
import Register from "./routes/Register";
import MainLayout from "./routes/MainLayout";
import CreatePost from "./components/CreatePost";
import EditProfile from "./components/EditProfile";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        {!isLoggedIn ? (
          <>
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/*" element={<MainLayout />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-profile" element={<EditProfile />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from './store/authStore';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Login from "./routes/login";
import Register from "./routes/Register";
import MainLayout from "./routes/MainLayout";

function App() {
  /*
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
  }, [isLoggedIn]);*/

  const {authUser, checkAuth, isCheckingAuth} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) 
    return (
      <div className='loader-container'>
        <Loader className="loader" />
      </div>
    )


  return (
    <Router>
      <Routes>
        {/*!isLoggedIn ? (
          <>
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/*" element={<MainLayout />} />
          </>
        )*/}

        
          <Route path="/" element={!authUser ? <Login /> : <Navigate to="/*" />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          
          <Route path="/*" element={<MainLayout />} />
          
        
      </Routes>
    </Router>
  );
}

export default App;

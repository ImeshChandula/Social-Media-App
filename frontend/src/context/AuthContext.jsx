import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextProvider";


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded); // Token is valid
        } else {
          logout(); // Token is expired
        }
      } catch (err) {
        console.error("Invalid token:", err);
        logout(); // If token is malformed
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);





  // login
  const login = async (credentials) => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", credentials);
      localStorage.setItem("token", res.data.token);

      const decodedUser = jwtDecode(res.data.token);
      setUser(decodedUser);

      return { success: true, role: decodedUser.role  };
    } catch (error) {
      console.error("Login failed", error.response || error);
      return {  success: false, 
                message: error?.response?.data?.message ?? error?.message ?? "Login failed" };
    }
  };


  // logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

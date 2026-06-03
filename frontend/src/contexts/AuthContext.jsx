// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { baseUrl } from "../pages/data/api";
import toast from "react-hot-toast";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Logout function
  const logout = useCallback(async () => {
    try {
      await axios.post(`${baseUrl}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout request error, clearing client state anyway:", err.message);
    } finally {
      toast.success("Session logged out")
      setUser(null);
    }
  }, []);

  const fetchUserFromServer = useCallback(async () => {
    try {
      const res = await axios.get(`${baseUrl}/auth/me`, { withCredentials: true });
      
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn("No active session or server error. Forcing logout:", err.message);
      logout(); 
    } finally {
      setLoading(false);
    }
  }, [logout]);
  
  useEffect(() => {
    fetchUserFromServer(); 
  }, [fetchUserFromServer]);

  // Login function
  const login = async (credentials) => {
    try {
      const res = await axios.post(`${baseUrl}/auth/login`, credentials, {
        withCredentials: true,
      });
      const userData = res.data.user;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false, 
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, refresh: fetchUserFromServer }}>
      {children}
    </AuthContext.Provider>
  );
};
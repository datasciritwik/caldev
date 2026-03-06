import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  });

  // Attach token to requests if available
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Exchange Firebase token for backend JWT
      const response = await api.post('/api/auth/token', { id_token: idToken });
      const { access_token, user: backendUser } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(backendUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      const response = await api.post('/api/auth/token', { id_token: idToken });
      const { access_token, user: backendUser } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(backendUser);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      const idToken = await result.user.getIdToken();
      const response = await api.post('/api/auth/token', { id_token: idToken });
      const { access_token, user: backendUser } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(backendUser);
    } catch (error) {
      console.error("Email registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no backend user/token, try to re-exchange
        if (!token) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const response = await api.post('/api/auth/token', { id_token: idToken });
            const { access_token, user: backendUser } = response.data;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser(backendUser);
          } catch (e) {
            console.error("Failed to sync auth state:", e);
            setUser(null);
            setToken(null);
          }
        } else if (!user) {
          // In a real app, you might fetch user details from /api/me here
          // For now, we'll assume the token is enough or handle it in specific components
          setLoading(false);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [token]);

  const value = {
    user,
    token,
    loading,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

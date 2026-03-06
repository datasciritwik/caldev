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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
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

  const saveAuth = (newToken, newUser) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Exchange Firebase token for backend JWT
      const response = await api.post('/api/auth/token', { id_token: idToken });
      const { access_token, user: backendUser } = response.data;
      
      saveAuth(access_token, backendUser);
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
      saveAuth(access_token, backendUser);
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
      saveAuth(access_token, backendUser);
    } catch (error) {
      console.error("Email registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    clearAuth();
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Verify current token and get fresh user profile
          const response = await api.get('/api/auth/me');
          saveAuth(token, response.data);
        } catch (e) {
          console.error("Session expired or invalid:", e);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If we have a firebase user but no backend user/token, try to re-exchange
        if (!localStorage.getItem('token')) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const response = await api.post('/api/auth/token', { id_token: idToken });
            const { access_token, user: backendUser } = response.data;
            saveAuth(access_token, backendUser);
          } catch (e) {
            console.error("Failed to sync auth state:", e);
            clearAuth();
          }
        }
      } else {
        // If Firebase is signed out, clear everything
        clearAuth();
      }
    });

    return unsubscribe;
  }, []);

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

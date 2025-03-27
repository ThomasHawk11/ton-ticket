import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verify token validity
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
              // Token expired
              localStorage.removeItem('token');
              setUser(null);
              setIsAuthenticated(false);
            } else {
              // Token valid
              const response = await authService.getCurrentUser();
              setUser(response.data.user);
              setIsAuthenticated(true);
            }
          } catch (error) {
            // Invalid token
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      
      // Extraire les données avec vérification
      const { accessToken, refreshToken, user, message } = response.data;
      
      if (!accessToken) {
        setError('Token d\'accès manquant dans la réponse du serveur');
        return { 
          success: false, 
          error: 'Token d\'accès manquant dans la réponse du serveur' 
        };
      }
      
      if (!user) {
        setError('Informations utilisateur manquantes dans la réponse du serveur');
        return { 
          success: false, 
          error: 'Informations utilisateur manquantes dans la réponse du serveur' 
        };
      }
      
      // Stocker le token et les informations utilisateur
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };
  
  const updateUserProfile = (updatedUser) => {
    setUser({ ...user, ...updatedUser });
  };
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUserProfile
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


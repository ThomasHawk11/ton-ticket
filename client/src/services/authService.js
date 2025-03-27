import apiClient from './apiClient';

const AUTH_API = '/api/auth';

const authService = {
  // Register a new user
  register: (userData) => {
    return apiClient.post(`${AUTH_API}/register`, userData);
  },
  
  // Login user
  login: (email, password) => {
    return apiClient.post(`${AUTH_API}/login`, { email, password });
  },
  
  // Refresh token
  refreshToken: (refreshToken) => {
    return apiClient.post(`${AUTH_API}/refresh-token`, { refreshToken });
  },
  
  // Logout user
  logout: (refreshToken) => {
    return apiClient.post(`${AUTH_API}/logout`, { refreshToken });
  },
  
  // Verify token
  verifyToken: () => {
    return apiClient.get(`${AUTH_API}/verify-token`);
  },
  
  // Validate token
  validateToken: () => {
    return apiClient.post(`${AUTH_API}/validate-token`);
  }
};

export default authService;


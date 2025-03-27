import apiClient from './apiClient';

const SETTINGS_API = '/settings';

const settingsService = {
  /**
   * Get all system settings
   * @returns {Promise} Promise object with settings data
   */
  getSettings: () => {
    return apiClient.get(`${SETTINGS_API}`);
  },

  /**
   * Update system settings
   * @param {Object} settings - Settings object containing all settings categories
   * @returns {Promise} Promise object with updated settings data
   */
  updateSettings: (settings) => {
    return apiClient.put(`${SETTINGS_API}`, settings);
  },

  /**
   * Reset settings to default values
   * @returns {Promise} Promise object with default settings data
   */
  resetSettings: () => {
    return apiClient.post(`${SETTINGS_API}/reset`);
  },

  /**
   * Send a test email to verify email configuration
   * @param {string} email - Email address to send test email to
   * @returns {Promise} Promise object with result of test email
   */
  sendTestEmail: (email) => {
    return apiClient.post(`${SETTINGS_API}/test-email`, { email });
  },

  /**
   * Get system health status
   * @returns {Promise} Promise object with system health data
   */
  getSystemHealth: () => {
    return apiClient.get(`${SETTINGS_API}/health`);
  },

  /**
   * Get system logs
   * @param {Object} params - Query parameters for logs (limit, page, level, etc.)
   * @returns {Promise} Promise object with system logs data
   */
  getSystemLogs: (params) => {
    return apiClient.get(`${SETTINGS_API}/logs`, { params });
  },

  /**
   * Clear system cache
   * @returns {Promise} Promise object with result of cache clearing
   */
  clearCache: () => {
    return apiClient.post(`${SETTINGS_API}/clear-cache`);
  }
};

export default settingsService;


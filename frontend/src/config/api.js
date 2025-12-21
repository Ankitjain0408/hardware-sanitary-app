// API configuration
// In production, if frontend and backend are on different domains,
// set VITE_API_BASE_URL in your environment variables
// Example: VITE_API_BASE_URL=https://api.yourdomain.com

// Export API base URL for potential future use
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default API_BASE_URL;


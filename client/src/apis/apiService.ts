import axios from 'axios';

// Create an Axios instance with a base URL and common settings
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Set base URL from environment variables
    timeout: 120000, // Set timeout for API requests
});

// Add request interceptor to dynamically set headers
apiClient.interceptors.request.use((config: any) => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
        // Remove any surrounding quotes and trim whitespace
        const token = authToken.replace(/^"|"$/g, '').trim();
        config.headers = {
            ...config.headers,
            Authorization: token,
        };
    }
    return config;
});

// Handle responses and errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response; // Pass through the response
    },
    (error) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        // Check for 401 (Unauthorized) or 403 (Forbidden) status codes
        if (status === 401 || status === 403) {
            // Remove auth token from localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.clear();
            // Navigate to the root page ("/")
            window.location.href = '/';
        }
        return Promise.reject(new Error(errorMessage));
    }
);

export default apiClient;
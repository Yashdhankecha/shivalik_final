import apiClient from './apiService';

// Generic API request function
export const apiRequest = async <T = any>(config: any): Promise<T> => {
    try {
        const response = await apiClient.request<T>({
            ...config,
            responseType: config.responseType || 'json', // Default to 'json' if not specified
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during the API request');
    }
};

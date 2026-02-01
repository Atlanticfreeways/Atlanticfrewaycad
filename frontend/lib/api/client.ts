import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_MARQETA_BASE_URL,
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add Basic Auth header
        const appToken = process.env.MARQETA_APP_TOKEN;
        const adminToken = process.env.MARQETA_ADMIN_TOKEN;

        if (appToken && adminToken) {
            const credentials = Buffer.from(`${appToken}:${adminToken}`).toString('base64');
            config.headers.Authorization = `Basic ${credentials}`;
        }

        // Log request in development
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                params: config.params,
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            console.log('✅ API Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error in development
        if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
            console.error('❌ API Error:', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.message,
                data: error.response?.data,
            });
        }

        // Handle specific error codes
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    console.error('Authentication failed. Please check your API credentials.');
                    break;
                case 404:
                    console.error('Resource not found:', error.config?.url);
                    break;
                case 429:
                    console.error('Rate limit exceeded. Please try again later.');
                    break;
                case 500:
                case 502:
                case 503:
                    console.error('Server error. Please try again later.');
                    break;
            }
        }

        // Retry logic for network errors or 5xx errors
        const retryAttempts = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3');
        if (
            !originalRequest._retry &&
            (!error.response || error.response.status >= 500) &&
            retryAttempts > 0
        ) {
            originalRequest._retry = true;

            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryAttempts), 10000);
            await new Promise((resolve) => setTimeout(resolve, delay));

            return apiClient(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default apiClient;

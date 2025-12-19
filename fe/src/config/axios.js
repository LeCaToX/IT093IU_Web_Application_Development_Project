import axios from "axios";
import { useUserStore } from "../stores/useUserStore"

const getApiBaseUrl = () => {
    // 1. PRIORITIZE THE ENVIRONMENT VARIABLE
    // On Vercel, this must be set to: https://it093iuwebapplicationdevelopmentproject-production.up.railway.app
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    
    // 2. LOCAL DEVELOPMENT FALLBACK
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080'; // Note: removed /api here if your controller already has it
    }
    
    // 3. PRODUCTION FALLBACK (HARDCODE RAILWAY LINK)
    // If the env variable is missing for some reason, point directly to Railway
    return 'https://it093iuwebapplicationdevelopmentproject-production.up.railway.app';
};

const axiosInstance = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
});

const axiosInstance = axios.create({
	baseURL: getApiBaseUrl(),
	withCredentials: true, // Always send cookies
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = useUserStore.getState().token;
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

/*
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);
*/

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// If a refresh is already in progress, wait for it to complete
				if (refreshPromise) {
					await refreshPromise;
					return axios(originalRequest);
				}

				// Start a new refresh process
				refreshPromise = useUserStore.getState().refreshToken();
				await refreshPromise;
				refreshPromise = null;

				return axios(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login or handle as needed
				useUserStore.getState().logout();
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;

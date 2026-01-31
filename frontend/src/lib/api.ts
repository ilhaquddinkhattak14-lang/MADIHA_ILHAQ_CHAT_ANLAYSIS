import axios from 'axios';
import { AuthResponse, AnalysisResults, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authApi = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await api.post<AuthResponse>('/auth/token', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    register: async (username: string, email: string, password: string): Promise<User> => {
        const response = await api.post<User>('/auth/register', {
            username,
            email,
            password
        });
        return response.data;
    }
};

export const analyzerApi = {
    analyze: async (file: File, selectedUser: string = 'Overall'): Promise<AnalysisResults> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('selected_user', selectedUser);

        const response = await api.post<AnalysisResults>('/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export default api;

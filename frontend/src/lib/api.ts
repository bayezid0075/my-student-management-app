import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          Cookies.set('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login/', { email, password }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout/', { refresh_token: refreshToken }),

  getCurrentUser: () =>
    api.get('/auth/me/'),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: any) => api.get('/courses/', { params }),
  getOne: (id: number) => api.get(`/courses/${id}/`),
  create: (data: any) => api.post('/courses/', data),
  update: (id: number, data: any) => api.put(`/courses/${id}/`, data),
  delete: (id: number) => api.delete(`/courses/${id}/`),
};

// Batches API
export const batchesAPI = {
  getAll: (params?: any) => api.get('/batches/', { params }),
  getOne: (id: number) => api.get(`/batches/${id}/`),
  create: (data: any) => api.post('/batches/', data),
  update: (id: number, data: any) => api.put(`/batches/${id}/`, data),
  delete: (id: number) => api.delete(`/batches/${id}/`),
};

// Students API
export const studentsAPI = {
  getAll: (params?: any) => api.get('/students/', { params }),
  getOne: (id: number) => api.get(`/students/${id}/`),
  create: (data: any) => api.post('/students/', data),
  update: (id: number, data: any) => api.put(`/students/${id}/`, data),
  delete: (id: number) => api.delete(`/students/${id}/`),
  enroll: (id: number, data: any) => api.post(`/students/${id}/enroll/`, data),
  // File upload methods
  createWithFiles: (data: FormData) => api.post('/students/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateWithFiles: (id: number, data: FormData) => api.patch(`/students/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Student Invoices API
export const invoicesAPI = {
  getAll: (params?: any) => api.get('/invoices/student/', { params }),
  getOne: (id: number) => api.get(`/invoices/student/${id}/`),
  create: (data: any) => api.post('/invoices/student/', data),
  download: (id: number) => api.get(`/invoices/student/${id}/download/`, { responseType: 'blob' }),
};

// Custom Invoices API
export const customInvoicesAPI = {
  getAll: (params?: any) => api.get('/invoices/custom/', { params }),
  getOne: (id: number) => api.get(`/invoices/custom/${id}/`),
  create: (data: any) => api.post('/invoices/custom/', data),
  update: (id: number, data: any) => api.put(`/invoices/custom/${id}/`, data),
  delete: (id: number) => api.delete(`/invoices/custom/${id}/`),
  download: (id: number) => api.get(`/invoices/custom/${id}/download/`, { responseType: 'blob' }),
};

// Certificates API
export const certificatesAPI = {
  getAll: (params?: any) => api.get('/certificates/', { params }),
  getOne: (id: number) => api.get(`/certificates/${id}/`),
  create: (data: any) => api.post('/certificates/', data),
  download: (id: number) => api.get(`/certificates/${id}/download/`, { responseType: 'blob' }),
};

export default api;

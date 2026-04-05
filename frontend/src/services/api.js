import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Colleges API
export const collegesAPI = {
  getAll: () => api.get('/colleges'),
  getById: (id) => api.get(`/colleges/${id}`)
};

// Resources API
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`)
};

// Posts API
export const postsAPI = {
  getAll: () => api.get('/posts'),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  report: (id, reason) => api.post(`/posts/${id}/report`, { reason }),
  delete: (id) => api.delete(`/posts/${id}`)
};

// Comments API
export const commentsAPI = {
  create: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  delete: (id) => api.delete(`/posts/comments/${id}`)
};

// Chat API
export const chatAPI = {
  getSession: () => api.get('/chat/session'),
  sendMessage: (content) => api.post('/chat/message', { content }),
  closeSession: (sessionId) => api.post(`/chat/session/${sessionId}/close`),
  getHistory: () => api.get('/chat/history')
};

// Bookings API
export const bookingsAPI = {
  bookSession: (data) => api.post('/bookings/book', data),
  getStudentBookings: () => api.get('/bookings/student'),
  getCounselorBookings: (status) => api.get('/bookings/counselor', { params: { status } }),
  getCounselors: () => api.get('/bookings/counselors'),
  setAvailability: (data) => api.post('/bookings/availability', data),
  updateStatus: (bookingId, data) => api.put(`/bookings/${bookingId}/status`, data)
};

// Admin API
export const adminAPI = {
  getAllUsers: (role) => api.get('/admin/users', { params: { role } }),
  updateUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),
  getFlaggedPosts: () => api.get('/admin/posts/flagged'),
  getFlaggedChatSessions: () => api.get('/admin/chat/flagged'),
  getDashboardStats: () => api.get('/admin/stats')
};
// Assessment API
export const assessmentAPI = {
  fetchQuestionnaire: (type) => api.get(`/assessments/${type}`),
  submitResult: (payload) => api.post('/assessments/results', payload),
  getMyResults: () => api.get('/assessments/results'),
};
export default api;

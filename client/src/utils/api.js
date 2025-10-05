// src/utils/api.js

// Dynamic API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production' 
    ? '/api'  // Production: nginx proxy
    : 'http://localhost:5000/api'  // Development: direct connection
);

// Get user token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Generic API call function
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = getToken();
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Auth API calls
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', 'POST', credentials),
  register: (userData) => apiCall('/auth/register', 'POST', userData),
  logout: () => apiCall('/auth/logout', 'POST'),
};

// User API calls
export const userAPI = {
  getProfile: () => apiCall('/user/profile'),
  updateProfile: (data) => apiCall('/user/profile', 'PUT', data),
};

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => apiCall('/dashboard/stats'),
};

// Goals API calls
export const goalsAPI = {
  getAll: (period = 'today') => apiCall(`/goals?period=${period}`),
  getById: (id) => apiCall(`/goals/${id}`),
  create: (data) => apiCall('/goals', 'POST', data),
  update: (id, data) => apiCall(`/goals/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/goals/${id}`, 'DELETE'),
};

// Workouts API calls
export const workoutsAPI = {
  getAll: (period = 'today') => apiCall(`/workouts?period=${period}`),
  getById: (id) => apiCall(`/workouts/${id}`),
  create: (data) => apiCall('/workouts', 'POST', data),
  update: (id, data) => apiCall(`/workouts/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/workouts/${id}`, 'DELETE'),
};

// Nutrition API calls
export const nutritionAPI = {
  getToday: (period = 'today') => apiCall(`/nutrition/today?period=${period}`),
  getByDate: (date) => apiCall(`/nutrition/date/${date}`),
  addMeal: (data) => apiCall('/nutrition/meals', 'POST', data),
  updateMeal: (id, data) => apiCall(`/nutrition/meals/${id}`, 'PUT', data),
  deleteMeal: (id) => apiCall(`/nutrition/meals/${id}`, 'DELETE'),
};

// Calculator API calls
export const calculatorAPI = {
  calculate: (data) => apiCall('/calculator/calculate', 'POST', data),
  getHistory: () => apiCall('/calculator/history'),
};

// Trivia API calls
export const triviaAPI = {
  getQuestion: (params) => apiCall(`/trivia/question${params ? `?${new URLSearchParams(params)}` : ''}`, 'GET'),
  submitAnswer: (data) => apiCall('/trivia/answer', 'POST', data),
  getStats: () => apiCall('/trivia/stats'),
  seedQuestions: () => apiCall('/trivia/seed', 'POST'),
};

// AI Coach API calls
export const aiCoachAPI = {
  chat: (data) => apiCall('/ai-coach/chat', 'POST', data),
};
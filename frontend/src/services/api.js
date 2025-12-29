const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// Auth API
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getMe: () => apiCall('/auth/me'),
  
  updateProfile: (data) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Topics API
export const topicsAPI = {
  getAll: () => apiCall('/topics'),
  getOne: (id) => apiCall(`/topics/${id}`),
  create: (data) => apiCall('/topics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/topics/${id}`, {
    method: 'DELETE',
  }),
};

// Subtopics API
export const subtopicsAPI = {
  getAll: (topicId = null) => {
    const query = topicId ? `?topicId=${topicId}` : '';
    return apiCall(`/subtopics${query}`);
  },
  getByTopic: (topicId) => apiCall(`/subtopics/by-topic/${topicId}`),
  getOne: (id) => apiCall(`/subtopics/${id}`),
  create: (data) => apiCall('/subtopics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/subtopics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/subtopics/${id}`, {
    method: 'DELETE',
  }),
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/quizzes${queryString ? `?${queryString}` : ''}`);
  },
  getOne: (id) => apiCall(`/quizzes/${id}`),
  getByTopic: (topicId) => apiCall(`/quizzes/topic/${topicId}`),
  getBySubtopic: (subtopicId) => apiCall(`/quizzes/subtopic/${subtopicId}`),
  getRandom: () => apiCall('/quizzes/random'),
  getAllAdmin: () => apiCall('/quizzes/admin/all'),
  getOneAdmin: (id) => apiCall(`/quizzes/${id}/admin`),
  create: (data) => apiCall('/quizzes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/quizzes/${id}`, {
    method: 'DELETE',
  }),
};

// Attempts API
export const attemptsAPI = {
  submit: (data) => apiCall('/attempts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getUserAttempts: () => apiCall('/attempts/user'),
  getStats: () => apiCall('/attempts/stats'),
  getOne: (id) => apiCall(`/attempts/${id}`),
  getByQuiz: (quizId) => apiCall(`/attempts/quiz/${quizId}`),
};

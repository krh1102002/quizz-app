const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://quizz-app-2-bn5d.onrender.com/api';

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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Check if the response content type is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Only try to parse JSON if the content type is JSON
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      // If not JSON, get text for better error messages
      const text = await response.text();
      data = { error: text || 'Server returned non-JSON response' };
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Handle network errors or JSON parsing errors
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
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

// Health API
export const healthAPI = {
  check: () => apiCall('/health'),
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authApi = {
  register: (userData) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => apiRequest('/auth/me'),
};

export const reservationApi = {
  getMy: () => apiRequest('/reservations/my'),
  getAll: (date) => {
    const query = date ? `?date=${date}` : '';
    return apiRequest(`/reservations${query}`);
  },
  getAvailability: (date, timeSlot, guestCount) =>
    apiRequest(
      `/reservations/availability?date=${date}&timeSlot=${encodeURIComponent(timeSlot)}&guestCount=${guestCount}`
    ),
  create: (reservation) =>
    apiRequest('/reservations', { method: 'POST', body: JSON.stringify(reservation) }),
  update: (id, updates) =>
    apiRequest(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  cancel: (id) => apiRequest(`/reservations/${id}`, { method: 'DELETE' }),
};

export const tableApi = {
  getAll: () => apiRequest('/tables'),
  create: (table) => apiRequest('/tables', { method: 'POST', body: JSON.stringify(table) }),
  update: (id, updates) =>
    apiRequest(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id) => apiRequest(`/tables/${id}`, { method: 'DELETE' }),
};

export const TIME_SLOTS = ['12:00-14:00', '18:00-20:00', '20:00-22:00'];

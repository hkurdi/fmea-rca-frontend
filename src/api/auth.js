import { api } from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token) => api.post('/auth/refresh', { refresh_token }),
};

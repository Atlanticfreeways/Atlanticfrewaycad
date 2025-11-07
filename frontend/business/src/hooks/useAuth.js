import { create } from 'zustand';
import { authAPI } from '../services/api';

const sanitizeToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  return token.replace(/[<>"']/g, '');
};

export const useAuthStore = create((set) => ({
  user: null,
  token: sanitizeToken(localStorage.getItem('accessToken')),
  login: async (email, password) => {
    const { data } = await authAPI.login(email, password);
    const sanitizedToken = sanitizeToken(data.tokens.accessToken);
    localStorage.setItem('accessToken', sanitizedToken);
    set({ user: data.user, token: sanitizedToken });
    return data;
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null });
  }
}));

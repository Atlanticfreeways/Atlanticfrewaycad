import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  login: async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('accessToken', data.tokens.accessToken);
    set({ user: data.user, token: data.tokens.accessToken });
    return data;
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null });
  }
}));

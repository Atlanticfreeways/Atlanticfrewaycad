const API_BASE = '/api/v1';

function sanitizeToken(token) {
  if (!token || typeof token !== 'string') return null;
  return token.replace(/[<>"']/g, '');
}

function sanitizeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

class API {
  static async request(endpoint, options = {}) {
    const token = sanitizeToken(localStorage.getItem('accessToken'));
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.tokens) {
      localStorage.setItem('accessToken', sanitizeToken(data.tokens.accessToken));
      localStorage.setItem('refreshToken', sanitizeToken(data.tokens.refreshToken));
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  static async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });

    if (data.tokens) {
      localStorage.setItem('accessToken', sanitizeToken(data.tokens.accessToken));
      localStorage.setItem('refreshToken', sanitizeToken(data.tokens.refreshToken));
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  static logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  static getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }

  static isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${sanitizeHTML(type)}`;
  alert.textContent = sanitizeHTML(message);
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 5000);
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    if (API.isAuthenticated()) {
      loginBtn.textContent = 'Logout';
      loginBtn.onclick = (e) => {
        e.preventDefault();
        API.logout();
      };
    }
  }
});

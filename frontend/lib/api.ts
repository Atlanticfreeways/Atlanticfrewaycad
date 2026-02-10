/* eslint-disable no-undef */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      this.csrfToken = localStorage.getItem('csrfToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async fetchCSRF() {
    try {
      const res = await fetch(`${this.baseURL}/csrf-token`, {
        credentials: 'include'
      });
      const data = await res.json();
      this.csrfToken = data.csrfToken;
      if (typeof window !== 'undefined') localStorage.setItem('csrfToken', data.csrfToken);
    } catch (e) {
      console.warn("Failed to fetch CSRF token", e);
    }
  }

  // eslint-disable-next-line no-undef
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: any = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Attach CSRF if available (Standard headers)
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
      console.log('--- API REQUEST ---');
      console.log('Endpoint:', endpoint);
      console.log('CSRF Token being sent:', this.csrfToken);
      console.log('All Headers:', headers);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || errorData.error || errorData.message || 'API Request Failed';
      throw new Error(typeof message === 'object' ? JSON.stringify(message) : message);
    }

    return response.json();
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T = any>(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();

export const dashboardAPI = {
  getMetrics: () => api.get<any>('/dashboard/metrics')
};

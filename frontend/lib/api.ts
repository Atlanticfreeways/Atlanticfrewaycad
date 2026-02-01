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
      const res = await fetch(`${this.baseURL}/csrf-token`); // Note: /api/v1 prefix handling
      const data = await res.json();
      this.csrfToken = data.csrfToken;
      if (typeof window !== 'undefined') localStorage.setItem('csrfToken', data.csrfToken);
    } catch (e) {
      console.warn("Failed to fetch CSRF token", e);
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers as any,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Attach CSRF if available
    if (this.csrfToken) {
      headers['data-csrf-token'] = this.csrfToken;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Handle unauthorized (logout or refresh)
      // For now, just throw
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'API Request Failed');
    }

    return response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();

/**
 * API Service
 * Giao tiếp trực tiếp với Express Backend (http://localhost:5000/api/v1)
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

class ApiService {
  constructor() {
    this.tokenKey = 'eco_auth_token';
    this.userKey = 'eco_auth_user';
    this.backendAvailable = false;
    this.hasCheckedHealth = false;
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser() {
    const raw = localStorage.getItem(this.userKey);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setSession(token, user) {
    if (token) localStorage.setItem(this.tokenKey, token);
    if (user) localStorage.setItem(this.userKey, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user } }));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: { user: null } }));
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch('http://localhost:5000/', { signal: controller.signal });
      clearTimeout(timeoutId);
      this.backendAvailable = res.ok;
    } catch {
      this.backendAvailable = false;
    }
    this.hasCheckedHealth = true;
    window.dispatchEvent(new CustomEvent('backend:status', {
      detail: { available: this.backendAvailable }
    }));
    return this.backendAvailable;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      this.backendAvailable = true;

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi yêu cầu API');
      }
      return data;
    } catch (err) {
      if (err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        this.backendAvailable = false;
        window.dispatchEvent(new CustomEvent('backend:status', { detail: { available: false } }));
      }
      throw err;
    }
  }

  // --- AUTHENTICATION (Bắt buộc gọi API Backend thật) ---
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setSession(data.token, data.user);
    return data;
  }

  async register(data) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- REPORTS ---
  async getReports(filter = {}) {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.pollution_type_id) params.append('pollution_type_id', filter.pollution_type_id);
      if (filter.severity_level) params.append('severity_level', filter.severity_level);
      if (filter.search) params.append('search', filter.search);

      const qs = params.toString() ? `?${params.toString()}` : '';
      return await this.request(`/reports${qs}`);
    } catch {
      return window.localDataStore.getReports(filter);
    }
  }

  async getStats() {
    try {
      return await this.request('/reports/stats');
    } catch {
      return window.localDataStore.getStats();
    }
  }

  async getReportById(id) {
    try {
      return await this.request(`/reports/${id}`);
    } catch {
      const r = window.localDataStore.getReportById(id);
      if (!r) throw new Error('Không tìm thấy thông tin phản ánh!');
      return r;
    }
  }

  async createReport(data) {
    if (!this.getToken()) {
      throw new Error('Vui lòng đăng nhập tài khoản trước khi gửi phản ánh!');
    }
    return await this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateReportStatus(id, updateData) {
    if (!this.getToken()) {
      throw new Error('Vui lòng đăng nhập tài khoản Cán bộ hoặc Quản lý để cập nhật!');
    }
    return await this.request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }
}

window.apiService = new ApiService();
/**
 * API Service
 * Giao tiếp với Express Backend (http://localhost:5000/api/v1)
 * Tự động chuyển đổi sang Mock Store khi backend chưa bật hoặc mất kết nối
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
      // Khi không kết nối được hoặc timeout -> fallback sang local store
      if (err.name === 'AbortError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        this.backendAvailable = false;
        window.dispatchEvent(new CustomEvent('backend:status', { detail: { available: false } }));
      }
      throw err;
    }
  }

  // --- AUTHENTICATION ---
  async login(email, password) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      this.setSession(data.token, data.user);
      return data;
    } catch (err) {
      // Fallback offline demo login
      const users = JSON.parse(localStorage.getItem('eco_users_v1') || '[]');
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const dummyToken = 'mock_jwt_token_' + found.id + '_' + Date.now();
        const userData = { id: found.id, full_name: found.full_name, email: found.email, role: found.role };
        this.setSession(dummyToken, userData);
        return { message: 'Đăng nhập thành công (Chế độ mô phỏng)', user: userData, token: dummyToken };
      }
      throw new Error('Sai tài khoản hoặc mật khẩu!');
    }
  }

  async register(data) {
    try {
      return await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {
      // Offline fallback
      const users = JSON.parse(localStorage.getItem('eco_users_v1') || '[]');
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('Email này đã được đăng ký!');
      }
      const newUser = {
        id: users.length + 1,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: 'CITIZEN'
      };
      users.push(newUser);
      localStorage.setItem('eco_users_v1', JSON.stringify(users));
      return { message: 'Đăng ký tài khoản thành công (Lưu trữ cục bộ)' };
    }
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
    const user = this.getCurrentUser();
    try {
      return await this.request('/reports', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch {
      const created = window.localDataStore.createReport(data, user);
      return { message: 'Gửi phản ánh thành công!', reportId: created.id };
    }
  }

  async updateReportStatus(id, updateData) {
    const user = this.getCurrentUser();
    try {
      return await this.request(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
    } catch {
      const updated = window.localDataStore.updateReportStatus(id, updateData, user);
      if (!updated) throw new Error('Không tìm thấy phản ánh để cập nhật');
      return { message: 'Cập nhật tiến độ xử lý thành công!' };
    }
  }
}

window.apiService = new ApiService();


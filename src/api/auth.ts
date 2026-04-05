import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth';

function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function resolveApiUrl(): string {
  const configuredUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configuredUrl) {
    return removeTrailingSlash(configuredUrl);
  }

  if (import.meta.env.DEV) {
    return '/api';
  }

  return 'http://localhost:3000';
}

const API_URL = resolveApiUrl();
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
};

const api = axios.create({
  baseURL: API_URL,
  headers: COMMON_HEADERS,
});

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: COMMON_HEADERS,
});

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user: {
    id: string;
    full_name: string;
    role: string;
    email?: string;
    phone?: string;
  };
};

let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function notifyRefreshWaiters(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await refreshClient.post<RefreshResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  });

  localStorage.setItem('token', response.data.access_token);
  localStorage.setItem('refresh_token', response.data.refresh_token);
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data.access_token;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status: number | undefined = error?.response?.status;
    const url: string = String(originalRequest?.url || '');

    const isAuthRequest =
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    if (!originalRequest || isAuthRequest || status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => refreshWaiters.push(resolve));
      if (!token) {
        return Promise.reject(error);
      }
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      notifyRefreshWaiters(newToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      notifyRefreshWaiters(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },
};

export default api;

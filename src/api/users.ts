import api from './auth';
import type { User } from '../types/auth';

export interface UserFilters {
  page?: number;
  size?: number;
  search?: string;
}

const getAuthorizationHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const usersApi = {
  getUsers: async (params?: UserFilters): Promise<User[]> => {
    const response = await api.get<User[]>('/users', {
      params,
      headers: getAuthorizationHeader(),
    });
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`, {
      headers: getAuthorizationHeader(),
    });
  },

  toggleUserStatus: async (id: string): Promise<void> => {
    await api.put(
      `/users/${id}/status`,
      null,
      {
        headers: getAuthorizationHeader(),
      },
    );
  },

  createUser: async (data: any): Promise<User> => {
    const response = await api.post<User>('/users/staff', data, {
      headers: getAuthorizationHeader(),
    });
    return response.data;
  },

  updateUserRole: async (id: string, roleId: string | number): Promise<void> => {
    await api.put(`/users/${id}/role`, { role_id: roleId }, {
      headers: getAuthorizationHeader(),
    });
  },

  getRoles: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/users/roles', {
      headers: getAuthorizationHeader(),
    });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me', {
      headers: getAuthorizationHeader(),
    });
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/profile', data, {
      headers: getAuthorizationHeader(),
    });
    return response.data;
  },
};

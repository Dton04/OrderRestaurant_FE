import api from './auth'; // Using the base axios instance
import type { Table, CreateTableDto, UpdateTableDto } from '../types/table';

export const tableApi = {
  findAll: async (): Promise<Table[]> => {
    const response = await api.get<Table[]>('/tables');
    return response.data;
  },
  findOne: async (id: number): Promise<Table> => {
    const response = await api.get<Table>(`/tables/${id}`);
    return response.data;
  },
  create: async (data: CreateTableDto): Promise<Table> => {
    const response = await api.post<Table>('/tables', data);
    return response.data;
  },
  update: async (id: number, data: UpdateTableDto): Promise<Table> => {
    const response = await api.patch<Table>(`/tables/${id}`, data);
    return response.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },
};

export default tableApi;

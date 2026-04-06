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
  remove: async (id: number | string): Promise<void> => {
    const tableId = Number(id);
    if (Number.isNaN(tableId)) {
      throw new Error(`Invalid table id for delete: ${id}`);
    }
    await api.delete(`/tables/${tableId}`);
  },
  updateStatus: async (id: number | string, status: string): Promise<any> => {
    const response = await api.patch(`/tables/${id}/status`, { status });
    return response.data;
  },
};

export default tableApi;

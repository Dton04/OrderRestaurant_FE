import api from './auth';
import type {
  AdminVoucher,
  CreateVoucherDto,
  UpdateVoucherDto,
  VoucherFilters,
} from '../types/voucherAdmin';

export const voucherApi = {
  findAll: async (params?: VoucherFilters): Promise<AdminVoucher[]> => {
    const response = await api.get<AdminVoucher[]>('/vouchers', { params });
    return response.data;
  },
  create: async (data: CreateVoucherDto): Promise<AdminVoucher> => {
    const response = await api.post<AdminVoucher>('/vouchers', data);
    return response.data;
  },
  update: async (id: string, data: UpdateVoucherDto): Promise<AdminVoucher> => {
    const response = await api.patch<AdminVoucher>(`/vouchers/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete<{ success: boolean }>(`/vouchers/${id}`);
    return response.data;
  },
};

export default voucherApi;

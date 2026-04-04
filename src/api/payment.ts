import api from './auth';
import type { CreatePaymentDto, Payment, UpdatePaymentDto } from '../types/payment';

export const paymentApi = {
  findAll: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },
  findOne: async (id: bigint | number | string): Promise<Payment> => {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post<Payment>('/payments', data);
    return response.data;
  },
  update: async (
    id: bigint | number | string,
    data: UpdatePaymentDto,
  ): Promise<Payment> => {
    const response = await api.patch<Payment>(`/payments/${id}`, data);
    return response.data;
  },
};

export default paymentApi;

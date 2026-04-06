import api from './auth';
import type { CreatePaymentDto, Payment, UpdatePaymentDto } from '../types/payment';

const BASE_PATH = '/api/vnpay';

export const paymentApi = {
  findAll: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(BASE_PATH);
    return response.data;
  },
  findOne: async (id: bigint | number | string): Promise<Payment> => {
    const response = await api.get<Payment>(`${BASE_PATH}/${id}`);
    return response.data;
  },
  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await api.post<Payment>(BASE_PATH, data);
    return response.data;
  },
  update: async (
    id: bigint | number | string,
    data: UpdatePaymentDto,
  ): Promise<Payment> => {
    const response = await api.patch<Payment>(`${BASE_PATH}/${id}`, data);
    return response.data;
  },
  initVNPay: async (orderId: string | number): Promise<{ url: string }> => {
    const response = await api.get<{ url: string }>(`${BASE_PATH}/init/${orderId}`);
    return response.data;
  },
};

export default paymentApi;

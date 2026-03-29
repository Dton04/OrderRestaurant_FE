import api from './auth';
import type { Order, CreateOrderDto } from '../types/order';

export const orderApi = {
  findAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },
};

export default orderApi;

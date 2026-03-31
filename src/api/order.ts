import api from './auth';
import type { CreateOrderDto, Order, UpdateOrderDto } from '../types/order';

export const orderApi = {
  findAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  findOne: async (id: bigint | number | string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
  create: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },
  update: async (
    id: bigint | number | string,
    data: UpdateOrderDto,
  ): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },
  remove: async (id: bigint | number | string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

export default orderApi;

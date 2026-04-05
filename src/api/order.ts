import api from './auth';
import type { CreateOrderDto, Order, UpdateOrderDto } from '../types/order';

type ApiResponse<T> = {
  message: string;
  data: T;
};

export type KitchenQueueItem = {
  item_id: string | number;
  order_id?: string | number;
  dish_name: string;
  quantity: number;
  price_at_order?: string | number;
  line_total?: string | number;
  table_number: string;
  order_total_amount?: string | number;
  order_discount_amount?: string | number;
  order_final_amount?: string | number;
  order_type?: string;
  table_id?: string | number | null;
  notes?: string | null;
  status: string;
  created_at: string;
};

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
  getKitchenQueue: async (): Promise<KitchenQueueItem[]> => {
    const response = await api.get<ApiResponse<KitchenQueueItem[]>>(
      '/orders/kitchen/queue',
    );
    return response.data.data;
  },
  startCookingItem: async (itemId: bigint | number | string): Promise<void> => {
    await api.patch(`/orders/items/${itemId}/start`);
  },
  finishCookingItem: async (itemId: bigint | number | string): Promise<void> => {
    await api.patch(`/orders/items/${itemId}/finish`);
  },
};

export default orderApi;

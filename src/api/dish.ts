import api from './auth';
import type { Dish, CreateDishDto, UpdateDishDto } from '../types/dish';

export const dishApi = {
  findAll: async (): Promise<Dish[]> => {
    const response = await api.get<Dish[]>('/dishes');
    return response.data;
  },
  findOne: async (id: number): Promise<Dish> => {
    const response = await api.get<Dish>(`/dishes/${id}`);
    return response.data;
  },
  create: async (data: CreateDishDto): Promise<Dish> => {
    const response = await api.post<Dish>('/dishes', data);
    return response.data;
  },
  update: async (id: number, data: UpdateDishDto): Promise<Dish> => {
    const response = await api.patch<Dish>(`/dishes/${id}`, data);
    return response.data;
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};

export default dishApi;

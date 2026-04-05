import api from './auth';
import type { Dish, CreateDishDto, UpdateDishDto } from '../types/dish';

const normalizeDish = (raw: unknown): Dish => {
  const record = (raw ?? {}) as Record<string, unknown>;
  const id = Number(record.id);
  const categoryId = Number(record.category_id);
  const price = Number(record.price);

  return {
    name: String(record.name ?? ''),
    description:
      record.description == null ? undefined : String(record.description),
    image_url: record.image_url == null ? undefined : String(record.image_url),
    category_id: Number.isFinite(categoryId) ? categoryId : 0,
    is_available:
      typeof record.is_available === 'boolean' ? record.is_available : undefined,
    id: Number.isFinite(id) ? id : 0,
    price: Number.isFinite(price) ? price : 0,
    created_at:
      record.created_at == null ? undefined : String(record.created_at),
    updated_at:
      record.updated_at == null ? undefined : String(record.updated_at),
  };
};

export const dishApi = {
  findAll: async (): Promise<Dish[]> => {
    const response = await api.get<Dish[]>('/dishes');
    return (Array.isArray(response.data) ? response.data : []).map(normalizeDish);
  },
  findOne: async (id: number): Promise<Dish> => {
    const response = await api.get<Dish>(`/dishes/${id}`);
    return normalizeDish(response.data);
  },
  create: async (data: CreateDishDto): Promise<Dish> => {
    const response = await api.post<Dish>('/dishes', data);
    return normalizeDish(response.data);
  },
  update: async (id: number, data: UpdateDishDto): Promise<Dish> => {
    const response = await api.patch<Dish>(`/dishes/${id}`, data);
    return normalizeDish(response.data);
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};

export default dishApi;

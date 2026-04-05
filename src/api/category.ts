import api from './auth';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

const normalizeCategory = (raw: unknown): Category => {
  const record = (raw ?? {}) as Record<string, unknown>;
  const id = Number(record.id);
  const dishCount = Number(record.dish_count);
  return {
    id: Number.isFinite(id) ? id : 0,
    name: String(record.name ?? ''),
    description:
      record.description == null ? undefined : String(record.description),
    image_url: record.image_url == null ? undefined : String(record.image_url),
    created_at:
      record.created_at == null ? undefined : String(record.created_at),
    updated_at:
      record.updated_at == null ? undefined : String(record.updated_at),
    dish_count: Number.isFinite(dishCount) ? dishCount : undefined,
  };
};

export const categoryApi = {
  findAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return (Array.isArray(response.data) ? response.data : []).map(
      normalizeCategory,
    );
  },
  findOne: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return normalizeCategory(response.data);
  },
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return normalizeCategory(response.data);
  },
  update: async (id: number, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return normalizeCategory(response.data);
  },
  remove: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryApi;

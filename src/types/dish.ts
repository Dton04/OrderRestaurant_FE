export interface CreateDishDto {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id: number;
  is_available?: boolean;
}

export type UpdateDishDto = Partial<CreateDishDto>;

export interface Dish extends CreateDishDto {
  id: number;
  created_at?: string;
  updated_at?: string;
}

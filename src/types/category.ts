export interface CreateCategoryDto {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface Category extends CreateCategoryDto {
  id: number;
  created_at?: string;
  updated_at?: string;
  dish_count?: number; // Optional, might be added by the repository or service later
}

export interface CreateTableDto {
  table_number: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  area_id: number;
  guests?: number;
}

export type UpdateTableDto = Partial<CreateTableDto>;

export interface Table extends CreateTableDto {
  id: number;
  guests?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTableDto {
  table_number: string;
  capacity: number;
  status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  area_id: number;
}

export interface UpdateTableDto extends Partial<CreateTableDto> {}

export interface Table extends CreateTableDto {
  id: number;
  created_at?: string;
  updated_at?: string;
}

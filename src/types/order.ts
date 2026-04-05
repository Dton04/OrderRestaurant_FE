export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CreateOrderItemDto {
  dish_id: bigint | number | string;
  quantity: number;
  price_at_order: number;
}

export interface CreateOrderDto {
  customer_id?: bigint | number | string;
  staff_id?: bigint | number | string;
  table_id?: bigint | number | string;
  total_amount: number;
  discount_amount?: number;
  final_amount: number;
  status: OrderStatus | string;
  items: CreateOrderItemDto[];
}

export type UpdateOrderDto = Partial<CreateOrderDto>;

export interface OrderItem {
  id: bigint | number | string;
  order_id: bigint | number | string;
  dish_id: bigint | number | string;
  quantity: number;
  price_at_order: number | string;
  status: OrderStatus | string;
  notes?: string | null;
}

export interface Order {
  id: bigint | number | string;
  customer_id?: bigint | number | string | null;
  staff_id?: bigint | number | string | null;
  table_id?: bigint | number | string | null;
  total_amount: number | string;
  discount_amount?: number | string | null;
  final_amount: number | string;
  status: OrderStatus | string;
  notes?: string | null;
  voucher_id?: bigint | number | string | null;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  dishId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  tableId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export interface CreateOrderDto {
  tableId: number;
  items: OrderItem[];
  notes?: string;
  customerType: 'WALK_IN' | 'ONLINE';
  totalAmount: number;
}

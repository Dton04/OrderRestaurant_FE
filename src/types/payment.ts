export type PaymentMethod = 'CASH' | 'CARD' | 'MOMO' | 'VNPAY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentOrder {
  id: bigint | number | string;
  final_amount?: number;
}

export interface Payment {
  id: bigint | number | string;
  order_id: bigint | number | string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string | null;
  payment_date?: string;
  order?: PaymentOrder;
}

export interface CreatePaymentDto {
  order_id: bigint | number | string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
}

export type UpdatePaymentDto = Partial<CreatePaymentDto>;

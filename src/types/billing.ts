export interface BillingDraftItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  note: string;
  accent: string;
}

export interface BillingDraft {
  code: string;
  orderId: string | null;
  items: BillingDraftItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  vat: number;
  tableNumber?: string;
}

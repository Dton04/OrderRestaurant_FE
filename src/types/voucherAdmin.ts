export type VoucherStatus = 'ACTIVE' | 'EXPIRED' | 'DRAFT';
export type VoucherUsageType = 'UNLIMITED' | 'LIMITED';
export type VoucherDiscountType = 'FIXED' | 'PERCENT';

export interface AdminVoucher {
  id: string;
  code: string;
  discount_type: VoucherDiscountType | string;
  value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  description: string;
  usageType: VoucherUsageType;
  usageLimit: number | null;
  usageCount: number;
  status: VoucherStatus;
}

export interface VoucherFilters {
  search?: string;
  status?: VoucherStatus | '';
}

export interface CreateVoucherDto {
  code?: string;
  discount_type: VoucherDiscountType | string;
  value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  description?: string;
  usageType?: VoucherUsageType;
  usageLimit?: number | null;
}

export type UpdateVoucherDto = Partial<CreateVoucherDto> & {
  usageCount?: number;
  isDraft?: boolean;
};

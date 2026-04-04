import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  QrCode,
  Check,
  CheckCircle2,
  ReceiptText,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Printer,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';
import paymentApi from '../../api/payment';
import orderApi from '../../api/order';
import type { BillingDraft } from '../../types/billing';
import type { PaymentMethod, PaymentStatus, Payment } from '../../types/payment';

type MethodCard = {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type StaffUser = {
  id?: string | number;
};

type RevenueStats = {
  processedOrders: number;
  cashCollected: number;
  totalRevenue: number;
  trendPercent: number;
  breakdown: Array<{
    label: string;
    method: PaymentMethod;
    amount: number;
    percent: number;
    color: string;
  }>;
};

const BILLING_DRAFT_KEY = 'staff.billingDraft';
const ACTIVE_ORDER_TABLE_KEY = 'staff.activeOrderTable';

type SelectedTableInfo = {
  id?: string | number;
  table_number?: string;
};
const methodCards: MethodCard[] = [
  { id: 'CASH', label: 'Tiền mặt', icon: Banknote },
  { id: 'VNPAY', label: 'VNPay', icon: QrCode },
];

const breakdownStyles: Record<PaymentMethod, { label: string; color: string }> = {
  CASH: { label: 'Tiền mặt', color: '#ac3509' },
  CARD: { label: 'Thẻ / Bank', color: '#fdba74' },
  MOMO: { label: 'MoMo', color: '#d4d4d8' },
  VNPAY: { label: 'VNPay', color: '#d4d4d8' },
};

const emptyDraft: BillingDraft = {
  code: '#NEW-000000',
  orderId: null,
  items: [],
  totalAmount: 0,
  discountAmount: 0,
  finalAmount: 0,
  vat: 0,
};

const emptyStats: RevenueStats = {
  processedOrders: 0,
  cashCollected: 0,
  totalRevenue: 0,
  trendPercent: 0,
  breakdown: [
    { label: 'Tiền mặt', method: 'CASH', amount: 0, percent: 0, color: '#ac3509' },
    { label: 'VNPay', method: 'VNPAY', amount: 0, percent: 0, color: '#d4d4d8' },
  ],
};

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  return formatCurrency(value);
};

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const sameDate = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getStoredUser = (): StaffUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StaffUser;
  } catch {
    return null;
  }
};

const buildBreakdown = (
  payments: Payment[],
  totalRevenue: number,
): RevenueStats['breakdown'] => {
  const grouped = new Map<PaymentMethod, number>([
    ['CASH', 0],
    ['VNPAY', 0],
  ]);

  payments.forEach((payment) => {
    const amount = toNumber(payment.amount);
    if (payment.method === 'MOMO') {
      grouped.set('VNPAY', (grouped.get('VNPAY') || 0) + amount);
      return;
    }

    if (payment.method === 'CARD') {
      return;
    }

    grouped.set(payment.method, (grouped.get(payment.method) || 0) + amount);
  });

  return [
    { method: 'CASH' as const },
    { method: 'VNPAY' as const },
  ].map(({ method }) => ({
    method,
    label: breakdownStyles[method].label,
    amount: grouped.get(method) || 0,
    percent:
      totalRevenue > 0
        ? Math.round(((grouped.get(method) || 0) / totalRevenue) * 100)
        : 0,
    color: breakdownStyles[method].color,
  }));
};

const buildDonutBackground = (breakdown: RevenueStats['breakdown']) => {
  const total = breakdown.reduce((sum, item) => sum + item.percent, 0);
  if (total === 0) {
    return 'conic-gradient(#e5e7eb 0deg 360deg)';
  }

  let current = 0;
  const segments = breakdown.map((item) => {
    const degrees = (item.percent / 100) * 360;
    const start = current;
    const end = current + degrees;
    current = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(', ')})`;
};

const extractApiErrorMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  if (!response || typeof response.data !== 'object' || response.data === null) {
    return null;
  }

  const data = response.data as { message?: unknown };
  if (typeof data.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data.message) && data.message.length > 0) {
    return String(data.message[0]);
  }

  return null;
};

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [stats, setStats] = useState<RevenueStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const draft = useMemo<BillingDraft>(() => {
    const raw = localStorage.getItem(BILLING_DRAFT_KEY);
    if (!raw) {
      return emptyDraft;
    }

    try {
      const parsed = JSON.parse(raw) as BillingDraft;
      return {
        ...emptyDraft,
        ...parsed,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      };
    } catch {
      return emptyDraft;
    }
  }, []);

  const selectedTable = useMemo<SelectedTableInfo | null>(() => {
    const raw = localStorage.getItem(ACTIVE_ORDER_TABLE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as SelectedTableInfo;
    } catch {
      return null;
    }
  }, []);

  const loadRevenueStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const user = getStoredUser();
      if (!user?.id) {
        setStats(emptyStats);
        setStatsError('Không tìm thấy staff_id trong phiên đăng nhập.');
        return;
      }

      const [orders, payments] = await Promise.all([
        orderApi.findAll(),
        paymentApi.findAll(),
      ]);
      const staffId = String(user.id);
      const staffOrders = orders.filter(
        (order) => String(order.staff_id ?? '') === staffId,
      );
      const orderIds = new Set(staffOrders.map((order) => String(order.id)));
      const staffPayments = payments.filter((payment) =>
        orderIds.has(String(payment.order_id)),
      );
      const successfulPayments = staffPayments.filter(
        (payment) => payment.status === 'SUCCESS',
      );

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const todayPayments = successfulPayments.filter((payment) => {
        if (!payment.payment_date) {
          return true;
        }
        return sameDate(new Date(payment.payment_date), now);
      });

      const yesterdayPayments = successfulPayments.filter((payment) => {
        if (!payment.payment_date) {
          return false;
        }
        return sameDate(new Date(payment.payment_date), yesterday);
      });

      const processedOrders = new Set(
        todayPayments.map((payment) => String(payment.order_id)),
      ).size;
      const cashCollected = todayPayments
        .filter((payment) => payment.method === 'CASH')
        .reduce((sum, payment) => sum + toNumber(payment.amount), 0);
      const totalRevenue = todayPayments.reduce(
        (sum, payment) => sum + toNumber(payment.amount),
        0,
      );
      const yesterdayRevenue = yesterdayPayments.reduce(
        (sum, payment) => sum + toNumber(payment.amount),
        0,
      );
      const trendPercent =
        yesterdayRevenue > 0
          ? Math.round(((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
          : totalRevenue > 0
            ? 100
            : 0;

      setStats({
        processedOrders,
        cashCollected,
        totalRevenue,
        trendPercent,
        breakdown: buildBreakdown(todayPayments, totalRevenue),
      });
      setStatsError(null);
    } catch (error) {
      console.error('Failed to fetch revenue stats:', error);
      setStats(emptyStats);
      setStatsError('Không thể tải doanh thu cá nhân từ dữ liệu thật.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenueStats();
  }, [loadRevenueStats]);

  const isVnpay = selectedMethod === 'VNPAY';
  const effectiveStatus: PaymentStatus = isVnpay ? 'PENDING' : 'SUCCESS';
  const updatedAtLabel = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
  const donutBackground = buildDonutBackground(stats.breakdown);

  const updateOrderPaidStatus = async (orderIdValue: string | number) => {
    const statusCandidates = ['PAID', 'COMPLETED', 'SUCCESS', 'IN_PROGRESS'];
    let lastError: unknown = null;

    for (const status of statusCandidates) {
      try {
        await orderApi.update(orderIdValue, {
          status,
          total_amount: draft.totalAmount,
          discount_amount: draft.discountAmount,
          final_amount: draft.finalAmount,
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  };

  const handleConfirmPayment = async () => {
    if (!draft.orderId) {
      setFeedbackType('error');
      setFeedback(
        'Chưa có order_id từ backend. Cần tạo order trước rồi mới gọi POST /payments.',
      );
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const payment = await paymentApi.create({
        order_id: draft.orderId,
        amount: draft.finalAmount,
        method: selectedMethod,
        status: effectiveStatus,
        transaction_id: undefined,
      });

      if (!isVnpay) {
        await updateOrderPaidStatus(String(draft.orderId));
      }

      setPaymentCompleted(true);
      setFeedbackType('success');
      setFeedback(
        isVnpay
          ? `Đã tạo payment VNPay ở trạng thái PENDING. Payment ID: ${String(payment.id)}. Cần endpoint init/callback từ backend để hoàn tất giao dịch.`
          : `Thanh toán thành công. Payment ID: ${String(payment.id)}. Order đã được cập nhật sang trạng thái PAID.`,
      );
      await loadRevenueStats();
    } catch (error) {
      console.error('Failed to process payment:', error);
      setFeedbackType('error');
      const apiMessage = extractApiErrorMessage(error);
      setFeedback(
        apiMessage
          ? `Không thể xử lý thanh toán: ${apiMessage}`
          : 'Không thể xử lý thanh toán. Vui lòng kiểm tra token, trạng thái order và API payment.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] text-[#191c1d]"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <StaffTopBar />
      <StaffSidebarNew />

      <main className="px-6 pb-12 pt-24 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[#191c1d]">
                Thanh toán & Báo cáo
              </h1>
              <p className="font-medium text-[#59413a]">
                Ca làm việc:{' '}
                <span className="text-[#ac3509]">Morning Shift (06:00 - 14:00)</span>
              </p>
            </div>
            <div className="flex gap-3">
              {selectedTable ? (
                <div className="flex items-center gap-3 rounded-xl bg-[#f3f4f5] px-4 py-2">
                  <span className="h-3 w-3 rounded-full bg-[#ac3509]" />
                  <span className="text-sm font-bold uppercase tracking-wider text-[#59413a]">
                    Bàn: {selectedTable.table_number || selectedTable.id}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-xl bg-[#f3f4f5] px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-[#ac3509]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#59413a]">
                  Mã đơn: {draft.code}
                </span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <section className="space-y-8 lg:col-span-7">
              <div className="relative overflow-hidden rounded-[28px] bg-white p-8 shadow-[0_8px_32px_rgba(172,53,9,0.04)]">
                <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#ac3509]" />
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                  <ReceiptText size={22} className="text-[#ac3509]" />
                  Chi tiết hóa đơn
                </h3>

                <div className="space-y-4">
                  {draft.items.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#e0bfb6] bg-[#f8f9fa] p-8 text-center text-[#59413a]">
                      Chưa có dữ liệu đơn hàng để thanh toán.
                    </div>
                  ) : (
                    draft.items.map((line) => (
                      <div key={line.id} className="flex items-center justify-between py-3">
                        <div className="flex gap-4">
                          <span className="w-6 font-bold text-[#ac3509]">
                            {line.quantity}x
                          </span>
                          <div>
                            <p className="text-lg font-bold text-[#191c1d]">
                              {line.name}
                            </p>
                            <p className="text-sm text-[#59413a]">
                              {line.note || 'Không có ghi chú'}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-[#191c1d]">
                          {formatCurrency(line.quantity * line.unitPrice)}
                        </span>
                      </div>
                    ))
                  )}

                  <div className="mt-8 space-y-3 border-t-2 border-dashed border-zinc-100 pt-6">
                    <div className="flex justify-between text-[#59413a]">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        Tạm tính
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(draft.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        Giảm giá
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(draft.discountAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#59413a]">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        VAT (8%)
                      </span>
                      <span className="font-semibold">{formatCurrency(draft.vat)}</span>
                    </div>
                    <div className="flex items-end justify-between pt-4">
                      <span className="text-lg font-black uppercase tracking-widest text-[#191c1d]">
                        Tổng cộng
                      </span>
                      <span className="text-3xl font-black text-[#ac3509]">
                        {formatCurrency(draft.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#f3f4f5] p-8">
                <h3 className="mb-6 text-xl font-bold text-[#191c1d]">
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {methodCards.map((method) => {
                    const Icon = method.icon;
                    const selected = selectedMethod === method.id;

                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-all duration-300 ${
                          selected
                            ? 'bg-white shadow-md ring-2 ring-[#ac3509]'
                            : 'bg-white shadow-sm hover:translate-x-1'
                        }`}
                      >
                        {selected ? (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ac3509]">
                            <Check size={12} className="text-white" />
                          </div>
                        ) : null}
                        <Icon
                          size={30}
                          className={selected ? 'text-[#ac3509]' : 'text-zinc-400'}
                        />
                        <span className="font-bold text-[#191c1d]">{method.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl bg-white px-4 py-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-[#59413a]">
                      Trạng thái gửi payment
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        effectiveStatus === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {effectiveStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#59413a]">
                    {isVnpay
                      ? 'VNPay hiện được tạo ở trạng thái PENDING để chờ callback xác nhận từ backend.'
                      : 'Tiền mặt được chốt SUCCESS ngay khi staff xác nhận thanh toán.'}
                  </p>
                </div>

                {isVnpay ? (
                  <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800">
                    VNPay hiện mới được hỗ trợ ở mức tạo record payment với trạng thái
                    {' '}<code>PENDING</code>. Backend cần bổ sung{' '}
                    <code>/payments/vnpay/init</code> và{' '}
                    <code>/payments/vnpay/callback</code> để redirect sang VNPay và cập nhật kết quả giao dịch.
                  </div>
                ) : null}

                {feedback ? (
                  <div
                    className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                      feedbackType === 'success'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {feedback}
                  </div>
                ) : null}

                {!draft.orderId ? (
                  <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    Chưa có <code>order_id</code> thật từ backend. Cần tạo order trước rồi mới gọi được API thanh toán.
                  </div>
                ) : null}

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => navigate('/staff/active-orders')}
                    className="flex-1 rounded-xl bg-zinc-200 py-4 font-bold text-[#191c1d] transition-all active:scale-95"
                  >
                    Quay lại đơn hàng
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={submitting || paymentCompleted || draft.items.length === 0 || !draft.orderId}
                    className="flex-[2] rounded-xl bg-gradient-to-br from-[#ac3509] to-[#ff7043] py-4 font-bold text-white shadow-lg shadow-[#ac3509]/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} />
                      {submitting
                        ? 'Đang xử lý...'
                        : isVnpay
                          ? 'Tạo payment VNPay'
                          : paymentCompleted
                            ? 'Đã thanh toán'
                            : 'Xác nhận thanh toán'}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6 lg:col-span-5">
              <div className="rounded-[28px] border border-orange-100/60 bg-white p-8 shadow-[0_8px_32px_rgba(172,53,9,0.06)]">
                {statsLoading ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-[#59413a]">
                    <Loader2 size={28} className="animate-spin text-[#ac3509]" />
                    <p className="text-sm font-semibold">Đang tải doanh thu cá nhân...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight">
                          Doanh thu cá nhân
                        </h3>
                        <p className="text-sm text-[#59413a]">
                          Cập nhật lúc: {updatedAtLabel}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-emerald-700">
                        Active Shift
                      </span>
                    </div>

                    {statsError ? (
                      <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {statsError}
                      </div>
                    ) : null}

                    <div className="mb-8 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-[#f3f4f5] p-5">
                        <ShoppingBag size={22} className="mb-2 text-[#ac3509]" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[#59413a]">
                          Số đơn đã xử lý
                        </p>
                        <p className="text-2xl font-black text-[#191c1d]">
                          {stats.processedOrders}{' '}
                          <span className="text-xs font-normal">đơn</span>
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f3f4f5] p-5">
                        <Wallet size={22} className="mb-2 text-[#ac3509]" />
                        <p className="text-xs font-bold uppercase tracking-widest text-[#59413a]">
                          Tiền mặt thu
                        </p>
                        <p className="text-2xl font-black text-[#191c1d]">
                          {formatCompactCurrency(stats.cashCollected)}
                        </p>
                      </div>
                      <div className="col-span-2 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
                          Tổng doanh thu trong ca
                        </p>
                        <p className="text-3xl font-black tracking-tight">
                          {formatCurrency(stats.totalRevenue)}
                        </p>
                        <div
                          className={`mt-4 flex items-center gap-2 text-xs font-bold ${
                            stats.trendPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          <TrendingUp size={16} />
                          {stats.trendPercent >= 0 ? '+' : ''}
                          {stats.trendPercent}% so với hôm qua
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-sm font-black uppercase tracking-widest text-[#59413a]">
                        Phân bổ phương thức
                      </h4>
                      <div className="flex items-center justify-between gap-8">
                        <div className="relative flex h-32 w-32 items-center justify-center">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ background: donutBackground }}
                          />
                          <div className="absolute inset-[14px] rounded-full bg-white" />
                          <div className="relative text-center">
                            <span className="block text-xl font-black">
                              {stats.breakdown.filter((item) => item.amount > 0).length}
                            </span>
                            <span className="text-[9px] font-bold uppercase text-[#59413a]">
                              Loại
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          {stats.breakdown.map((item) => (
                            <div key={item.method} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm font-medium text-[#191c1d]">
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-[#191c1d]">
                                {item.percent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 border-t border-zinc-100 pt-8">
                      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ac3509]/20 py-4 font-bold text-[#ac3509] transition-all hover:bg-orange-50">
                        <Printer size={18} />
                        In báo cáo ca
                      </button>
                      <button className="w-full rounded-xl bg-[#edeeef] py-4 font-bold text-[#191c1d] transition-all active:scale-95">
                        Kết thúc ca trực
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="group relative overflow-hidden rounded-[28px] bg-[#00acbb]/10 p-6">
                <div className="relative z-10">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-[#006972]">
                    Staff Tip of the Day
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-[#003a3f]">
                    Luôn kiểm tra kỹ các món có trong đơn trước khi xác nhận thanh toán để tránh sai sót doanh thu.
                  </p>
                </div>
                <Lightbulb className="absolute -bottom-4 -right-4 h-20 w-20 text-[#006972]/10 transition-transform duration-500 group-hover:scale-110" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BillingPage;

import React from 'react';
import {
  Banknote,
  CreditCard,
  QrCode,
  Check,
  CheckCircle2,
  ReceiptText,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Printer,
  Lightbulb,
} from 'lucide-react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';

type BillLine = {
  id: number;
  quantity: number;
  name: string;
  note: string;
  total: number;
};

type PaymentMethod = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  selected?: boolean;
};

const billLines: BillLine[] = [
  {
    id: 1,
    quantity: 2,
    name: 'Wagyu Beef Carpaccio',
    note: 'Truffle oil, capers, parmesan',
    total: 1100000,
  },
  {
    id: 2,
    quantity: 1,
    name: 'Seafood Risotto',
    note: 'Saffron, scallops, king prawns',
    total: 650000,
  },
  {
    id: 3,
    quantity: 2,
    name: 'Chateau Margaux 2015',
    note: 'Glass service',
    total: 1800000,
  },
];

const paymentMethods: PaymentMethod[] = [
  { id: 'cash', label: 'Tiền mặt', icon: Banknote },
  { id: 'card', label: 'Thẻ ngân hàng', icon: CreditCard },
  { id: 'qr', label: 'MoMo / VNPay', icon: QrCode, selected: true },
];

const paymentBreakdown = [
  { label: 'Tiền mặt', value: '45%', color: 'bg-[#ac3509]' },
  { label: 'Thẻ / Bank', value: '35%', color: 'bg-orange-300' },
  { label: 'MoMo / VNP', value: '20%', color: 'bg-zinc-300' },
];

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

const BillingPage: React.FC = () => {
  const subtotal = 3550000;
  const discount = 355000;
  const vat = 255600;
  const total = subtotal - discount + vat;

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
                <span className="text-[#ac3509]">
                  Morning Shift (06:00 - 14:00)
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-[#f3f4f5] px-4 py-2">
                <span className="h-3 w-3 rounded-full bg-[#ac3509]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#59413a]">
                  Mã đơn: #AT-8829
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
                  {billLines.map((line) => (
                    <div
                      key={line.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex gap-4">
                        <span className="w-6 font-bold text-[#ac3509]">
                          {line.quantity}x
                        </span>
                        <div>
                          <p className="text-lg font-bold text-[#191c1d]">
                            {line.name}
                          </p>
                          <p className="text-sm text-[#59413a]">{line.note}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#191c1d]">
                        {formatCurrency(line.total)}
                      </span>
                    </div>
                  ))}

                  <div className="mt-8 space-y-3 border-t-2 border-dashed border-zinc-100 pt-6">
                    <div className="flex justify-between text-[#59413a]">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        Tạm tính
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        Giảm giá (Voucher -10%)
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#59413a]">
                      <span className="text-sm font-medium uppercase tracking-widest">
                        VAT (8%)
                      </span>
                      <span className="font-semibold">{formatCurrency(vat)}</span>
                    </div>
                    <div className="flex items-end justify-between pt-4">
                      <span className="text-lg font-black uppercase tracking-widest text-[#191c1d]">
                        Tổng cộng
                      </span>
                      <span className="text-3xl font-black text-[#ac3509]">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[#f3f4f5] p-8">
                <h3 className="mb-6 text-xl font-bold text-[#191c1d]">
                  Phương thức thanh toán
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;

                    return (
                      <button
                        key={method.id}
                        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-all duration-300 ${
                          method.selected
                            ? 'bg-white shadow-md ring-2 ring-[#ac3509]'
                            : 'bg-white shadow-sm hover:translate-x-1'
                        }`}
                      >
                        {method.selected ? (
                          <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#ac3509]">
                            <Check size={12} className="text-white" />
                          </div>
                        ) : null}
                        <Icon
                          size={30}
                          className={
                            method.selected ? 'text-[#ac3509]' : 'text-zinc-400'
                          }
                        />
                        <span className="font-bold text-[#191c1d]">
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 rounded-xl bg-zinc-200 py-4 font-bold text-[#191c1d] transition-all active:scale-95">
                    Hủy giao dịch
                  </button>
                  <button className="flex-[2] rounded-xl bg-gradient-to-br from-[#ac3509] to-[#ff7043] py-4 font-bold text-white shadow-lg shadow-[#ac3509]/20 transition-all active:scale-95">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} />
                      Xác nhận thanh toán
                    </span>
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6 lg:col-span-5">
              <div className="rounded-[28px] border border-orange-100/60 bg-white p-8 shadow-[0_8px_32px_rgba(172,53,9,0.06)]">
                <div className="mb-8 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">
                      Doanh thu cá nhân
                    </h3>
                    <p className="text-sm text-[#59413a]">
                      Cập nhật lúc: 13:45
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-emerald-700">
                    Active Shift
                  </span>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#f3f4f5] p-5">
                    <ShoppingBag size={22} className="mb-2 text-[#ac3509]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#59413a]">
                      Số đơn đã xử lý
                    </p>
                    <p className="text-2xl font-black text-[#191c1d]">
                      24 <span className="text-xs font-normal">đơn</span>
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f3f4f5] p-5">
                    <Wallet size={22} className="mb-2 text-[#ac3509]" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#59413a]">
                      Tiền mặt thu
                    </p>
                    <p className="text-2xl font-black text-[#191c1d]">12.5M</p>
                  </div>
                  <div className="col-span-2 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 text-white">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-zinc-400">
                      Tổng doanh thu trong ca
                    </p>
                    <p className="text-3xl font-black tracking-tight">
                      42.850.000đ
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <TrendingUp size={16} />
                      +12% so với hôm qua
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#59413a]">
                    Phân bổ phương thức
                  </h4>
                  <div className="flex items-center justify-between gap-8">
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[14px] border-zinc-100" />
                      <div className="absolute inset-0 rotate-12 rounded-full border-[14px] border-[#ac3509] border-b-transparent border-r-transparent" />
                      <div className="absolute inset-0 -rotate-45 rounded-full border-[14px] border-orange-300 border-l-transparent border-t-transparent" />
                      <div className="text-center">
                        <span className="block text-xl font-black">3</span>
                        <span className="text-[9px] font-bold uppercase text-[#59413a]">
                          Loại
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {paymentBreakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-3 w-3 rounded-full ${item.color}`}
                            />
                            <span className="text-sm font-medium text-[#191c1d]">
                              {item.label}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-[#191c1d]">
                            {item.value}
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
              </div>

              <div className="group relative overflow-hidden rounded-[28px] bg-[#00acbb]/10 p-6">
                <div className="relative z-10">
                  <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-[#006972]">
                    Staff Tip of the Day
                  </h4>
                  <p className="text-sm font-medium leading-relaxed text-[#003a3f]">
                    Luôn kiểm tra kỹ các món có trong đơn trước khi xác nhận
                    thanh toán để tránh sai sót doanh thu.
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

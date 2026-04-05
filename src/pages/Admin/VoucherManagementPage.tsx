import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  Pencil,
  Percent,
  Plus,
  Search,
  Tag,
  TicketPercent,
  Trash2,
  X,
} from 'lucide-react';
import voucherApi from '../../api/voucher';
import type {
  AdminVoucher,
  CreateVoucherDto,
  VoucherStatus,
} from '../../types/voucherAdmin';

type VoucherFormState = CreateVoucherDto & {
  isDraft?: boolean;
};

const emptyForm: VoucherFormState = {
  code: '',
  discount_type: 'PERCENT',
  value: 0,
  min_order_value: 0,
  start_date: '',
  end_date: '',
  description: '',
  usageType: 'UNLIMITED',
  usageLimit: null,
  isDraft: false,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

const statusClasses: Record<VoucherStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-slate-100 text-slate-600',
  DRAFT: 'bg-amber-100 text-amber-700',
};

const VoucherManagementPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);
  const [formState, setFormState] = useState<VoucherFormState>(emptyForm);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadVouchers = async (filters?: { search?: string; status?: VoucherStatus | '' }) => {
    const response = await voucherApi.findAll({
      search: filters?.search,
      status: filters?.status,
    });
    setVouchers(response);
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await loadVouchers({ search, status: statusFilter });
      } catch (error) {
        console.error('Failed to load vouchers:', error);
        setFeedback('Không thể tải danh sách voucher.');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    return {
      active: vouchers.filter((item) => item.status === 'ACTIVE').length,
      draft: vouchers.filter((item) => item.status === 'DRAFT').length,
      totalUses: vouchers.reduce((sum, item) => sum + item.usageCount, 0),
    };
  }, [vouchers]);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormState(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: AdminVoucher) => {
    setEditingVoucher(voucher);
    setFormState({
      code: voucher.code,
      discount_type: voucher.discount_type,
      value: voucher.value,
      min_order_value: voucher.min_order_value,
      start_date: voucher.start_date.slice(0, 10),
      end_date: voucher.end_date.slice(0, 10),
      description: voucher.description,
      usageType: voucher.usageType,
      usageLimit: voucher.usageLimit,
      isDraft: voucher.status === 'DRAFT',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVoucher(null);
    setFormState(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setFeedback(null);

      const payload = {
        ...formState,
        code: formState.code?.trim() || undefined,
        usageLimit:
          formState.usageType === 'LIMITED' ? Number(formState.usageLimit || 0) : null,
      };

      if (editingVoucher) {
        await voucherApi.update(editingVoucher.id, payload);
        setFeedback('Voucher đã được cập nhật.');
      } else {
        await voucherApi.create(payload);
        setFeedback('Voucher mới đã được tạo.');
      }

      await loadVouchers({ search, status: statusFilter });
      closeModal();
    } catch (error) {
      console.error('Failed to save voucher:', error);
      setFeedback('Không thể lưu voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true);
      setFeedback(null);
      await voucherApi.remove(id);
      await loadVouchers({ search, status: statusFilter });
      setFeedback('Voucher đã được xóa.');
      if (editingVoucher?.id === id) {
        closeModal();
      }
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      setFeedback('Không thể xóa voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d76839]">
            Admin Voucher Console
          </p>
          <h2 className="mt-2 text-[32px] font-black tracking-tight text-[#1f2022]">
            Quản lý Voucher & Khuyến mãi
          </h2>
          <p className="mt-2 text-sm font-medium text-[#7d7065]">
            Tạo và quản lý mã giảm giá, chiến dịch khuyến mãi, trạng thái và usage count.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#d76839] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(215,104,57,0.22)]"
        >
          <Plus size={18} />
          Tạo voucher mới
        </button>
      </div>

      {feedback ? (
        <div className="rounded-2xl bg-[#fff4ed] px-4 py-3 text-sm font-semibold text-[#a6401d]">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
          <TicketPercent size={22} className="text-[#d76839]" />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#aa9c90]">
            Active Vouchers
          </p>
          <p className="mt-2 text-4xl font-black text-[#1f2022]">{stats.active}</p>
        </div>
        <div className="rounded-[28px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
          <Tag size={22} className="text-[#d76839]" />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#aa9c90]">
            Draft Vouchers
          </p>
          <p className="mt-2 text-4xl font-black text-[#1f2022]">{stats.draft}</p>
        </div>
        <div className="rounded-[28px] bg-gradient-to-br from-[#d76839] to-[#a6401d] p-5 text-white shadow-[0_20px_36px_rgba(187,88,46,0.22)]">
          <CalendarDays size={22} className="text-white/80" />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-white/70">
            Total Uses
          </p>
          <p className="mt-2 text-4xl font-black">{stats.totalUses}</p>
        </div>
      </div>

      <section className="rounded-[32px] bg-white p-5 shadow-[0_16px_36px_rgba(85,54,33,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row">
            <label className="relative block flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ab9b8d]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo mã voucher..."
                className="w-full rounded-2xl border border-[#efe3d7] bg-[#fffaf6] py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-[#d76839]"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as VoucherStatus | '')}
              className="rounded-2xl border border-[#efe3d7] bg-[#fffaf6] px-4 py-3 text-sm font-bold text-[#1f2022] outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <Loader2 size={30} className="animate-spin text-[#d76839]" />
            </div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                  <th className="px-3">Mã</th>
                  <th className="px-3">Loại</th>
                  <th className="px-3">Giá trị</th>
                  <th className="px-3">Điều kiện</th>
                  <th className="px-3">Thời gian</th>
                  <th className="px-3">Trạng thái</th>
                  <th className="px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="bg-[#fffaf6] text-sm font-semibold text-[#1f2022]"
                  >
                    <td className="rounded-l-2xl px-3 py-4 font-black">{voucher.code}</td>
                    <td className="px-3 py-4">
                      {voucher.discount_type === 'FIXED' ? 'Fixed' : 'Percent'}
                    </td>
                    <td className="px-3 py-4">
                      {voucher.discount_type === 'FIXED'
                        ? `${voucher.value.toLocaleString('vi-VN')} VND`
                        : `${voucher.value}%`}
                    </td>
                    <td className="px-3 py-4">
                      Min {voucher.min_order_value.toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-3 py-4 text-[#7d7065]">
                      {formatDate(voucher.start_date)} - {formatDate(voucher.end_date)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusClasses[voucher.status]}`}
                      >
                        {voucher.status}
                      </span>
                    </td>
                    <td className="rounded-r-2xl px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(voucher)}
                          className="rounded-xl border border-[#eadfd4] p-2 text-[#7d7065]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id)}
                          className="rounded-xl bg-[#1f2022] p-2 text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2022]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(31,32,34,0.18)]">
            <div className="flex items-center justify-between bg-[#d76839] px-6 py-5 text-white">
              <div>
                <h3 className="text-xl font-black">
                  {editingVoucher ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}
                </h3>
                <p className="mt-1 text-sm font-medium text-white/80">
                  Điền thông tin để tạo hoặc cập nhật khuyến mãi mới.
                </p>
              </div>
              <button onClick={closeModal} className="rounded-full p-1 text-white/90">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                  Mã Voucher
                </label>
                <input
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="Để trống để auto-generate"
                  className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none focus:border-[#d76839]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Loại giảm giá
                  </label>
                  <select
                    value={formState.discount_type}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        discount_type: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED">Cố định (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Giá trị giảm
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.value}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        value: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Điều kiện tối thiểu
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.min_order_value}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        min_order_value: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Giới hạn lượt dùng
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formState.usageType === 'LIMITED' ? formState.usageLimit || 0 : 0}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        usageLimit: Number(event.target.value),
                      }))
                    }
                    disabled={formState.usageType === 'UNLIMITED'}
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formState.start_date}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        start_date: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formState.end_date}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        end_date: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Usage Type
                  </label>
                  <select
                    value={formState.usageType}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        usageType: event.target.value as 'UNLIMITED' | 'LIMITED',
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                  >
                    <option value="UNLIMITED">Unlimited</option>
                    <option value="LIMITED">Limited</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                    Trạng thái lưu
                  </label>
                  <select
                    value={formState.isDraft ? 'DRAFT' : 'ACTIVE'}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isDraft: event.target.value === 'DRAFT',
                      }))
                    }
                    className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#aa9c90]">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[#eadfd4] bg-[#f7f3ef] px-4 py-3 text-sm font-semibold outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => editingVoucher && handleDelete(editingVoucher.id)}
                  className="text-sm font-black text-[#7d7065]"
                >
                  {editingVoucher ? 'Xóa' : 'Hủy'}
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl px-4 py-3 text-sm font-black text-[#7d7065]"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#d76839] px-5 py-3 text-sm font-black text-white shadow-[0_16px_28px_rgba(215,104,57,0.22)] disabled:opacity-60"
                  >
                    <Percent size={16} />
                    {editingVoucher ? 'Lưu voucher' : 'Tạo voucher'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VoucherManagementPage;

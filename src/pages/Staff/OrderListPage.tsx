import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, Search, ListFilter, Clock3, ClipboardList } from 'lucide-react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';
import api from '../../api/auth';
import orderApi from '../../api/order';
import {
  mergeRemoteAndLocalStaffOrders,
  readLocalStaffOrders,
} from '../../utils/staffOrderStore';
import type { Order, OrderStatus } from '../../types/order';

type StoredUser = {
  id?: string | number;
};

type StatusFilter = 'ALL' | OrderStatus;

const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'Tat ca' },
  { value: 'PENDING', label: 'Cho xac nhan' },
  { value: 'PROCESSING', label: 'Dang xu ly' },
  { value: 'READY', label: 'San sang phuc vu' },
  { value: 'COMPLETED', label: 'Hoan thanh' },
  { value: 'CANCELLED', label: 'Da huy' },
];

const ORDER_COLLECTION_KEYS = ['data', 'items', 'content', 'results', 'orders'] as const;

const currency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}d`;

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

const parseStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

const looksLikeOrder = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    'id' in candidate ||
    'status' in candidate ||
    'final_amount' in candidate ||
    'total_amount' in candidate
  );
};

const toOrderArray = (value: unknown): Order[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0 || value.every(looksLikeOrder)) {
    return value as Order[];
  }

  return null;
};

const extractOrders = (payload: unknown): Order[] | null => {
  const direct = toOrderArray(payload);
  if (direct) {
    return direct;
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const objectPayload = payload as Record<string, unknown>;

  for (const key of ORDER_COLLECTION_KEYS) {
    const directInKey = toOrderArray(objectPayload[key]);
    if (directInKey) {
      return directInKey;
    }
  }

  for (const key of ORDER_COLLECTION_KEYS) {
    const nested = objectPayload[key];
    if (!nested || typeof nested !== 'object' || Array.isArray(nested)) {
      continue;
    }

    const nestedObject = nested as Record<string, unknown>;
    for (const nestedKey of ORDER_COLLECTION_KEYS) {
      const nestedInKey = toOrderArray(nestedObject[nestedKey]);
      if (nestedInKey) {
        return nestedInKey;
      }
    }
  }

  return null;
};

const describeAttemptError = (label: string, err: unknown) => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 'network';
    return `${label}: ${status}`;
  }

  return `${label}: failed`;
};

const normalizeStatus = (status: string | null | undefined): OrderStatus | 'UNKNOWN' => {
  const normalized = String(status || '').toUpperCase();

  if (normalized === 'IN_PROGRESS') {
    return 'PROCESSING';
  }

  if (normalized === 'PAID') {
    return 'COMPLETED';
  }

  if (
    normalized === 'PENDING' ||
    normalized === 'PROCESSING' ||
    normalized === 'READY' ||
    normalized === 'COMPLETED' ||
    normalized === 'CANCELLED'
  ) {
    return normalized;
  }

  return 'UNKNOWN';
};

const getStatusAppearance = (status: OrderStatus | 'UNKNOWN') => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Cho xac nhan',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      };
    case 'PROCESSING':
      return {
        label: 'Dang xu ly',
        className: 'bg-sky-50 text-sky-700 border border-sky-200',
      };
    case 'READY':
      return {
        label: 'San sang phuc vu',
        className: 'bg-violet-50 text-violet-700 border border-violet-200',
      };
    case 'COMPLETED':
      return {
        label: 'Hoan thanh',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };
    case 'CANCELLED':
      return {
        label: 'Da huy',
        className: 'bg-rose-50 text-rose-700 border border-rose-200',
      };
    default:
      return {
        label: 'Khong xac dinh',
        className: 'bg-zinc-100 text-zinc-700 border border-zinc-200',
      };
  }
};

const getCreatedAtTimestamp = (order: Order) => {
  if (!order.created_at) {
    return 0;
  }

  const timestamp = new Date(order.created_at).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const toNumericId = (id: string | number | bigint) => {
  const direct = Number(id);
  if (Number.isFinite(direct)) {
    return direct;
  }

  const extracted = String(id).match(/\d+/)?.[0];
  const parsed = extracted ? Number(extracted) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTime = (value?: string) => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const OrderListPage: React.FC = () => {
  const user = parseStoredUser();
  const staffId = user?.id ? String(user.id) : '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const fetchOrders = useCallback(async () => {
    if (!staffId) {
      setOrders([]);
      setError('Khong tim thay staff_id trong phien dang nhap.');
      setErrorDetail('missing staff_id');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const attempts: string[] = [];

      const candidates: Array<{ label: string; request: () => Promise<unknown> }> = [
        { label: 'GET /orders', request: async () => orderApi.findAll() },
        {
          label: 'GET /orders?staff_id',
          request: async () => {
            const response = await api.get('/orders', { params: { staff_id: staffId } });
            return response.data;
          },
        },
        {
          label: 'GET /orders/staff/{id}',
          request: async () => {
            const response = await api.get(`/orders/staff/${staffId}`);
            return response.data;
          },
        },
        {
          label: 'GET /orders/my',
          request: async () => {
            const response = await api.get('/orders/my');
            return response.data;
          },
        },
        {
          label: 'GET /orders/staff/me',
          request: async () => {
            const response = await api.get('/orders/staff/me');
            return response.data;
          },
        },
        {
          label: 'GET /orders/history',
          request: async () => {
            const response = await api.get('/orders/history');
            return response.data;
          },
        },
      ];

      let normalizedOrders: Order[] | null = null;

      for (const candidate of candidates) {
        try {
          const payload = await candidate.request();
          normalizedOrders = extractOrders(payload);
          if (normalizedOrders) {
            break;
          }

          attempts.push(`${candidate.label}: unexpected payload`);
        } catch (candidateError) {
          attempts.push(describeAttemptError(candidate.label, candidateError));
        }
      }

      if (!normalizedOrders) {
        throw new Error(
          attempts.length > 0
            ? attempts.join(' | ')
            : 'no usable response from order endpoints',
        );
      }

      const localOrders = readLocalStaffOrders();
      setOrders(mergeRemoteAndLocalStaffOrders(normalizedOrders, localOrders));
      setError(null);
      setErrorDetail(null);
    } catch (err) {
      console.error('Failed to fetch order list for staff:', err);
      const localOrders = readLocalStaffOrders();

      if (localOrders.length > 0) {
        setOrders(localOrders as Order[]);
        setError(null);
        setErrorDetail(null);
      } else {
        setOrders([]);
        setError(null);
        setErrorDetail(null);
      }
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const staffOrders = useMemo(() => {
    if (!staffId) {
      return [];
    }

    const filtered = orders.filter((order) => String(order.staff_id ?? '') === staffId);

    return filtered.sort((left, right) => {
      const timestampDiff = getCreatedAtTimestamp(right) - getCreatedAtTimestamp(left);
      if (timestampDiff !== 0) {
        return timestampDiff;
      }

      return toNumericId(right.id) - toNumericId(left.id);
    });
  }, [orders, staffId]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return staffOrders.filter((order) => {
      const normalizedStatus = normalizeStatus(String(order.status));

      const matchesStatus =
        statusFilter === 'ALL' ? true : normalizedStatus === statusFilter;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        String(order.id).toLowerCase().includes(normalizedQuery) ||
        String(order.table_id ?? '').toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [query, staffOrders, statusFilter]);

  return (
    <div
      className="min-h-screen bg-[#f8f9fa] text-[#191c1d]"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <StaffTopBar />
      <StaffSidebarNew />

      <main className="px-6 pb-12 pt-24 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#191c1d]">
                Danh sach don cua toi
              </h1>
              <p className="text-sm font-medium text-[#59413a]">
                Theo doi tien do don theo ca lam viec, mau trang thai dong bo theo backend.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr]">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#59413a]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tim theo ma don hoac ma ban..."
                  className="w-full rounded-xl border border-[#e7e8e9] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#191c1d] outline-none transition-all placeholder:text-[#59413a] focus:border-[#ac3509]/40 focus:ring-2 focus:ring-[#ac3509]/10"
                />
              </label>

              <label className="relative block">
                <ListFilter
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#59413a]"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="w-full appearance-none rounded-xl border border-[#e7e8e9] bg-white py-3 pl-11 pr-4 text-sm font-semibold text-[#191c1d] outline-none transition-all focus:border-[#ac3509]/40 focus:ring-2 focus:ring-[#ac3509]/10"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </header>

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#edeeef] bg-white">
              <Loader2 size={30} className="animate-spin text-[#ac3509]" />
              <p className="text-sm font-semibold text-[#59413a]">Dang tai danh sach don...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-bold text-red-700">{error}</p>
              {errorDetail ? (
                <p className="max-w-3xl text-xs font-medium text-red-500">{errorDetail}</p>
              ) : null}
              <button
                onClick={fetchOrders}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold uppercase text-red-700 transition-colors hover:bg-red-100"
              >
                Tai lai du lieu
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e0bfb6] bg-white p-8 text-center">
              <ClipboardList size={28} className="text-[#ac3509]" />
              <p className="text-base font-bold text-[#191c1d]">Khong co don phu hop bo loc hien tai</p>
              <p className="text-sm text-[#59413a]">Thu doi trang thai loc hoac tu khoa tim kiem.</p>
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-[#edeeef] bg-white">
              <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr] gap-4 border-b border-[#edeeef] bg-[#f8f9fa] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#59413a]">
                <span>Ma don / Ban</span>
                <span>Tong tien</span>
                <span>Trang thai</span>
                <span>Thoi gian</span>
              </div>

              <div className="divide-y divide-[#f1f2f3]">
                {filteredOrders.map((order) => {
                  const normalizedStatus = normalizeStatus(String(order.status));
                  const status = getStatusAppearance(normalizedStatus);
                  const amount = toNumber(order.final_amount || order.total_amount);

                  return (
                    <article
                      key={String(order.id)}
                      className="grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1.1fr_1fr_1fr_1fr] md:items-center"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#191c1d]">#{String(order.id)}</span>
                        <span className="text-xs font-medium text-[#59413a]">
                          Ban: {order.table_id ? String(order.table_id) : '--'}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-[#ac3509]">{currency(amount)}</div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#59413a]">
                        <Clock3 size={14} />
                        <span>{formatTime(order.created_at)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderListPage;

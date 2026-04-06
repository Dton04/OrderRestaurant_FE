import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  StickyNote,
  ChefHat,
  CreditCard,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';
import { dishApi } from '../../api/dish';
import { categoryApi } from '../../api/category';
import orderApi from '../../api/order';
import type { Dish } from '../../types/dish';
import type { Category } from '../../types/category';
import type { BillingDraft, BillingDraftItem } from '../../types/billing';
import type { CreateOrderDto } from '../../types/order';

type OrderItem = BillingDraftItem;

type StoredUser = {
  id?: string | number;
};

const categoryTabLabels = ['Khai vị', 'Món chính', 'Đồ uống'] as const;
const orderAccentPalette = ['#ac3509', '#006972', '#ff7043'];
const BILLING_DRAFT_KEY = 'staff.billingDraft';
const ORDER_ID_STORAGE_KEY = 'staff.currentOrderId';
const ACTIVE_ORDER_TABLE_KEY = 'staff.activeOrderTable';

type SelectedTableInfo = {
  id?: string | number;
  table_number?: string;
  guests?: number;
  capacity?: number;
  status?: string;
};

const currency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(value)}đ`;

const createDraftOrderCode = () => {
  const seed = `${Date.now()}`.slice(-6);
  return `#NEW-${seed}`;
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

const ActiveOrdersPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [draftOrderCode] = useState(createDraftOrderCode);
  const [orderId, setOrderId] = useState<string | null>(
    localStorage.getItem(ORDER_ID_STORAGE_KEY),
  );
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [selectedTable, setSelectedTable] = useState<SelectedTableInfo | null>(null);

  useEffect(() => {
    const fromState = (location.state as { selectedTable?: SelectedTableInfo } | null)
      ?.selectedTable;

    if (fromState) {
      setSelectedTable(fromState);
      localStorage.setItem(ACTIVE_ORDER_TABLE_KEY, JSON.stringify(fromState));
      return;
    }

    const stored = localStorage.getItem(ACTIVE_ORDER_TABLE_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SelectedTableInfo;
      setSelectedTable(parsed);
    } catch {
      setSelectedTable(null);
    }
  }, [location.state]);

  // Load existing order if table is OCCUPIED
  useEffect(() => {
    const loadExistingOrder = async () => {
      if (!selectedTable?.id || selectedTable.status !== 'OCCUPIED') {
        return;
      }
      
      // If we already have an orderId for this session/table, maybe we don't need to fetch
      // But fetching ensures we have the latest from DB if another staff updated it
      try {
        const response = await orderApi.findActiveOrderByTableId(selectedTable.id);
        if (response.data) {
          const order = response.data;
          setOrderId(String(order.id));
          localStorage.setItem(ORDER_ID_STORAGE_KEY, String(order.id));
          
          // Map backend order_items to frontend OrderItem (BillingDraftItem)
          const mappedItems: OrderItem[] = order.order_items.map((oi: any, index: number) => ({
            id: Number(oi.dish.id),
            name: oi.dish.name,
            quantity: oi.quantity,
            unitPrice: Number(oi.price_at_order),
            note: oi.notes || '',
            accent: orderAccentPalette[index % orderAccentPalette.length],
          }));
          
          setOrderItems(mappedItems);
        }
      } catch (err) {
        console.error('Failed to load existing order items:', err);
      }
    };

    loadExistingOrder();
  }, [selectedTable]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [categoryData, dishData] = await Promise.all([
          categoryApi.findAll(),
          dishApi.findAll(),
        ]);

        setCategories(categoryData);
        setDishes(dishData.filter((dish) => dish.is_available !== false));
        setActiveCategoryId((current) => current ?? categoryData[0]?.id ?? null);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch active order menu data:', err);
        setError('Không thể tải món ăn từ hệ thống. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const filteredMenu = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return dishes.filter((item) => {
      const matchesCategory =
        activeCategoryId === null || item.category_id === activeCategoryId;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.description || '').toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategoryId, dishes, query]);

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const vat = Math.round(subtotal * 0.08);
  const total = subtotal + vat;
  const discountAmount = 0;

  useEffect(() => {
    const draft: BillingDraft = {
      code: draftOrderCode,
      orderId,
      items: orderItems,
      totalAmount: subtotal,
      discountAmount,
      finalAmount: total,
      vat,
    };

    localStorage.setItem(BILLING_DRAFT_KEY, JSON.stringify(draft));
  }, [discountAmount, draftOrderCode, orderId, orderItems, subtotal, total, vat]);

  const invalidateExistingOrder = () => {
    setOrderId(null);
    localStorage.removeItem(ORDER_ID_STORAGE_KEY);
  };

  const addToOrder = (item: Dish) => {
    invalidateExistingOrder();
    setFeedback(null);
    setOrderItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);

      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          note: '',
          accent: orderAccentPalette[current.length % orderAccentPalette.length],
        },
      ];
    });
  };

  const updateNote = (id: number, note: string) => {
    invalidateExistingOrder();
    setFeedback(null);
    setOrderItems((current) =>
      current.map((item) => (item.id === id ? { ...item, note } : item)),
    );
  };

  const removeItem = (id: number) => {
    invalidateExistingOrder();
    setFeedback(null);
    setOrderItems((current) => current.filter((item) => item.id !== id));
  };

  const createOrderIfNeeded = async () => {
    if (orderItems.length === 0) {
      return null;
    }

    if (orderId) {
      return orderId;
    }

    const user = parseStoredUser();
    const payload: CreateOrderDto = {
      staff_id: user?.id,
      table_id: selectedTable?.id,
      total_amount: subtotal,
      discount_amount: discountAmount,
      final_amount: total,
      status: 'PENDING',
      items: orderItems.map((item) => ({
        dish_id: item.id,
        quantity: item.quantity,
        price_at_order: item.unitPrice,
      })),
    };

    const order = await orderApi.create(payload);
    const createdOrderId = String(order.id);
    const createdFinalAmount = toNumber(order.final_amount);
    const createdSubtotal = toNumber(order.total_amount);
    const createdDiscount = toNumber(order.discount_amount);

    setOrderId(createdOrderId);
    localStorage.setItem(ORDER_ID_STORAGE_KEY, createdOrderId);
    localStorage.setItem(
      BILLING_DRAFT_KEY,
      JSON.stringify({
        code: draftOrderCode,
        orderId: createdOrderId,
        items: orderItems,
        totalAmount: createdSubtotal || subtotal,
        discountAmount: createdDiscount || discountAmount,
        finalAmount: createdFinalAmount || total,
        vat,
      } satisfies BillingDraft),
    );

    return createdOrderId;
  };

  const handleGoToBilling = async () => {
    try {
      setSubmittingOrder(true);
      setError(null);
      setFeedback(null);
      await createOrderIfNeeded();
      navigate('/staff/billing');
    } catch (err) {
      console.error('Failed to create order before payment:', err);
      setError('Không thể tạo order từ backend. Vui lòng kiểm tra API /orders.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSendToKitchen = async () => {
    try {
      setSubmittingOrder(true);
      setError(null);
      setFeedback(null);

      const currentOrderId = await createOrderIfNeeded();
      if (!currentOrderId) {
        return;
      }

      await orderApi.update(currentOrderId, { status: 'PREPARING' });
      setFeedbackType('success');
      setFeedback(`Đã gửi bếp thành công cho đơn ${draftOrderCode}.`);
    } catch (err) {
      console.error('Failed to send order to kitchen:', err);
      setFeedbackType('error');
      setFeedback('Không thể gửi bếp. Vui lòng kiểm tra lại API /orders.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden bg-[#f8f9fa] text-[#191c1d]"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      <StaffTopBar />
      <StaffSidebarNew />
      <main className="flex min-h-screen flex-col bg-[#f8f9fa] pt-20 lg:pl-64 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-6 px-6 py-8 lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="m-0 text-4xl font-extrabold tracking-tight text-[#191c1d]">
                  Tiếp nhận đơn hàng
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {selectedTable ? (
                    <span className="rounded-full bg-[#ac3509]/10 px-3 py-1 text-xs font-bold text-[#ac3509]">
                      Ban {selectedTable.table_number || selectedTable.id}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#00acbb]/10 px-3 py-1 text-xs font-bold text-[#006972]">
                    Đơn mới
                  </span>
                  <span className="text-sm font-medium text-[#59413a]">
                    Chọn món từ danh sách để tạo chi tiết đơn.
                  </span>
                </div>
              </div>
              <div className="flex w-full rounded-xl bg-[#e7e8e9] p-1 xl:w-auto">
                {categories.map((category, index) => {
                  const active = category.id === activeCategoryId;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategoryId(category.id)}
                      className={`flex-1 rounded-lg px-5 py-2 text-sm font-bold transition-all xl:flex-none ${
                        active
                          ? 'bg-white text-[#ac3509] shadow-sm'
                          : 'text-[#59413a] hover:text-[#191c1d]'
                      }`}
                    >
                      {categoryTabLabels[index] ?? category.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="relative block">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#59413a]"
              />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm món ăn hoặc mã món..."
                className="w-full rounded-xl border-none bg-[#e7e8e9] py-4 pl-12 pr-4 font-medium text-[#191c1d] outline-none ring-0 transition-all placeholder:text-[#59413a] focus:ring-2 focus:ring-[#ac3509]/20"
              />
            </label>
          </header>

          <section className="custom-scrollbar flex-1 overflow-y-auto px-6 pb-8 lg:px-8">
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-[#59413a]">
                <Loader2 size={30} className="animate-spin text-[#ac3509]" />
                <p className="text-sm font-semibold">Đang tải món ăn...</p>
              </div>
            ) : error ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
                <p className="font-semibold text-red-600">{error}</p>
                <p className="mt-2 text-sm text-red-500">
                  Kiểm tra kết nối API, đăng nhập staff và endpoint /orders.
                </p>
              </div>
            ) : filteredMenu.length === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0bfb6] bg-white p-8 text-center">
                <p className="font-semibold text-[#191c1d]">
                  Không có món ăn trong danh mục này
                </p>
                <p className="mt-2 text-sm text-[#59413a]">
                  Thử đổi danh mục hoặc từ khóa tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
                {filteredMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToOrder(item)}
                    className="group flex cursor-pointer gap-4 rounded-2xl border border-transparent bg-white p-4 text-left transition-all hover:border-[#e0bfb6]/50"
                  >
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#f3f4f5]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#8d7169]">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                      <div>
                        <h3 className="text-lg font-bold leading-tight text-[#191c1d]">
                          {item.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[#59413a]">
                          {item.description || 'Món ăn hiện chưa có mô tả.'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold text-[#ac3509]">
                          {currency(item.price)}
                        </span>
                        <span className="rounded-lg bg-[#ffdbd0] p-2 text-[#ac3509]">
                          <Plus size={18} />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full flex-col bg-white shadow-2xl lg:w-[420px]">
          <div className="border-b border-[#edeeef] p-6">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-2xl font-black tracking-tight text-[#191c1d]">
                Chi tiết đơn
              </h2>
              <span className="text-sm font-medium text-[#59413a]/60">
                {draftOrderCode}
              </span>
            </div>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
            {orderItems.length === 0 ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e0bfb6] bg-[#f8f9fa] px-6 text-center">
                <p className="text-base font-semibold text-[#191c1d]">
                  Chưa có món nào trong đơn
                </p>
                <p className="mt-2 text-sm text-[#59413a]">
                  Nhấn vào món ăn bên trái để thêm vào chi tiết đơn.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-2 pl-4"
                    style={{ borderLeft: `4px solid ${item.accent}` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-[#191c1d]">{item.name}</h4>
                        <span className="font-bold text-[#191c1d]">
                          {currency(item.quantity * item.unitPrice)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#59413a]">
                        SL: {item.quantity} x {currency(item.unitPrice)}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <StickyNote size={16} className="text-[#59413a]" />
                        <input
                          type="text"
                          value={item.note}
                          onChange={(event) =>
                            updateNote(item.id, event.target.value)
                          }
                          placeholder="Thêm ghi chú..."
                          className="w-full rounded-md border-none bg-[#f3f4f5] px-2 py-1 text-xs italic text-[#191c1d] outline-none focus:ring-1 focus:ring-[#ac3509]/30"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#ba1a1a]/50 transition-colors hover:text-[#ba1a1a]"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6 bg-[#f3f4f5]/70 p-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-[#59413a]">
                <span>Tạm tính</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#59413a]">
                <span>VAT (8%)</span>
                <span>{currency(vat)}</span>
              </div>
              <div className="flex justify-between pt-2 text-2xl font-black text-[#191c1d]">
                <span>Tổng cộng</span>
                <span className="text-[#ac3509]">{currency(total)}</span>
              </div>
            </div>

            {feedback ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  feedbackType === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {feedback}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                disabled={orderItems.length === 0 || submittingOrder}
                onClick={handleSendToKitchen}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#ac3509] py-4 text-sm font-bold uppercase tracking-wider text-[#ac3509] transition-all hover:bg-[#ac3509]/5 active:scale-95 disabled:cursor-not-allowed disabled:border-[#d8a798] disabled:text-[#d8a798] disabled:hover:bg-transparent"
              >
                <ChefHat size={18} />
                {submittingOrder ? 'Đang gửi...' : 'Gửi bếp'}
              </button>
              <button
                disabled={orderItems.length === 0 || submittingOrder}
                onClick={handleGoToBilling}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ac3509] to-[#ff7043] py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:shadow-orange-200 active:scale-95 disabled:cursor-not-allowed disabled:from-[#d8a798] disabled:to-[#e7b7a8] disabled:shadow-none"
              >
                <CreditCard size={18} />
                {submittingOrder ? 'Đang tạo order...' : 'Thanh toán'}
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ActiveOrdersPage;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Ban,
  Check,
  ChefHat,
  CircleAlert,
  Clock3,
  ClipboardList,
  PlusCircle,
  Printer,
  User,
} from 'lucide-react';
import orderApi from '../../api/order';
import type { KitchenQueueItem } from '../../api/order';
import heroImage from '../../assets/hero.png';

type KitchenOrder = {
  key: string;
  orderId?: string | number;
  tableNumber: string;
  createdAt: string;
  items: KitchenQueueItem[];
};

const toNumber = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatMoney = (value: string | number | undefined) => {
  const amount = toNumber(value);
  return new Intl.NumberFormat('vi-VN').format(amount);
};

const isPreparing = (status: string) =>
  status === 'PREPARING' || status === 'PROCESSING';

const isCompleted = (status: string) =>
  status === 'READY' || status === 'COMPLETED';

const groupOrders = (queue: KitchenQueueItem[]) => {
  const grouped = new Map<string, KitchenOrder>();

  queue.forEach((item) => {
    const key = item.order_id != null ? String(item.order_id) : `table-${item.table_number}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        key,
        orderId: item.order_id,
        tableNumber: item.table_number,
        createdAt: item.created_at,
        items: [item],
      });
      return;
    }

    existing.items = [...existing.items, item];
  });

  return Array.from(grouped.values()).sort((a, b) => {
    const t1 = new Date(a.createdAt).getTime();
    const t2 = new Date(b.createdAt).getTime();
    return t2 - t1;
  });
};

const PreparationNotesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const reloadQueue = useCallback(async () => {
    setError('');
    const queue = await orderApi.getKitchenQueue();
    setOrders(groupOrders(queue));
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        await reloadQueue();
      } catch (loadError) {
        console.error('Cannot load kitchen queue:', loadError);
        setError('Khong the tai du lieu bep luc nay. Vui long thu lai.');
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [reloadQueue]);

  const selectedOrderKey = searchParams.get('orderId');

  const selectedOrder = useMemo(() => {
    if (!orders.length) {
      return null;
    }

    if (!selectedOrderKey) {
      return orders[0];
    }

    return orders.find((order) => order.key === selectedOrderKey) ?? orders[0];
  }, [orders, selectedOrderKey]);

  useEffect(() => {
    if (!orders.length || selectedOrderKey) {
      return;
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('orderId', orders[0].key);
      return next;
    });
  }, [orders, selectedOrderKey, setSearchParams]);

  const orderAgeMinutes = useMemo(() => {
    if (!selectedOrder) {
      return 0;
    }

    const created = new Date(selectedOrder.createdAt).getTime();
    if (!Number.isFinite(created)) {
      return 0;
    }

    return Math.max(0, Math.floor((Date.now() - created) / 60000));
  }, [selectedOrder]);

  const dishName = selectedOrder?.items[0]?.dish_name || 'Mon an';
  const dishQuantity = selectedOrder
    ? selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;
  const totalAmount = selectedOrder
    ? selectedOrder.items.reduce(
        (sum, item) =>
          sum + (item.line_total != null ? toNumber(item.line_total) : toNumber(item.price_at_order) * item.quantity),
        0,
      )
    : 0;

  const warningText =
    orderAgeMinutes > 15 ? `Vuot qua ${orderAgeMinutes}p` : 'Trong muc an toan';

  const notes = useMemo(() => {
    if (!selectedOrder) {
      return [];
    }

    return selectedOrder.items
      .map((item) => item.notes?.trim())
      .filter((note): note is string => Boolean(note))
      .slice(0, 3);
  }, [selectedOrder]);

  const timelineStep = useMemo(() => {
    if (!selectedOrder) {
      return 1;
    }

    const statuses = selectedOrder.items.map((item) => item.status);
    const hasPreparing = statuses.some(isPreparing);
    const hasCompleted = statuses.some(isCompleted);
    const allCompleted = statuses.length > 0 && statuses.every(isCompleted);

    if (allCompleted) {
      return 4;
    }
    if (hasPreparing) {
      return 3;
    }
    if (hasCompleted) {
      return 2;
    }
    return 1;
  }, [selectedOrder]);

  const progressWidth = timelineStep === 1 ? '0%' : timelineStep === 2 ? '34%' : timelineStep === 3 ? '66%' : '100%';

  const processAction = useCallback(
    async (mode: 'start' | 'finish') => {
      if (!selectedOrder) {
        return;
      }

      const targets = selectedOrder.items.filter((item) =>
        mode === 'start' ? item.status === 'PENDING' : isPreparing(item.status),
      );

      if (!targets.length) {
        setActionMessage(
          mode === 'start'
            ? 'Khong con mon nao dang cho de bat dau.'
            : 'Khong co mon dang nau de hoan thanh.',
        );
        return;
      }

      try {
        setIsSaving(true);
        setError('');

        await Promise.all(
          targets.map((item) =>
            mode === 'start'
              ? orderApi.startCookingItem(item.item_id)
              : orderApi.finishCookingItem(item.item_id),
          ),
        );

        setActionMessage(
          mode === 'start'
            ? 'Da chuyen mon sang trang thai dang nau.'
            : 'Da danh dau mon la hoan thanh.',
        );
        await reloadQueue();
      } catch (actionError) {
        console.error('Kitchen action failed:', actionError);
        setError('Cap nhat trang thai that bai. Vui long thu lai.');
      } finally {
        setIsSaving(false);
      }
    },
    [reloadQueue, selectedOrder],
  );

  return (
    <div className="min-h-full bg-[#f8f9fa]">
      <header className="flex items-center justify-between border-b border-[#e7e5e4] bg-[#fafaf9cc] px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            to="/chef/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#78716c] transition hover:bg-white hover:text-[#ac3509]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9a3412]">
              Chi tiet don hang
            </p>
            <h1 className="text-xl font-extrabold text-[#1c1917]">
              Mon #{selectedOrder?.orderId ?? selectedOrder?.key ?? '----'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#78716c] transition hover:bg-white hover:text-[#ac3509]">
            <Bell size={17} />
          </button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#78716c] transition hover:bg-white hover:text-[#ac3509]">
            <User size={17} />
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#78716c]">
            Don dang xem
          </label>
          <select
            value={selectedOrder?.key ?? ''}
            onChange={(event) =>
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('orderId', event.target.value);
                return next;
              })
            }
            className="min-w-56 rounded-xl border border-[#d6d3d1] bg-white px-3 py-2 text-sm font-semibold text-[#1c1917] outline-none transition focus:border-[#ff7043]"
          >
            {orders.map((order) => (
              <option key={order.key} value={order.key}>
                #{order.orderId ?? order.key} - Ban {order.tableNumber}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#d6d3d1] bg-white px-5 py-16 text-center text-[#78716c]">
            Dang tai du lieu...
          </div>
        ) : !selectedOrder ? (
          <div className="rounded-2xl border border-dashed border-[#d6d3d1] bg-white px-5 py-16 text-center text-[#78716c]">
            Chua co don nao trong hang doi bep.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <article className="overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm">
                <div className="relative h-64">
                  <img src={heroImage} alt={dishName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <h2 className="text-[42px] font-black leading-none tracking-tight text-white">{dishName}</h2>
                      <p className="mt-2 text-sm font-medium text-white/85">
                        Ban so {selectedOrder.tableNumber} - Tang 1
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#ff7043] px-5 py-2 text-3xl font-black text-[#641800]">
                      x{dishQuantity}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 px-6 py-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#59413a]">Thoi gian dat</p>
                    <p className="mt-2 flex items-center gap-2 text-base font-semibold text-[#191c1d]">
                      <Clock3 size={16} className="text-[#a8a29e]" />
                      {orderAgeMinutes} phut truoc
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#59413a]">Canh bao</p>
                    <p className="mt-2 flex items-center gap-2 text-base font-extrabold text-[#ba1a1a]">
                      <CircleAlert size={16} />
                      {warningText}
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl bg-[#f3f4f5] p-6">
                <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#59413a]">Tien do che bien</h3>
                <div className="relative mt-6">
                  <div className="absolute left-0 right-0 top-4 h-[2px] bg-[#e7e5e4]" />
                  <div
                    className="absolute left-0 top-4 h-[2px] bg-[#ac3509] transition-all"
                    style={{ width: progressWidth }}
                  />

                  <div className="relative grid grid-cols-4 gap-3">
                    {[
                      { label: 'Len menu', done: timelineStep >= 1 },
                      { label: 'Bat dau', done: timelineStep >= 2 },
                      { label: 'Dang nau', done: timelineStep >= 3, current: timelineStep === 3 },
                      { label: 'Hoan thanh', done: timelineStep >= 4 },
                    ].map((step, index) => (
                      <div key={step.label} className="flex flex-col items-center gap-2">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border-4 text-xs font-extrabold ${
                            step.current
                              ? 'border-[#ff7043] bg-white text-[#ac3509]'
                              : step.done
                                ? 'border-[#ac3509] bg-[#ac3509] text-white'
                                : 'border-[#e7e5e4] bg-[#e7e5e4] text-[#a8a29e]'
                          }`}
                        >
                          {step.done ? <Check size={16} /> : index + 1}
                        </div>
                        <p
                          className={`text-xs font-bold ${
                            step.done || step.current ? 'text-[#1c1917]' : 'text-[#a8a29e]'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl bg-[#e7e8e980] p-6">
                <div className="mb-4 flex items-center gap-2 text-[#ac3509]">
                  <ClipboardList size={18} />
                  <h3 className="text-2xl font-extrabold">Ghi chu dac biet</h3>
                </div>

                <div className="space-y-3">
                  {notes.length ? (
                    notes.map((note, idx) => {
                      const isNegative =
                        note.toLowerCase().includes('khong') ||
                        note.toLowerCase().includes('bo') ||
                        note.toLowerCase().includes('no ');
                      return (
                        <div
                          key={`${note}-${idx}`}
                          className={`flex items-center gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-sm ${
                            isNegative ? 'border-[#ac3509]' : 'border-[#0b7a82]'
                          }`}
                        >
                          {isNegative ? (
                            <Ban size={18} className="text-[#ba1a1a]" />
                          ) : (
                            <PlusCircle size={18} className="text-[#0b7a82]" />
                          )}
                          <p className="text-lg font-bold text-[#191c1d]">{note}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-dashed border-[#d6d3d1] bg-[#f3f4f580] px-4 py-4 text-center text-xs italic text-[#a8a29e]">
                      Khong co ghi chu dac biet.
                    </div>
                  )}
                </div>
              </section>

              <div className="space-y-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void processAction('start')}
                  className="flex h-24 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ac3509] to-[#ff7043] text-3xl font-black uppercase tracking-wide text-white shadow-[0_10px_20px_-6px_rgba(124,45,18,0.38)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ChefHat size={25} />
                  Tiep tuc nau
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void processAction('finish')}
                  className="flex h-24 w-full items-center justify-center gap-3 rounded-2xl bg-[#1c1917] text-3xl font-black uppercase tracking-wide text-white shadow-[0_10px_20px_-6px_rgba(0,0,0,0.3)] transition hover:bg-[#302b28] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Check size={25} />
                  Hoan thanh
                </button>

                <Link
                  to="/chef/dashboard"
                  className="flex h-14 items-center justify-center gap-2 text-base font-bold text-[#78716c] transition hover:text-[#1c1917]"
                >
                  <ArrowLeft size={16} />
                  Quay lai danh sach don
                </Link>
              </div>

              <section className="rounded-xl border border-[#ececec] bg-white px-5 py-4">
                <div className="flex items-center justify-between text-sm text-[#78716c]">
                  <span>Tong tam tinh</span>
                  <span className="font-bold">{formatMoney(totalAmount)}d</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-[#78716c]">
                  <span>VAT (8%)</span>
                  <span className="font-bold">{formatMoney(totalAmount * 0.08)}d</span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-[#ececec] pt-4">
                  <span className="text-4xl font-black text-[#1c1917]">Tong cong</span>
                  <span className="text-5xl font-black text-[#ac3509]">{formatMoney(totalAmount * 1.08)}d</span>
                </div>
              </section>
            </aside>
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}
        {actionMessage ? (
          <div className="mt-4 rounded-xl border border-[#ffd6c7] bg-[#fff3ef] px-4 py-3 text-sm font-semibold text-[#9a3412]">
            {actionMessage}
          </div>
        ) : null}

        <div className="fixed bottom-10 right-8 flex flex-col gap-3">
          <button className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white text-[#57534e] shadow-xl transition hover:-translate-y-0.5">
            <Printer size={20} />
          </button>
          <button className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#ba1a1a] text-white shadow-xl transition hover:-translate-y-0.5">
            <CircleAlert size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreparationNotesPage;

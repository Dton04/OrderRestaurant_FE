import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tableApi from '../../api/table';
import orderApi from '../../api/order';

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

type StaffTable = {
  id: string | number;
  table_number?: string;
  capacity?: number;
  status?: TableStatus | string;
  area_id?: number;
  guests?: number;
  guestsField?: 'guests' | 'guest_count' | 'current_guest' | 'current_guests' | 'number_of_guests';
};

const TABLE_GUESTS_STORAGE_KEY = 'staff.tableGuests';
const ACTIVE_ORDER_TABLE_KEY = 'staff.activeOrderTable';

const saveGuestOverride = (tableId: string | number, value: number) => {
  const raw = localStorage.getItem(TABLE_GUESTS_STORAGE_KEY);
  const current = raw ? (JSON.parse(raw) as Record<string, number>) : {};
  current[String(tableId)] = value;
  localStorage.setItem(TABLE_GUESTS_STORAGE_KEY, JSON.stringify(current));
};

const extractApiMessage = (error: unknown) => {
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

const TableDetails: React.FC<{
  table: StaffTable | null;
  onGuestSaved?: (tableId: string | number, guests: number) => void;
}> = ({ table, onGuestSaved }) => {
  const navigate = useNavigate();
  const [guestCount, setGuestCount] = useState(() =>
    table && typeof table.guests === 'number' ? table.guests : 0,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(false);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      if (!table || table.status !== 'OCCUPIED') {
        setActiveOrder(null);
        return;
      }
      try {
        setLoadingActiveOrder(true);
        const response = await orderApi.findActiveOrderByTableId(table.id);
        setActiveOrder(response.data || null);
      } catch (err) {
        console.error('Failed to fetch active order for table:', err);
      } finally {
        setLoadingActiveOrder(false);
      }
    };
    fetchActiveOrder();
  }, [table]);

  const incrementGuest = () => {
    if (!table) return;
    const cap = typeof table.capacity === 'number' ? table.capacity : Infinity;
    setGuestCount((prev) => Math.min(prev + 1, cap));
  };

  const decrementGuest = () => {
    setGuestCount((prev) => Math.max(prev - 1, 0));
  };

  const persistGuests = async (value: number) => {
    if (!table) {
      return;
    }

    const tableId = Number(table.id);
    if (!Number.isFinite(tableId)) {
      setMessageType('error');
      setMessage('Không xác định được mã bàn để lưu dữ liệu.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      saveGuestOverride(table.id, value);
      onGuestSaved?.(table.id, value);

      if (table.guestsField) {
        const latest = await tableApi.findOne(tableId);
        const basePayload: Record<string, unknown> = {
          table_number: latest.table_number || table.table_number || String(table.id),
          capacity:
            typeof latest.capacity === 'number'
              ? latest.capacity
              : (typeof table.capacity === 'number' ? table.capacity : 4),
          status: latest.status || table.status || 'FREE',
          area_id:
            typeof latest.area_id === 'number'
              ? latest.area_id
              : (typeof table.area_id === 'number' ? table.area_id : 1),
        };
        basePayload[table.guestsField] = value;
        await tableApi.update(tableId, basePayload);
        setMessageType('success');
        setMessage('Đã lưu số người thành công.');
      } else {
        setMessageType('success');
        setMessage('Đã lưu số người cục bộ (backend chưa hỗ trợ trường guests).');
      }
    } catch (error) {
      console.error('Failed to persist table guests:', error);
      setMessageType('error');
      const apiMessage = extractApiMessage(error);
      setMessage(
        apiMessage
          ? `Không lưu được số người: ${apiMessage}`
          : 'Không lưu được số người. Vui lòng thử lại.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TableStatus) => {
    if (!table) return;
    const tableId = Number(table.id);
    try {
      setSaving(true);
      setMessage(null);
      await tableApi.updateStatus(tableId, newStatus);
      setMessageType('success');
      setMessage(`Đã chuyển trạng thái sang ${newStatus}.`);
      // Local state update if onGuestSaved is used to refresh parent
      // But parent should listen to socket too.
    } catch (error: any) {
      console.error('Failed to update table status:', error);
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setSaving(false);
    }
  };

  if (!table) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-md min-h-[350px] flex flex-col items-center justify-center">
        <div className="text-gray-400 font-bold text-lg">Chưa chọn bàn</div>
        <div className="text-xs text-gray-400">Vui lòng chọn một bàn để quản lý số người.</div>
      </div>
    );
  }

  const capacity = typeof table.capacity === 'number' ? table.capacity : 0;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md min-h-[350px]">
      <div className="mb-4">
        <div className="font-extrabold text-xl">Bàn {table.table_number || table.id}</div>
        <div className="text-xs mt-1">Trạng thái: <span className="font-bold">{table.status || 'N/A'}</span></div>
      </div>

      <div className="mb-5">
        <div className="font-bold text-sm mb-2">Số người hiện tại</div>
        <div className="flex items-center gap-4">
          <button onClick={decrementGuest} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xl font-bold">−</button>
          <div className="text-4xl font-bold">{guestCount}</div>
          <button onClick={incrementGuest} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xl font-bold">+</button>
        </div>
        <div className="mt-2 text-xs text-zinc-500">Sức chứa: {capacity} người</div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            void persistGuests(guestCount);
          }}
          disabled={saving}
          className="flex-1 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : 'Lưu số người'}
        </button>
        <button
          onClick={() => {
            setGuestCount(0);
            void persistGuests(0);
          }}
          disabled={saving}
          className="flex-1 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Xóa số người
        </button>
      </div>

      {message ? (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            messageType === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        onClick={() => {
          const selectedTablePayload = {
            id: table.id,
            table_number: table.table_number,
            guests: guestCount,
            capacity: table.capacity,
            status: table.status,
          };
          localStorage.setItem(ACTIVE_ORDER_TABLE_KEY, JSON.stringify(selectedTablePayload));
          navigate('/staff/active-orders', {
            state: {
              selectedTable: selectedTablePayload,
            },
          });
        }}
        className="mt-3 w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 mb-3"
      >
        Lên đơn
      </button>

      {table.status === 'OCCUPIED' && activeOrder && (
        <button
          onClick={() => {
            const orderId = String(activeOrder.id);
            localStorage.setItem('staff.currentOrderId', orderId);

            // Set the active order table so BillingPage knows which table we are dealing with
            const tableInfo = {
              id: table.id,
              table_number: table.table_number
            };
            localStorage.setItem('staff.activeOrderTable', JSON.stringify(tableInfo));

            // Also prepare a draft just in case something relies on it
            const draft = {
              code: `#ORDER-${orderId}`,
              orderId: orderId,
              items: activeOrder.order_items?.map((oi: any) => ({
                id: oi.dish.id,
                name: oi.dish.name,
                quantity: oi.quantity,
                unitPrice: Number(oi.price_at_order),
                note: oi.notes,
              })) || [],
              totalAmount: Number(activeOrder.total_amount),
              discountAmount: Number(activeOrder.discount_amount),
              finalAmount: Number(activeOrder.final_amount),
              vat: Math.round(Number(activeOrder.total_amount) * 0.08),
            };
            localStorage.setItem('staff.billingDraft', JSON.stringify(draft));
            
            navigate('/staff/billing');
          }}
          className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-bold text-white hover:bg-emerald-700 mb-3 flex items-center justify-center gap-2"
        >
          Thanh toán bàn này
        </button>
      )}

      {table.status === 'OCCUPIED' && !activeOrder && loadingActiveOrder && (
        <div className="text-center text-xs text-zinc-500 mb-3 italic">
          Đang kiểm tra đơn hàng...
        </div>
      )}

      <div className="border-t border-zinc-100 pt-4 mt-2">
        <div className="font-bold text-sm mb-3 text-zinc-600">Cập nhật nhanh trạng thái</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleUpdateStatus('FREE')}
            disabled={saving || table.status === 'FREE'}
            className="py-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50 transition-all"
          >
            Giải phóng (FREE)
          </button>
          <button
            onClick={() => handleUpdateStatus('CLEANING')}
            disabled={saving || table.status === 'CLEANING'}
            className="py-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 disabled:opacity-50 transition-all"
          >
            Đang dọn (CLEAN)
          </button>
          <button
            onClick={() => handleUpdateStatus('RESERVED')}
            disabled={saving || table.status === 'RESERVED'}
            className="py-2.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50 transition-all col-span-2"
          >
            Đặt trước (RESERVE)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableDetails;


import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Bell, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import orderApi from '../../api/order';
import type { KitchenQueueItem } from '../../api/order';

type QueueOrderItem = {
  item_id: string | number;
  dish_name: string;
  quantity: number;
  notes?: string | null;
  status: string;
};

type QueueOrder = {
  order_key: string;
  order_id?: string | number;
  table_number: string;
  created_at: string;
  order_final_amount?: string | number;
  items: QueueOrderItem[];
};

const ChefDashboardPage: React.FC = () => {
  const [queueItems, setQueueItems] = useState<KitchenQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [stats, setStats] = useState({ waiting: 0, cooking: 0, completed: 0 });

  const reloadQueue = useCallback(async () => {
    const items = await orderApi.getKitchenQueue();
    setQueueItems(items);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        await reloadQueue();
      } catch (error) {
        console.error('Lỗi khi lấy hàng đợi bếp:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, [reloadQueue]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void reloadQueue();
    }, 3000);
    return () => window.clearInterval(intervalId);
  }, [reloadQueue]);

  useEffect(() => {
    const waiting = queueItems.filter((i) => i.status === 'PENDING').length;
    const cooking = queueItems.filter((i) => i.status === 'PREPARING').length;
    setStats((prev) => ({ ...prev, waiting, cooking }));
  }, [queueItems]);

  const orders = useMemo<QueueOrder[]>(() => {
    const grouped = new Map<string, QueueOrder>();

    queueItems.forEach((item) => {
      const orderKey =
        item.order_id != null ? String(item.order_id) : `table:${item.table_number}`;
      const existing = grouped.get(orderKey);
      const normalizedItem: QueueOrderItem = {
        item_id: item.item_id,
        dish_name: item.dish_name,
        quantity: item.quantity,
        notes: item.notes,
        status: item.status,
      };

      if (!existing) {
        grouped.set(orderKey, {
          order_key: orderKey,
          order_id: item.order_id,
          table_number: item.table_number,
          created_at: item.created_at,
          order_final_amount: item.order_final_amount,
          items: [normalizedItem],
        });
        return;
      }

      existing.items = [...existing.items, normalizedItem];
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return ta - tb;
    });
  }, [queueItems]);

  const lineTotalByItemId = useMemo(() => {
    const map = new Map<string, string | number>();
    queueItems.forEach((item) => {
      map.set(String(item.item_id), item.line_total ?? 0);
    });
    return map;
  }, [queueItems]);

  const formatCompactCurrency = (value: string | number | undefined) => {
    const n =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;
    if (!Number.isFinite(n)) {
      return 'VNĐ 0';
    }
    if (n >= 1000) {
      return `VNĐ ${Math.round(n / 1000)}k`;
    }
    return `VNĐ ${Math.round(n)}`;
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'Tất cả') {
      return orders;
    }
    return orders;
  }, [activeTab, orders]);

  // Hàm hỗ trợ tính toán thời gian chờ & render CSS (Dùng cho dữ liệu thực từ API)
  const getWaitTimeClass = (createdAt: string | Date | undefined) => {
    if (!createdAt) return 'text-[#b43516]'; // default

    // Lấy thời gian hiện tại trừ thời gian đặt
    const orderTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - orderTime) / 60000);

    // Báo động đỏ nhấp nháy nếu quá 10 phút
    if (diffMinutes > 10) {
      return 'text-red-500 animate-pulse';
    }
    return 'text-[#b43516]';
  };

  return (
    <div className="flex flex-col h-full relative pb-20">
      {/* Topbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold text-gray-900">Bảng Điều phối Dịch vụ</h2>
          <div className="flex items-center gap-3">
            <span className="bg-[#fcece6] text-[#b43516] px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ef5b1b]"></span>
              {stats.waiting < 10 ? `0${stats.waiting}` : stats.waiting} Đang chờ
            </span>
            <span className="bg-[#fcece6] text-[#b43516] px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ef5b1b]"></span>
              {stats.cooking < 10 ? `0${stats.cooking}` : stats.cooking} Đang nấu
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              className="pl-10 pr-4 py-2 bg-[#EAEAEA] border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ef5b1b]/50 text-sm w-64 placeholder:text-gray-500"
            />
          </div>
          <button className="text-gray-600 hover:text-gray-900 relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="text-gray-600 hover:text-gray-900">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 mt-4 flex-1">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Đơn Hàng Hiện Tại</h1>
            <p className="text-gray-500 mt-1">Xử lý các đơn hàng theo thứ tự ưu tiên thời gian.</p>
          </div>

          <div className="flex bg-[#F1F3F5] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('Tất cả')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'Tất cả' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
                }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('Phòng VIP')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'Phòng VIP' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
                }`}
            >
              Phòng VIP
            </button>
            <button
              onClick={() => setActiveTab('Mang về')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${activeTab === 'Mang về' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
                }`}
            >
              Mang về
            </button>
          </div>
        </div>

        {/* Order Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* Render từ dữ liệu thực */}
          {isLoading ? (
            <div className="col-span-3 text-center py-12 text-gray-500 font-bold">
              Đang tải dữ liệu...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500 font-bold">
              Không có đơn hàng nào trong mục này.
            </div>
          ) : (
            filteredOrders.map((order) => {
              // Phân loại thẻ:
              const waitClass = getWaitTimeClass(order.created_at);
              const isHighPriority = waitClass.includes('red'); // Nếu quá 10 phút => Ưu tiên cao

              let tagText = "ĐƠN MỚI";
              let tagColor = "text-gray-500";
              let borderColor = "border-gray-100";
              let sideBorder = null;
              let statusText = "ĐANG CHỜ";
              let statusBg = "bg-[#ffba08]";

              const hasPreparing = order.items.some((it) => it.status === 'PREPARING');
              if (hasPreparing) {
                statusText = 'ĐANG NẤU';
                statusBg = 'bg-[#b43516]';
              }

              if (isHighPriority) {
                tagText = "ƯU TIÊN CAO";
                tagColor = "text-red-600";
                borderColor = "border-red-100";
                sideBorder = <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>;
                statusText = "CHỜ NẤU GẤP";
                statusBg = "bg-[#ef4444]";
              }

              const createdDate = new Date(order.created_at);
              const createdTime = Number.isNaN(createdDate.getTime())
                ? null
                : createdDate;

              return (
                <div key={order.order_key} className={`bg-white rounded-3xl p-6 shadow-sm border ${borderColor} flex flex-col h-full relative overflow-hidden`}>
                  {sideBorder}

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${tagColor}`}>{tagText}</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">
                        {order.table_number && order.table_number !== 'N/A'
                          ? `Bàn #${order.table_number}`
                          : `#ORDER-${String(order.order_id ?? order.order_key)}`}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {createdTime
                          ? createdTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          : '--:--'}
                      </p>
                      <p className={`text-sm font-bold flex items-center gap-1 justify-end mt-1 ${waitClass}`}>
                        {createdTime
                          ? Math.floor(
                            (new Date().getTime() - createdTime.getTime()) /
                            60000,
                          )
                          : 0}{' '}
                        phút
                      </p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs font-bold bg-[#EAEAEA] px-2 py-1 rounded-full text-gray-700 whitespace-nowrap">
                          {formatCompactCurrency(order.order_final_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    {/* Render các món ăn trong đơn */}
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 bg-[#f4f5f6] text-gray-600">
                          x{item.quantity || 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight w-2/3">
                              {item.dish_name || 'Tên món'}
                            </h4>
                            <span className="text-sm font-bold bg-[#EAEAEA] px-2 py-0.5 rounded-full text-gray-700 whitespace-nowrap">
                              {formatCompactCurrency(
                                lineTotalByItemId.get(String(item.item_id)),
                              )}
                            </span>
                          </div>
                          {/* Nhiệm vụ 11: Hiển thị ghi chú với highlight từ khóa quan trọng */}
                          {item.notes && (() => {
                            const noteText = item.notes;
                            const urgentKeywords = ['Dị ứng', 'dị ứng', 'Không cay', 'không cay', 'Gấp', 'gấp', 'Allergi', 'KHẨN'];
                            const hasUrgent = urgentKeywords.some(kw => noteText.includes(kw));

                            if (!hasUrgent) {
                              return (
                                <p className="text-xs text-orange-600 italic mt-1">
                                  👉 {noteText}
                                </p>
                              );
                            }

                            // Tách và highlight từ khóa quan trọng
                            const regex = new RegExp(`(${urgentKeywords.join('|')})`, 'g');
                            const parts = noteText.split(regex);
                            return (
                              <p className="text-xs italic mt-1 flex flex-wrap items-center gap-0.5">
                                <span></span>
                                {parts.map((part: string, i: number) =>
                                  urgentKeywords.includes(part) ? (
                                    <span key={i} className="text-red-600 font-extrabold not-italic bg-red-50 px-1 rounded">
                                      {part}
                                    </span>
                                  ) : (
                                    <span key={i} className="text-orange-600">{part}</span>
                                  )
                                )}
                              </p>
                            );
                          })()}
                        </div>
                      </div>
                    ))}

                    {/* Fallback nếu API mảng items rỗng */}
                    {!order.items.length && (
                      <p className="text-sm text-gray-400 italic">...Đang chờ dữ liệu món ăn...</p>
                    )}
                  </div>

                  <div className="space-y-4 mt-auto">
                    <div>
                      <span className={`inline-block text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider shadow-sm ${statusBg}`}>
                        {statusText}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const cookingItem = order.items.find((it) => it.status === 'PREPARING');
                        const pendingItem = order.items.find((it) => it.status === 'PENDING');
                        if (cookingItem) {
                          void orderApi
                            .finishCookingItem(cookingItem.item_id)
                            .then(() => {
                              toast.success('Món ăn đã nấu xong!');
                              return reloadQueue();
                            })
                            .catch((e) => {
                              console.error('Finish item error:', e);
                              toast.error('Có lỗi xảy ra khi cập nhật.');
                            });
                          return;
                        }
                        if (pendingItem) {
                          void orderApi
                            .startCookingItem(pendingItem.item_id)
                            .then(() => {
                              toast.success('Bắt đầu nấu món ăn!', { icon: '🔥' });
                              return reloadQueue();
                            })
                            .catch((e) => {
                              console.error('Start item error:', e);
                              toast.error('Có lỗi xảy ra khi cập nhật.');
                            });
                        }
                      }}
                      className="w-full bg-[#ef5b1b] hover:bg-[#d44d15] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors active:scale-95"
                    >
                      <CheckCircle2 size={20} />
                      {hasPreparing ? 'Xác nhận hoàn tất' : 'Bắt đầu nấu'}
                    </button>
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* Floating Status Bar Bottom */}
      <div className="fixed bottom-6 left-[calc(50vw+8rem)] -translate-x-1/2 z-50 bg-white px-8 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-12 font-bold text-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffba08]"></span>
          Chờ: {stats.waiting < 10 ? `0${stats.waiting}` : stats.waiting} đơn
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <div className="flex items-center gap-2 transition-all">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b43516]"></span>
          Nấu: {stats.cooking < 10 ? `0${stats.cooking}` : stats.cooking} đơn
        </div>
        <div className="w-px h-4 bg-gray-200"></div>
        <div className="flex items-center gap-2 transition-all relative">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          Xong: <span className="inline-block min-w-5 text-center">{stats.completed < 10 ? `0${stats.completed}` : stats.completed}</span> đơn
        </div>
      </div>
    </div>
  );
};

export default ChefDashboardPage;

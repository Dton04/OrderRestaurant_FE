import React, { useState, useEffect } from 'react';
import { Clock, Filter, Ban, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import orderApi from '../../api/order';
import type { KitchenQueueItem } from '../../api/order';
import StaffTopBar from '../../components/staff/StaffTopBar';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import { useSocket } from '../../context/SocketContext';

const KitchenPulsePage: React.FC = () => {
  const [readyItems, setReadyItems] = useState<KitchenQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const items = await orderApi.getStaffKitchenPulse();
      setReadyItems(items);
    } catch (error) {
      console.error('Error fetching kitchen pulse:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServeOrder = async (orderId: string, itemIds: (string | number)[]) => {
    try {
      // Serve all ready items in this order
      await Promise.all(itemIds.map((id) => orderApi.serveCookingItem(id)));

      // Remove these items locally
      setReadyItems((prev) => prev.filter((item) => String(item.order_id) !== String(orderId)));
      toast.success('Đã mang đơn hàng ra bàn thành công!', { icon: '🍽️' });
    } catch (error) {
      console.error('Error serving order:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái đơn (Mang ra bàn).');
    }
  };

  const { socket } = useSocket();

  useEffect(() => {
    fetchQueue();
    
    if (socket) {
      socket.on('refresh_pulse', fetchQueue);
    }
    
    return () => {
      if (socket) {
        socket.off('refresh_pulse', fetchQueue);
      }
    };
  }, [socket]);

  // Group by order
  const groupedOrders = readyItems.reduce((acc, item) => {
    const orderId = String(item.order_id || 'unknown');
    if (!acc[orderId]) {
      acc[orderId] = {
        order_id: orderId,
        table_number: item.table_number,
        created_at: item.created_at,
        items: [],
      };
    }
    acc[orderId].items.push(item);
    return acc;
  }, {} as Record<string, { order_id: string; table_number: string; created_at: string; items: KitchenQueueItem[] }>);

  type GroupedOrder = { order_id: string; table_number: string; created_at: string; items: KitchenQueueItem[] };
  
  const orders: GroupedOrder[] = Object.values(groupedOrders).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const getMinutesWaiting = (createdAtStr: string) => {
    const diff = new Date().getTime() - new Date(createdAtStr).getTime();
    const mins = Math.floor(diff / 60000);
    return isNaN(mins) ? 0 : mins;
  };

  return (
    <div className="min-h-screen bg-[#f7f6f5] text-on-surface overflow-hidden">
      <StaffTopBar />
      <StaffSidebarNew />
      <main className="ml-64 relative pt-[88px]">
        <section className="mx-auto max-w-[1400px] px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
                Kitchen Pulse
              </h1>
              <p className="text-sm font-medium text-zinc-500">
                Managing {orders.length} Active Orders • FIFO Sequence
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-zinc-200/60 px-4 py-2 font-bold text-zinc-700 transition hover:bg-zinc-200 text-sm">
                <Filter size={16} /> All Stations
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-zinc-200/60 px-4 py-2 font-bold text-zinc-700 transition hover:bg-zinc-200 text-sm">
                <Ban size={16} /> Mark Out-of-Stock
              </button>
            </div>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full py-16 text-center text-zinc-500">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="mt-4 font-medium">Đang tải trạng thái món ăn...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-400 bg-white rounded-2xl shadow-sm border border-zinc-100/50">
                <CheckCircle2 size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-bold">Chưa có món nào đang chờ phục vụ</p>
                <p className="text-sm font-medium">Các món Bếp nấu xong sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              orders.map((order) => {
                const itemIds = order.items.map((i) => i.item_id);
                const waitMins = getMinutesWaiting(order.created_at);
                // Alternate styles based on order id just for the design feel, or standard color. Use Design 1's teal for READY TO SERVE.
                // Since this is KDS for Staff, all items here are Ready to Serve, so we use teal color theme.
                return (
                  <div key={order.order_id} className="flex flex-col bg-white rounded-xl shadow-sm border border-zinc-200/60 overflow-hidden relative min-h-[300px]">
                    {/* Left accent border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00b09b]" />

                    <div className="p-5 flex-1 flex flex-col pl-6">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-orange-600 tracking-wider">
                          BÀN {order.table_number.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-[#00b09b]">
                          <Clock size={14} className="stroke-[2.5]" />
                          {waitMins}m
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900">
                          Order #{order.order_id}
                        </h2>
                        <span className="text-[10px] font-extrabold text-zinc-400 tracking-wider uppercase">
                          Sẵn Sàng
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="flex-1 space-y-3 mb-6">
                        {order.items.map((item) => (
                          <div key={item.item_id} className="flex flex-col">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-2">
                                <span className="font-bold text-zinc-500">{item.quantity}x</span>
                                <span className="font-bold text-zinc-800">{item.dish_name}</span>
                              </div>
                              <CheckCircle2 size={16} className="text-[#00b09b] shrink-0 mt-0.5" />
                            </div>

                            {item.notes && (
                              <div className="mt-2 text-xs font-medium text-orange-800 bg-orange-50/80 p-2.5 rounded-md border border-orange-100/50">
                                <span className="font-bold mr-1">Ghi chú:</span>
                                {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto pt-2">
                        <button
                          onClick={() => handleServeOrder(order.order_id, itemIds)}
                          className="w-full py-3 bg-[#00b09b] hover:bg-[#009b88] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                        >
                          Mang Ra Bàn
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default KitchenPulsePage;

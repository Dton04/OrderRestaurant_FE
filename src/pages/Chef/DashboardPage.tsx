import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Utensils, ChefHat, AlertCircle, TrendingUp, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import orderApi from '../../api/order';
import type { KitchenQueueItem } from '../../api/order';
import { useSocket } from '../../context/SocketContext';

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

  const reloadQueue = useCallback(async () => {
    const items = await orderApi.getKitchenQueue();
    setQueueItems(items);
  }, []);

  const { socket } = useSocket();

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
    if (socket) {
      socket.on('refresh_orders', reloadQueue);
    }
    return () => {
      if (socket) {
        socket.off('refresh_orders', reloadQueue);
      }
    };
  }, [socket, reloadQueue]);

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
      // Xếp đơn mới nhất lên đầu
      return tb - ta;
    });
  }, [queueItems]);

  // Hàm hỗ trợ tính toán thời gian chờ
  const getWaitTimeClass = (createdAt: string | Date | undefined) => {
    if (!createdAt) return 'text-[#AC3509]';
    const orderTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMinutes = Math.floor((now - orderTime) / 60000);

    if (diffMinutes > 10) {
      return 'text-red-500 animate-pulse';
    }
    return 'text-[#AC3509]';
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#191C1D]">
            Kitchen Pulse
          </h1>
          <p className="text-zinc-500 font-medium mt-1">
            Managing {orders.length} Active Orders • Newest First
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-zinc-100 shadow-sm mr-4 text-sm font-semibold">
            <TrendingUp size={16} className="text-emerald-500" />
            <span>142 Dishes Prepared Today</span>
          </div>

          <button className="flex items-center gap-2 bg-[#F1F3F5] text-zinc-700 font-bold px-5 py-3 rounded-2xl text-sm transition-all hover:bg-zinc-200">
            <Utensils size={18} />
            All Stations
          </button>
          <button className="flex items-center gap-2 bg-[#F1F3F5] text-zinc-700 font-bold px-5 py-3 rounded-2xl text-sm transition-all hover:bg-zinc-200">
            <Package size={18} />
            Mark Out-of-Stock
          </button>
        </div>
      </header>

      {/* Order Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-[#AC3509] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-zinc-400">Syncing with kitchen...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-[32px]">
            <ChefHat size={64} className="mb-4 opacity-20" />
            <p className="text-xl font-bold">No active orders in queue.</p>
            <p className="font-medium opacity-60">Everything is up to date!</p>
          </div>
        ) : (
          orders.map((order) => {
            const waitTimeClass = getWaitTimeClass(order.created_at);
            const isCooking = order.items.some(i => i.status === 'PREPARING');
            const minutesElapsed = order.created_at
              ? Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000)
              : 0;

            return (
              <div
                key={order.order_key}
                className="bg-white rounded-[32px] border border-zinc-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-[#AC3509]/5 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className={`h-2 ${isCooking ? 'bg-[#009688]' : 'bg-[#AC3509]'}`}></div>
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-black uppercase tracking-widest ${isCooking ? 'text-[#009688]' : 'text-[#AC3509]'}`}>
                      TABLE {order.table_number || '??'}
                    </span>
                    <div className={`flex items-center gap-1.5 font-black text-sm ${waitTimeClass}`}>
                      {isCooking ? <Utensils size={14} className="animate-bounce" /> : <Clock size={14} />}
                      {minutesElapsed < 10 ? `0${minutesElapsed}` : minutesElapsed}m
                      <span className="opacity-50 text-[10px] ml-1 uppercase">{isCooking ? 'Cooking' : 'Waiting'}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-[#191C1D]">Order #{order.order_id || '???'}</h3>
                </div>

                {/* Items List */}
                <div className="px-6 flex-1 space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <span className="font-black text-zinc-400 mt-0.5">{item.quantity}x</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold transition-all ${item.status === 'READY' ? 'text-zinc-300 line-through' : 'text-[#191C1D]'}`}>
                            {item.dish_name}
                          </span>
                          <span className="text-[10px] font-black uppercase bg-zinc-100 px-2 py-1 rounded-md text-zinc-500">
                            Tag
                          </span>
                        </div>

                        {item.notes && (
                          <div className="mt-3 bg-red-50 p-3 rounded-2xl flex gap-x-2 border border-red-100/50">
                            <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs font-semibold text-red-700 leading-relaxed italic">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                      {item.status === 'READY' && (
                        <div className="bg-emerald-500 text-white p-1 rounded-full shadow-sm">
                          <CheckCircle2 size={12} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="p-6 mt-4">
                  <button
                    onClick={() => {
                      const cookingItem = order.items.find((it) => it.status === 'PREPARING');
                      const pendingItem = order.items.find((it) => it.status === 'PENDING');
                      if (cookingItem) {
                        void orderApi.finishCookingItem(cookingItem.item_id).then(() => {
                          toast.success('Ready to serve!', { icon: '🧑‍🍳' });
                          return reloadQueue();
                        });
                      } else if (pendingItem) {
                        void orderApi.startCookingItem(pendingItem.item_id).then(() => {
                          toast.success('Order started!', { icon: '🔥' });
                          return reloadQueue();
                        });
                      }
                    }}
                    className={`w-full py-5 rounded-2xl font-black text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${isCooking
                      ? 'bg-[#009688] shadow-[#009688]/20 ring-4 ring-[#009688]/10'
                      : 'bg-[#AC3509] shadow-[#AC3509]/20'
                      }`}
                  >
                    {isCooking ? (
                      <>
                        <CheckCircle2 size={20} />
                        Ready to Serve
                      </>
                    ) : (
                      'Start Cooking'
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Sections */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Inventory Update */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-zinc-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Quick Inventory Update</h3>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Items</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Mixed Salad', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop' },
              { name: 'Ribeye Steak', img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=200&auto=format&fit=crop' },
              { name: 'Seared Salmon', img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&auto=format&fit=crop' },
              { name: 'Mushroom Soup', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=200&auto=format&fit=crop', stock: 'restock' }
            ].map((food, i) => (
              <div key={i} className="bg-[#F8F9FA] rounded-2xl p-4 flex flex-col items-center gap-3 transition-all hover:shadow-md cursor-pointer border border-transparent hover:border-[#AC3509]/10">
                <img src={food.img} alt={food.name} className="w-16 h-16 rounded-full object-cover shadow-sm bg-white p-0.5" />
                <div className="text-center">
                  <p className="text-xs font-black">{food.name}</p>
                  {food.stock === 'restock' && <span className="text-[10px] font-bold text-[#AC3509] uppercase">Back in stock</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Insights */}
        <div className="bg-[#191C1D] rounded-[32px] p-8 text-white flex flex-col shadow-xl">
          <h3 className="text-xl font-black mb-1">Shift Insights</h3>
          <p className="text-xs text-zinc-500 font-bold mb-8">Real-time performance metrics</p>

          <div className="mb-10">
            <div className="flex items-end gap-1 mb-2">
              <span className="text-5xl font-black">24m</span>
              <span className="text-sm font-bold text-red-400 flex items-center gap-0.5 mb-2">
                <TrendingUp size={14} className="rotate-180" />
                12%
              </span>
            </div>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[.2em]">Avg. Completion Time</p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-1 h-32">
            {[40, 70, 50, 90, 60, 45, 80].map((h, i) => (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`flex-1 rounded-sm transition-all ${i === 3 ? 'bg-[#AC3509]' : 'bg-zinc-800'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChefDashboardPage;

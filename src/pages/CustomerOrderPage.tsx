import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Menu as MenuIcon,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  X,
  CheckCircle2,
  History,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import categoryApi from '../api/category';
import dishApi from '../api/dish';
import tableApi from '../api/table';
import orderApi from '../api/order';
import { useSocket } from '../context/SocketContext';
import type { Category } from '../types/category';
import type { Dish } from '../types/dish';
import type { Table } from '../types/table';

interface CartItem {
  dish: Dish;
  quantity: number;
  notes: string;
}

const CustomerOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTableStr = searchParams.get('table_id') || searchParams.get('table') || '';

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [activeCategoryId, setActiveCategoryId] = useState<number | 'all'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false); // For mobile
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order state
  const [selectedTableId, setSelectedTableId] = useState<number | ''>(
    initialTableStr ? Number(initialTableStr) : ''
  );
  const [orderNotes, setOrderNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // History & Notifications state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const prevMyOrdersRef = useRef<any[]>([]);
  
  const { socket } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [cats, allDishes, allTables] = await Promise.all([
          categoryApi.findAll(),
          dishApi.findAll(),
          tableApi.findAll(),
        ]);
        setCategories(cats);
        // Only show available dishes
        setDishes(allDishes.filter((d) => d.is_available));
        setTables(allTables);
      } catch (error) {
        console.error('Failed to load menu data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Polling for Order History & Toasts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return; // Only for logged-in customers

    const fetchHistory = async () => {
      try {
        const ordersList = await orderApi.getCustomerMyOrders();
        if (!Array.isArray(ordersList)) return;

        const prevList = prevMyOrdersRef.current;
        if (prevList.length > 0) {
          ordersList.forEach((newOrder) => {
            const oldOrder = prevList.find((o) => String(o.id) === String(newOrder.id));
            if (oldOrder) {
              const newItems = newOrder.order_items || [];
              const oldItems = oldOrder.order_items || [];

              newItems.forEach((newItem: any) => {
                const oldItem = oldItems.find((i: any) => String(i.item_id) === String(newItem.item_id));
                if (oldItem && oldItem.status !== newItem.status) {
                  const dishName = newItem.dish?.name || 'Món ăn';
                  if (newItem.status === 'READY') {
                    toast(`Món ${dishName} đã chế biến xong!`, { icon: '🧑‍🍳', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                  } else if (newItem.status === 'COMPLETED') {
                    toast.success(`Món ${dishName} đang được bưng ra bàn!`, { icon: '🍽️', duration: 5000 });
                  }
                }
              });

              // Order status change
              if (oldOrder.status !== newOrder.status && newOrder.status === 'READY') {
                toast.success(`Đơn #${newOrder.id} đã hoàn tất nấu!`);
              }
            }
          });
        }

        prevMyOrdersRef.current = ordersList;
        setMyOrders(ordersList);
      } catch (error) {
        // Ignore errors for unauthenticated users
      }
    };

    fetchHistory();
    
    if (socket) {
      socket.on('item_status_changed', fetchHistory);
    }
    
    return () => {
      if (socket) {
        socket.off('item_status_changed', fetchHistory);
      }
    };
  }, [socket]);

  const filteredDishes = useMemo(() => {
    if (activeCategoryId === 'all') return dishes;
    return dishes.filter((d) => d.category_id === activeCategoryId);
  }, [dishes, activeCategoryId]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.dish.price) * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1, notes: '' }];
    });
    // Optional: open cart on mobile when first item added
    if (cart.length === 0) setIsCartOpen(true);
  };

  const updateQuantity = (dishId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.dish.id === dishId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateItemNote = (dishId: number, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, notes } : item
      )
    );
  };

  const removeItem = (dishId: number) => {
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất một món!');
      return;
    }
    if (!selectedTableId) {
      alert('Vui lòng chọn số bàn!');
      return;
    }

    try {
      setIsSubmitting(true);

      const userRaw = localStorage.getItem('user');
      let customerId: string | number | undefined = undefined;
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          customerId = user?.id;
        } catch (e) { }
      }

      const payload = {
        table_id: selectedTableId,
        customer_id: customerId,
        total_amount: totalAmount,
        final_amount: totalAmount,
        status: 'PENDING',
        notes: orderNotes ? orderNotes : null,
        items: cart.map(item => ({
          dish_id: item.dish.id,
          quantity: item.quantity,
          price_at_order: Number(item.dish.price),
          notes: item.notes ? item.notes : null,
        })),
      };

      await orderApi.create(payload);
      setOrderSuccess(true);
      setCart([]);
      setOrderNotes('');
      // Do not reset table_id as they might order again

      // Attempt to immediately refresh history
      if (localStorage.getItem('token')) {
        orderApi.getCustomerMyOrders().then(res => {
          if (Array.isArray(res)) setMyOrders(res);
        }).catch(() => { });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Có lỗi xảy ra khi đặt món. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy toàn bộ đơn hàng này?')) return;
    try {
      await orderApi.cancel(orderId);
      toast.success('Đã hủy đơn hàng thành công!');
      // Update local state if needed, though socket might handle it
      const updated = await orderApi.getCustomerMyOrders();
      setMyOrders(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng.');
    }
  };

  const handleCancelItem = async (orderId: number | string, itemId: number | string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy món này?')) return;
    try {
      await orderApi.cancelItem(orderId, itemId);
      toast.success('Đã hủy món ăn thành công!');
      const updated = await orderApi.getCustomerMyOrders();
      setMyOrders(updated);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể hủy món ăn.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef5b1b] border-t-transparent"></div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900">Đặt món thành công!</h2>
          <p className="mt-4 text-gray-600">
            Đơn hàng của bạn đã được gửi đến Bếp. Xin vui lòng chờ trong giây lát.
          </p>
          <div className="mt-8 space-y-3">
            <button
              onClick={() => setOrderSuccess(false)}
              className="w-full rounded-xl bg-[#ef5b1b] px-5 py-3 font-extrabold text-white transition-colors hover:bg-[#d44d15]"
            >
              Tiếp tục gọi món
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl bg-gray-100 px-5 py-3 font-extrabold text-gray-700 transition-colors hover:bg-gray-200"
            >
              Trở về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 pb-24 lg:pb-0">
      {/* LEFT SIDE - MENU */}
      <div className="flex-1 lg:pr-[400px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 transition-colors hover:text-gray-900">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ef5b1b] text-xs font-extrabold text-white">
              OR
            </div>
            <div className="font-extrabold text-gray-900 hidden sm:block">Menu</div>
          </div>
          <div className="flex items-center gap-3">
            {localStorage.getItem('token') && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
              >
                <History size={18} />
                <span className="hidden sm:inline">Lịch sử</span>
              </button>
            )}
            <div className="lg:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center rounded-xl bg-orange-50 p-2 text-[#ef5b1b]"
              >
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Categories Navbar */}
        <div className="sticky top-16 z-10 border-b border-gray-200 bg-white px-4 shadow-sm">
          <div className="flex gap-2 overflow-x-auto py-3 hide-scrollbar">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all ${activeCategoryId === 'all'
                  ? 'bg-[#ef5b1b] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Tất cả món
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategoryId(c.id)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all ${activeCategoryId === c.id
                    ? 'bg-[#ef5b1b] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Grid */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="group flex flex-col rounded-2xl bg-white p-3 shadow-sm transition-all hover:shadow-md border border-gray-100"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <MenuIcon size={48} />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-1 flex-col">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{dish.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[32px]">
                    {dish.description || 'Không có mô tả'}
                  </p>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="font-extrabold text-[#ef5b1b]">
                      {dish.price.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => addToCart(dish)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#ef5b1b] transition-colors hover:bg-[#ef5b1b] hover:text-white"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredDishes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ShoppingBag size={48} className="mb-4" />
              <p>Trống! Chưa có món ăn nào trong mục này.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - CART DRAWER */}
      {/* Mobile overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Container */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[400px] lg:translate-x-0 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <ShoppingBag size={20} className="text-[#ef5b1b]" />
            Đơn của bạn
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Table Selection */}
          <div className="mb-6 rounded-2xl bg-orange-50 p-4 border border-orange-100">
            <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Bàn của bạn
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(Number(e.target.value) || '')}
              className="w-full rounded-xl border border-white bg-white p-3 text-sm font-bold shadow-sm outline-none focus:border-[#ef5b1b] focus:ring-1 focus:ring-[#ef5b1b]"
            >
              <option value="" disabled>-- Chọn Bàn --</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>{t.table_number}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <ShoppingBag size={40} className="mb-3 opacity-20" />
                <p className="text-sm">Chưa có món nào</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.dish.id} className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{item.dish.name}</div>
                      <div className="mt-1 font-semibold text-[#ef5b1b]">
                        {item.dish.price.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                    {/* Quantity Controls */}
                    <div className="flex h-9 items-center rounded-xl bg-gray-100 p-1">
                      <button
                        onClick={() => updateQuantity(item.dish.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.dish.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Ghi chú (vd: Ít đá, không cay...)"
                      value={item.notes}
                      onChange={(e) => updateItemNote(item.dish.id, e.target.value)}
                      className="w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-gray-200"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.dish.id)}
                    className="absolute -right-2 -top-2 rounded-full border border-gray-100 bg-white p-1 text-gray-400 shadow-sm hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* General Notes */}
          {cart.length > 0 && (
            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ghi chú đơn hàng
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Lên món nhanh giúp mình nhé..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-[#ef5b1b] focus:ring-1 focus:ring-[#ef5b1b]"
              />
            </div>
          )}
        </div>

        {/* Footer Checkout */}
        <div className="border-t border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between text-lg font-extrabold">
            <span className="text-gray-900">Tổng cộng</span>
            <span className="text-[#ef5b1b]">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-extrabold text-white transition-all ${cart.length === 0 || isSubmitting
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-[#ef5b1b] hover:bg-[#d44d15] shadow-lg shadow-orange-200 hover:-translate-y-1'
              }`}
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>Xác nhận đặt món</>
            )}
          </button>
        </div>
      </div>

      {/* HISTORY MODAL / DRAWER */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />

          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
                <History size={20} className="text-[#ef5b1b]" />
                Lịch sử đơn hàng
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
              {myOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <History size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">Bạn chưa có đơn hàng nào.</p>
                </div>
              ) : (
                myOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-extrabold text-gray-900">Đơn #{order.id}</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          order.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </div>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-[10px] font-extrabold text-red-500 hover:underline"
                          >
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex gap-2 text-gray-800 font-medium">
                            <span className="text-gray-500">x{item.quantity}</span>
                            <div className="flex flex-col">
                              <span className={item.status === 'CANCELLED' ? 'line-through text-gray-400' : ''}>
                                {item.dish?.name || 'Món ăn'}
                              </span>
                              {item.status === 'PENDING' && (
                                <button
                                  onClick={() => handleCancelItem(order.id, item.id)}
                                  className="text-[10px] text-left font-bold text-red-400 hover:text-red-500"
                                >
                                  Hủy món
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            {item.status === 'COMPLETED' ? (
                              <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Đã phục vụ</span>
                            ) : item.status === 'READY' ? (
                              <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-1 rounded">Xong</span>
                            ) : item.status === 'CANCELLED' ? (
                              <span className="text-red-400 text-xs font-bold bg-red-50 px-2 py-1 rounded">Đã hủy</span>
                            ) : (
                              <span className="text-gray-400 text-xs font-medium">Chờ nấu</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Clock size={12} />
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`font-extrabold ${order.status === 'CANCELLED' ? 'text-gray-400' : 'text-[#ef5b1b]'}`}>
                        {Number(order.final_amount || order.total_amount).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderPage;

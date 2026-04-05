import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Search } from 'lucide-react';
import axios from 'axios';
import { categoryApi } from '../api/category';
import { dishApi } from '../api/dish';
import type { Category } from '../types/category';
import type { Dish } from '../types/dish';

type StoredUser = {
  full_name?: string;
  role?: string;
};

type CartItem = {
  dish: Dish;
  quantity: number;
};

const FALLBACK_DISH_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCogtwz5a3qk0PycHTr3nN3H78x-CISQIemkDKJCo0P4HjiyP4WICVoAPuQ8dq1xOZErZGRKYV1l2RXhslr01pjVLwtLtuzjEYIwstAuR4-i4gAjxtyBOBURBzMHw_ecUfVl_lHQy1xmQPm4kWLzKBJzeupaORaXGxezU6_Vx3Y93Dj4t1m_UM8YkK3pzUL9UFinuswy6QIF4KQ5gipvuNN2xQ1eDhphK5bOVfpD9UXbG4_URwaZX4UjJ7H4lWHBl0jpkQx7JYDvkw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDl1zcEKbof517ToOdztKJ5ry4qIgYY2iUGQUgYWKmBmx-QIrVLXTBMZ53IQF32wWeF5hDBoxw_Mfg-zW-R_IJXOgvsq1yMGxwwwSACXKIZEh7olJYA07V2CBj6Q0AJMSSSEIkis58tI0ZLDPGpTPv8sz3JkDMUDqlCsO7gba-Me2mEdTuno0ucD5rcto80KCSrEgUeuZhw0ycAIOCR1lX-AoeJFuf4f_DBhNl8aWzdEByqxe8TRARCbkYrKVR4PmEYQ9AG-3hO6bs',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvrCsvVVSOqmelImQ8t-yxCp5vLkMDZWnLVXMOxQeYqbT4RQ18-8HCu8kRAYbgGMIb3QKTJUFEIUalZho28X7K4dSHckobsCWihpYv29V20uJ9W0JsVr_OBoMFlWHi0QNBs0OrCN8_e3r9fMZhYY-M-lrURX_TFYXfpVHrC5EqXfQlagQHn59AazEZ6fxnN3OnfZulZrMNLyZJsjVxECLCjU0fMps3WpcynQ3uOuUSbOSQL1rxGDWW-0ctToY_ENPGgjyaVdxBoc4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDp0y2zboAAhc6Yj2kOeNbHEB9zBi_wP7J2OJoY5-swehEzroU0DOztnlyapWbyYZ2u4Ua1cKISyRO3HhcGH6k5bmTcsjOYMUCYS7PPPZ4O5Mnw2vZuSB6RTaZDZjz4JEZDfrYo7FRcbkgsNI7smDyBOgAE9NzcoIxFxtXwEiuGsDX0fK7i3wvXfKrM7uY8dIRxRphIVd7wPNQIGBo6NhaV8jx1jrYx0LaqNC7bLyw_yjXq3Ft2ttNX6i4MCZ4KfrITfXSIkPnJic0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBtAvgrqHsYOrKyfjLTc3Od7wHHbeHQKaRHV90kDT2sIK7fYjgXBIusMC5XPzFsmv0QN_ZoX7A7y9hu_GllgcZ9Z1cSB6eEModWFolI3wcwXr6np6MBrwO9zvQadzbeBHqj6NzribwRa0HUwNu8X-sxwOY_zLaPa10VNgh6D9dwlyeAalQ307BLPeBKC1cMZnS-xiqwZxc1N8ammnstFyKdFd0aF-MAwXtXLvacCzqsL-MQCxBhJQoU8_iJCY9wjee733utrwuanHM',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA_LAaAYruWR83ZBk16mJNWO5uPfEa7e5f48eTvWrMcnvQWkxoZ0nhuBkSoZtmiJYrx5HQkk0DHWUj5R28uUnSU3x6weTMwCQkS7MciFzl6ulFq8bgYwtY5jS_WmHDbmkXWL50RADQ-Tct9qxj3yAcQB05ScMCx4MPWXCEJKMs_qUcmMjPPCthEMtZZwW0TX1iI601gcm8xQt4cMVIna1Vlm3SQ0Nbt0VP1cbwzrDw7fGepdyuk7CeLV31-zqID-gITuDpOQ-DkAyo',
] as const;

function safeParseUser(value: string | null): StoredUser | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as StoredUser;
  } catch {
    return null;
  }
}

function getMenuLoadErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Khong the tai du lieu tu backend. Vui long thu lai.';
  }

  if (!error.response) {
    return 'Khong the ket noi den backend. Kiem tra server va thu lai.';
  }

  const status = error.response.status;
  if (status >= 500) {
    return 'Backend dang gap su co tam thoi. Vui long thu lai sau.';
  }

  const payload = error.response.data as unknown;
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return 'Khong the tai du lieu menu. Vui long thu lai.';
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = safeParseUser(localStorage.getItem('user'));
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [tableId, setTableId] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';

  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRevalidating(true);
    }

    try {
      const [categoryData, dishData] = await Promise.all([categoryApi.findAll(), dishApi.findAll()]);
      setCategories(categoryData);
      setDishes(dishData);
      setSelectedCategoryId((current) => {
        if (current !== null && categoryData.some((category) => category.id === current)) {
          return current;
        }
        return categoryData[0]?.id ?? null;
      });
      setCartItems((current) => {
        if (current.length > 0 || dishData.length < 2) {
          return current;
        }
        return [
          { dish: dishData[0], quantity: 1 },
          { dish: dishData[1], quantity: 2 },
        ];
      });
      setApiError(null);
    } catch (error) {
      setApiError(getMenuLoadErrorMessage(error));
    } finally {
      setLoading(false);
      setRevalidating(false);
    }
  };

  useEffect(() => {
    void fetchData(true);
  }, []);

  const filteredDishes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return dishes.filter((dish) => {
      const matchCategory = selectedCategoryId ? dish.category_id === selectedCategoryId : true;
      const matchSearch =
        !keyword ||
        dish.name.toLowerCase().includes(keyword) ||
        String(dish.description || '')
          .toLowerCase()
          .includes(keyword);
      const isAvailable = dish.is_available !== false;
      return matchCategory && matchSearch && isAvailable;
    });
  }, [dishes, selectedCategoryId, searchTerm]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handleAddDish = (dish: Dish) => {
    setCartItems((prev) => {
      const item = prev.find((p) => p.dish.id === dish.id);
      if (item) {
        return prev.map((p) => (p.dish.id === dish.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const changeQuantity = (dishId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.dish.id === dishId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => `$${Number(price).toFixed(2)}`;
  const menuTitle = selectedCategory?.name ? `${selectedCategory.name} Tươi mới` : 'Khai vị Tươi mới';
  const profileName = user?.full_name || 'Bàn 12';

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-800">
      <div className="h-full flex border border-slate-100">
        <aside className="w-60 border-r border-slate-200 bg-white flex flex-col">
          <div className="px-5 py-6">
            <div className="flex items-center gap-2 text-orange-500">
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center font-black text-sm">✣</div>
              <div className="text-4xl font-black leading-none tracking-tight">Gourmet</div>
            </div>
          </div>
          <div className="px-3 pb-3 space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`w-full text-left px-5 py-3 rounded-2xl text-lg font-bold tracking-tight transition-all ${
                  selectedCategoryId === category.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="mt-auto border-t border-slate-200 px-4 py-4">
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=f5f5f5&color=111827`}
                alt={profileName}
                className="w-9 h-9 rounded-full"
              />
              <div>
                <p className="text-sm font-black leading-none">{profileName}</p>
                <p className="text-xs text-slate-500 mt-1">Order #882</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {isAdmin ? (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3 py-1.5 rounded-lg border border-orange-200 text-xs font-bold text-orange-600 hover:bg-orange-50"
                >
                  Khu quản trị
                </button>
              ) : (
                <span className="text-xs text-slate-400">Public Menu</span>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black"
              >
                <LogOut size={14} />
                Thoát
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-6 py-5 overflow-y-auto">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h1 className="text-5xl font-black leading-none tracking-tight text-slate-900">{menuTitle}</h1>
              <p className="text-xl text-slate-500 mt-2">
                Chọn món bạn yêu thích để bắt đầu bữa ăn.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-72 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              {isAdmin ? (
                <button
                  onClick={() => navigate('/admin')}
                  className="h-11 px-4 rounded-xl border border-orange-200 text-sm font-bold text-slate-800 hover:bg-orange-50"
                >
                  Khu quản trị
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            {apiError ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                <p className="font-semibold text-red-700">{apiError}</p>
                <button
                  onClick={() => void fetchData(false)}
                  disabled={revalidating}
                  className="mt-3 inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {revalidating ? 'Dang thu lai...' : 'Thu lai'}
                </button>
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                Đang tải thực đơn...
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center">
                <p className="text-3xl font-black text-slate-900">Chưa có món ăn phù hợp</p>
                <p className="text-base text-slate-500 mt-2">
                  Hãy thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDishes.map((dish, index) => (
                  <article
                    key={dish.id}
                    className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm"
                  >
                    <div className="relative h-36 bg-slate-100">
                      <img
                        src={dish.image_url || FALLBACK_DISH_IMAGES[index % FALLBACK_DISH_IMAGES.length]}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 ? (
                        <span className="absolute top-2 left-2 rounded-full bg-orange-500 px-2 py-1 text-[10px] font-black uppercase text-white">
                          Phổ biến
                        </span>
                      ) : null}
                      {index === 2 ? (
                        <span className="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-[10px] font-black uppercase text-white">
                          Đầu bếp gợi ý
                        </span>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="font-black text-2xl leading-tight text-slate-900 min-h-[56px]">{dish.name}</h3>
                      <p className="text-base text-slate-500 mt-1 leading-snug min-h-[95px]">
                        {dish.description || 'Freshly served with high-quality ingredients.'}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-3xl font-black text-slate-900">{formatPrice(dish.price)}</span>
                        <button
                          onClick={() => handleAddDish(dish)}
                          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
                        >
                          <Plus size={14} />
                          Thêm
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>

        <aside className="w-72 border-l border-slate-200 bg-white flex flex-col">
          <div className="px-5 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-tight text-slate-900">Đơn hàng của tôi</h2>
              <span className="rounded-md bg-orange-100 text-orange-500 px-2 py-1 text-[10px] font-black uppercase">
                {totalItems} món
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Giống với giao diện demo public menu</p>
          </div>

          <div className="px-5 pb-4">
            <div className="rounded-3xl border border-slate-100 p-4">
              <div className="text-[10px] tracking-[0.24em] uppercase font-black text-orange-500">Table ID</div>
              <input
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="Ví dụ 12"
                className="mt-2 w-full h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
              <p className="text-xs text-slate-500 mt-2">Để trống nếu bạn muốn tạo order không gắn bàn.</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5">
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-sm text-slate-400">Giỏ hàng trống.</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={item.dish.id} className="flex items-center gap-3">
                    <img
                      src={item.dish.image_url || FALLBACK_DISH_IMAGES[index % FALLBACK_DISH_IMAGES.length]}
                      alt={item.dish.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-black text-slate-900 truncate">{item.dish.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} x {formatPrice(item.dish.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQuantity(item.dish.id, -1)}
                        className="w-5 h-5 rounded border border-slate-200 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-slate-500 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => changeQuantity(item.dish.id, 1)}
                        className="w-5 h-5 rounded border border-slate-200 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-5 mt-auto border-t border-slate-100">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Thuế (10%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between items-end font-black text-3xl text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>
            </div>
            <button className="mt-4 w-full h-12 rounded-2xl bg-orange-600 text-white text-lg font-black hover:bg-orange-700">
              Đặt món ngay
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;



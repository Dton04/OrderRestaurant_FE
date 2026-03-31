import React, { useState, useMemo } from 'react';
import { Search, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Dish {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  badgeColor?: string;
}

const DISHES: Dish[] = [
  {
    id: '13',
    category: 'Khai vị',
    name: 'Gỏi Cuốn Tôm Thịt',
    description: 'Bánh tráng cuộn tôm thịt, rau thơm, bún mỏng dùng kèm tương đậu phộng đậm đà.',
    price: 35000,
    image: 'https://naucohungthinh.com/files/media/202109/5519_4.jpg',
    badge: 'Phổ biến',
    badgeColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: '12',
    category: 'Khai vị',
    name: 'Nem Rán Hà Nội',
    description: 'Nem rán giòn rụm với nhân thịt heo băm, mộc nhĩ, miến và rau củ.',
    price: 45000,
    image: 'https://icdn.one/upload/2020/11/13/20201113061759-f9295f1c.jpg',
  },
  {
    id: '14',
    category: 'Món chính',
    name: 'Phở Bò Truyền Thống',
    description: 'Nước dùng hầm xương ngọt thanh, bánh phở mềm cùng thịt bò tái nạm chín.',
    price: 65000,
    image: 'https://bepmina.vn/wp-content/uploads/2021/12/pho-bo.jpeg',
    badge: "Đầu bếp khuyên dùng",
    badgeColor: 'bg-green-500 text-white',
  },
  {
    id: '15',
    category: 'Món chính',
    name: 'Bún Chả Quạt',
    description: 'Thịt heo nướng than hoa thơm lừng, ăn kèm bún tươi và nước mắm chua ngọt.',
    price: 60000,
    image: 'https://dulichninhbinh.com.vn/mypicture/images/amthuc/bun-cha-quat-ninh-binh.jpg',
  },
  {
    id: '16',
    category: 'Món chính',
    name: 'Cơm Tấm Sườn Bì',
    description: 'Cơm tấm dẻo mặn mà cùng sườn nướng mật ong, bì chả và mỡ hành thơm lừng.',
    price: 70000,
    image: 'https://tse4.mm.bing.net/th/id/OIP.KcAtaDPuSwYkaBf5tpmXbAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    badge: 'Đặc sản',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    id: '17',
    category: 'Đồ uống',
    name: 'Trà Đá Dịp Hè',
    description: 'Trà đá lài thơm mát giải khát tuyệt vời cho những ngày nắng nóng.',
    price: 5000,
    image: 'https://file.hstatic.net/200000426635/file/tra_da_via_he_2_1eb5837e7d1843f0ad08cd15c898b674_grande.jpg',
  },
  {
    id: '18',
    category: 'Đồ uống',
    name: 'Cà Phê Sữa Đá',
    description: 'Cà phê phin truyền thống Việt Nam hòa quyện cùng sữa đặc béo ngậy.',
    price: 25000,
    image: 'https://giacaphe.com/wp-content/uploads/2023/03/ca-phe-sua-da-2.jpg',
    badge: 'Phổ biến',
    badgeColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: '19',
    category: 'Tráng miệng',
    name: 'Chè Đậu Xanh Hạt Sen',
    description: 'Chè truyền thống với hạt sen bùi béo, đậu xanh nhuyễn và cốt dừa thanh mát.',
    price: 30000,
    image: 'https://cdn.tgdd.vn/2021/03/CookRecipe/Avatar/che-dau-xanh-hat-sen-thumbnail-1.jpg',
  },
];

const CATEGORIES = ['Khai vị', 'Món chính', 'Đồ uống', 'Tráng miệng'];

const TableMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Khai vị');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state: { [dishId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return DISHES.filter((dish) => {
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = searchQuery ? true : dish.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, searchQuery]);

  // Cart operations
  const addToCart = (dishId: string) => {
    setCart((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[dishId] > 1) {
        newCart[dishId] -= 1;
      } else {
        delete newCart[dishId];
      }
      return newCart;
    });
  };

  // Cart calculations
  const cartItems = Object.keys(cart).map((id) => {
    const dish = DISHES.find((d) => d.id === id)!;
    return { ...dish, quantity: cart[id] };
  });

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    if (totalItemsCount === 0) return;

    // 1. Xác định ID bàn thực tế từ Database (Prisma Studio)
    // Dựa vào ảnh bạn gửi, bàn số 5 có ID là 6 (kiểu Number/BigInt)
    const actualTableId = 6;

    // 2. Log ra console để Dino dễ kiểm tra trước khi chuyển trang
    console.log("🚀 Đang chuẩn bị đơn hàng cho Bàn ID:", actualTableId);
    console.log("📦 Danh sách món ăn:", cartItems);

    // 3. Điều hướng sang trang Checkout với đầy đủ state sạch
    navigate('/checkout', {
      state: {
        items: cartItems.map(item => ({
          id: Number(item.id),       // Đảm bảo ID món ăn là số
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        tax,
        total,
        table: actualTableId         // Gửi số 6 (Number), không gửi '12' (String)
      }
    });
  };

  return (
    <div className="flex h-screen bg-[#fafaf9] font-sans overflow-hidden text-gray-900">
      {/* LEFT SIDEBAR - CATEGORIES */}
      <aside className="w-[260px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Profile */}
          <div className="p-6 flex items-center gap-2">
            <div className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl bg-[#ef5b1b] text-white flex items-center justify-center font-bold">
              OR
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight truncate">Order</h1>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery('');
                }}
                className={`w-full text-left px-5 py-4 rounded-xl font-bold transition-colors ${activeCategory === cat && !searchQuery
                  ? 'bg-[#ef5b1b] text-white shadow-md shadow-orange-500/20'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-[#ef5b1b]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </div>

        {/* User / Table Info */}
        <div className="p-6 border-t border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden border border-orange-200">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-extrabold text-sm text-gray-900">Bàn 12</div>
            <div className="text-xs text-gray-400 font-medium">Đơn #882</div>
          </div>
        </div>
      </aside>

      {/* MIDDLE SECTION - MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#fafaf9]">
        {/* Header containing Title, subtitle, and Search */}
        <header className="px-8 pt-8 pb-4 bg-white/50 backdrop-blur sticky top-0 z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                {searchQuery ? 'Kết quả tìm kiếm' : `Danh mục ${activeCategory}`}
              </h2>
              <p className="text-gray-500 text-sm mt-1.5 font-medium">
                {searchQuery ? `Đang hiển thị kết quả cho "${searchQuery}"` : 'Chọn những món ăn yêu thích của khách hàng để bắt đầu.'}
              </p>
            </div>

            <div className="relative w-full lg:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                <Search size={18} className="text-gray-400 group-focus-within:text-[#ef5b1b]" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[#ef5b1b] focus:ring-4 focus:ring-orange-500/10 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Dishes Grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium">Không tìm thấy món ăn nào.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="bg-white rounded-[1.5rem] flex flex-col p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] hover:border-orange-100 transition-all group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5 bg-gray-50">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {dish.badge && (
                      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-sm ${dish.badgeColor || 'bg-white text-gray-800'}`}>
                        {dish.badge}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-2">{dish.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium mb-5 line-clamp-3">
                      {dish.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-black text-xl text-gray-900">{dish.price.toLocaleString('vi-VN')}đ</span>
                      <button
                        onClick={() => addToCart(dish.id)}
                        className="bg-[#ef5b1b] hover:bg-[#e04a09] active:scale-95 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/30 transition-all flex items-center gap-1.5"
                      >
                        Thêm <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR - CART */}
      <aside className="w-[320px] xl:w-[380px] bg-white border-l border-gray-100 flex-shrink-0 flex flex-col z-20 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
        {/* Cart Header */}
        <div className="p-6 md:p-8 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Đơn hàng của tôi</h2>
          <div className="bg-orange-50 text-[#ef5b1b] px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-extrabold">
            {totalItemsCount} MÓN
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center pt-10 pb-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
                <Plus className="text-gray-300" size={32} />
              </div>
              <p className="text-sm font-semibold text-gray-400">Giỏ hàng trống</p>
              <p className="text-xs text-gray-400 mt-1">Hãy thêm món ăn từ thực đơn</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="font-extrabold text-sm text-gray-900 mb-0.5 line-clamp-1">{item.name}</div>
                  <div className="text-xs font-semibold text-gray-400">
                    <span className="text-gray-500">{item.quantity}</span> x {item.price.toLocaleString('vi-VN')}đ
                  </div>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#ef5b1b] hover:border-orange-200 transition-colors bg-white font-bold"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-extrabold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => addToCart(item.id)}
                    className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#ef5b1b] hover:border-orange-200 transition-colors bg-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer / Totals */}
        <div className="p-6 md:p-8 bg-white border-t border-gray-100 mt-auto shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
              <span>Tạm tính</span>
              <span className="text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
              <span>Thuế (10%)</span>
              <span className="text-gray-900">{tax.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="pt-4 border-t border-gray-100 border-dashed flex justify-between items-center mt-2">
              <span className="text-lg font-extrabold text-gray-900">Tổng cộng</span>
              <span className="text-2xl font-black text-[#ef5b1b]">{total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={totalItemsCount === 0}
            className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-extrabold text-lg transition-all shadow-lg ${totalItemsCount === 0
              ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
              : 'bg-[#ef5b1b] hover:bg-[#e04a09] active:scale-[0.98] text-white shadow-orange-500/40 hover:shadow-orange-500/60'
              }`}
          >
            ĐẶT ĐƠN <ArrowRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </aside>
    </div>
  );
};

export default TableMenuPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  LogOut,
  ShieldCheck,
  Table2,
  Utensils,
} from 'lucide-react';
import heroImage from '../assets/hero.png';

type StoredUser = {
  id?: string;
  full_name?: string;
  email?: string;
  role?: string;
};

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

const FEATURES = [
  {
    title: 'Digital Menu',
    description: 'Cập nhật thực đơn nhanh, phân loại rõ ràng, hiển thị đẹp trên mọi thiết bị.',
    icon: Utensils,
  },
  {
    title: 'KDS System',
    description: 'Đồng bộ đơn hàng sang bếp theo thời gian thực, giảm sai sót, tăng tốc độ phục vụ.',
    icon: ClipboardList,
  },
  {
    title: 'Table Management',
    description: 'Quản lý sơ đồ bàn trực quan: trống, có khách, đặt trước, chờ dọn dẹp.',
    icon: Table2,
  },
  {
    title: 'Real-time Analytics',
    description: 'Theo dõi doanh thu, top món bán chạy, hiệu suất ca làm và xu hướng theo thời gian.',
    icon: BarChart3,
  },
] as const;

const TESTIMONIALS = [
  {
    name: 'Nguyễn An An',
    role: 'Chủ nhà hàng',
    text: 'Quy trình order và bếp chạy mượt, nhân viên giảm thao tác, khách hài lòng hơn rõ rệt.',
    stars: 5,
  },
  {
    name: 'Trần Phúc',
    role: 'Quản lý vận hành',
    text: 'Sơ đồ bàn trực quan và báo cáo ca giúp đối soát nhanh, hạn chế nhầm lẫn.',
    stars: 5,
  },
  {
    name: 'Lê Trọng Nam',
    role: 'Bếp trưởng',
    text: 'Kitchen queue rõ ràng, ghi chú món lên bếp đầy đủ, giảm sai món khi đông khách.',
    stars: 5,
  },
] as const;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = safeParseUser(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#ef5b1b] text-white flex items-center justify-center font-bold">
              OR
            </div>
            <div className="font-extrabold text-gray-900">OrderRestaurant</div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <a href="#features" className="hover:text-[#ef5b1b] transition-colors">
              Hệ thống bếp
            </a>
            <a href="/admin/tables" className="hover:text-[#ef5b1b] transition-colors">
              Quản lý bàn
            </a>
            <a href="#reviews" className="hover:text-[#ef5b1b] transition-colors">
              Menu số
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-500">Xin chào</div>
              <div className="text-sm font-bold text-gray-900">
                {user?.full_name || 'Người dùng'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ef5b1b] hover:bg-[#d44d15] text-white font-bold shadow-sm transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-[#fff7f4]">
          <div className="max-w-6xl mx-auto px-4 pt-10 pb-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-xs font-extrabold text-[#ef5b1b] tracking-widest">
                  BY RESTOHUB
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
                  Nâng tầm <span className="text-[#ef5b1b]">nghệ thuật</span>
                  <br />
                  ẩm thực số
                </h1>
                <p className="mt-4 text-gray-600 leading-relaxed max-w-xl">
                  Tối ưu hóa quy trình vận hành nhà hàng từ order, bếp, bàn đến thanh toán.
                  Theo dõi thời gian thực và ra quyết định dựa trên dữ liệu.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button className="px-5 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors">
                    Bắt đầu ngay
                  </button>
                  <Link
                    to="/login"
                    className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold hover:bg-gray-50 transition-colors text-center"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-5 -left-5 w-28 h-28 rounded-3xl bg-orange-100 blur-xl" />
                <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
                  <img
                    src={heroImage}
                    alt="Restaurant"
                    className="w-full h-[320px] md:h-[420px] object-cover"
                    loading="eager"
                  />
                </div>

                <div className="absolute -left-4 -bottom-6 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ef5b1b] flex items-center justify-center font-extrabold">
                    +
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tăng hiệu suất</div>
                    <div className="text-sm font-extrabold text-gray-900">+35.8%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-sm font-extrabold text-gray-900">Giải pháp quản trị toàn diện</div>
              <p className="mt-2 text-gray-600">
                Mọi thứ bạn cần để vận hành nhà hàng hiệu quả: menu, bếp, bàn, đơn hàng và báo cáo.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ef5b1b] flex items-center justify-center">
                    <f.icon size={20} />
                  </div>
                  <div className="mt-4 font-extrabold text-gray-900">{f.title}</div>
                  <div className="mt-1 text-sm text-gray-600 leading-relaxed">{f.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="solutions" className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-2xl font-extrabold text-gray-900">
                  Vận hành mượt mà trên
                  <br />
                  mọi thiết bị
                </div>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Giao diện trực quan, phù hợp cho nhân viên phục vụ, bếp và quản lý. Hạn chế sai sót,
                  tăng tốc độ phục vụ, nâng trải nghiệm khách hàng.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ef5b1b] flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900">Quản lý vai trò</div>
                      <div className="text-sm text-gray-600">
                        Phân quyền rõ ràng: ADMIN, STAFF, CHEF, CUSTOMER theo nghiệp vụ.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ef5b1b] flex items-center justify-center">
                      <ClipboardList size={20} />
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900">Theo dõi đơn realtime</div>
                      <div className="text-sm text-gray-600">
                        Trạng thái cập nhật tức thì từ order → bếp → phục vụ → hoàn thành.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ef5b1b] flex items-center justify-center">
                      <Table2 size={20} />
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900">Sơ đồ bàn trực quan</div>
                      <div className="text-sm text-gray-600">
                        Trống, có khách, đặt trước, chờ dọn dẹp hiển thị rõ bằng màu sắc.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100">
                  <img
                    src={heroImage}
                    alt="Operations"
                    className="w-full h-[340px] md:h-[460px] object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-2xl font-extrabold text-gray-900">Khách hàng nói gì về chúng tôi?</div>
              <p className="mt-2 text-gray-600">
                Những phản hồi thực tế từ chủ nhà hàng, quản lý và đội bếp sau khi triển khai hệ thống.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center gap-1 text-orange-500">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <span key={idx} className="text-sm">★</span>
                    ))}
                  </div>
                  <div className="mt-3 text-gray-700 leading-relaxed">{t.text}</div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="font-extrabold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="rounded-3xl bg-gradient-to-br from-gray-950 to-gray-800 text-white p-8 md:p-12 overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#ef5b1b,transparent_35%),radial-gradient(circle_at_80%_70%,#f97316,transparent_35%)]" />
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold">
                    Sẵn sàng chuyển đổi số
                    <br />
                    cho nhà hàng của bạn?
                  </div>
                  <p className="mt-3 text-white/80 leading-relaxed">
                    Bắt đầu với quy trình order chuẩn hóa và mở rộng dần: menu, bàn, bếp, thanh toán,
                    loyalty và dashboard.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button className="px-5 py-3 rounded-xl bg-[#ef5b1b] hover:bg-[#d44d15] font-extrabold transition-colors">
                      Bắt đầu ngay
                    </button>
                    <button className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 font-extrabold transition-colors">
                      Nhận tư vấn
                    </button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="text-sm font-bold text-white/80">Roadmap triển khai</div>
                    <div className="mt-4 space-y-3 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef5b1b]" />
                        Auth + phân quyền
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef5b1b]" />
                        Menu + danh mục
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef5b1b]" />
                        Order + bếp + bàn
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ef5b1b]" />
                        Thanh toán + loyalty + analytics
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#ef5b1b] text-white flex items-center justify-center font-bold">
                    OR
                  </div>
                  <div className="font-extrabold text-gray-900">OrderRestaurant</div>
                </div>
                <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                  Hệ thống đặt món và quản trị nhà hàng hiện đại, tối ưu từ vận hành đến báo cáo.
                </div>
              </div>

              <div>
                <div className="font-extrabold text-gray-900">Liên kết</div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <a href="#features" className="block hover:text-[#ef5b1b]">Hệ thống bếp</a>
                  <a href="#solutions" className="block hover:text-[#ef5b1b]">Quản lý bàn</a>
                  <a href="#reviews" className="block hover:text-[#ef5b1b]">Menu số</a>
                </div>
              </div>

              <div>
                <div className="font-extrabold text-gray-900">Hỗ trợ</div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <div>Hotline: 1900 0000</div>
                  <div>Email: support@orderrestaurant.vn</div>
                  <div>Giờ làm việc: 8:00 - 22:00</div>
                </div>
              </div>

              <div>
                <div className="font-extrabold text-gray-900">Tài khoản</div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <Link to="/login" className="block hover:text-[#ef5b1b]">Đăng nhập</Link>
                  <Link to="/register" className="block hover:text-[#ef5b1b]">Đăng ký</Link>
                </div>
              </div>
            </div>

            <div className="mt-10 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} OrderRestaurant. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-[#ef5b1b]">Điều khoản</a>
                <a href="#" className="hover:text-[#ef5b1b]">Chính sách</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;

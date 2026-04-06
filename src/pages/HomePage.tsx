import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  LogOut,
  Menu,
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
    title: 'Menu số hiện đại',
    description:
      'Cập nhật thực đơn nhanh, phân loại rõ ràng, hiển thị đẹp trên mọi thiết bị.',
    icon: Utensils,
  },
  {
    title: 'KDS theo thời gian thực',
    description:
      'Đồng bộ đơn hàng sang bếp theo thời gian thực, giảm sai sót, tăng tốc độ phục vụ.',
    icon: ClipboardList,
  },
  {
    title: 'Sơ đồ bàn trực quan',
    description:
      'Quản lý sơ đồ bàn: trống, có khách, đặt trước, chờ dọn dẹp hiển thị rõ bằng màu sắc.',
    icon: Table2,
  },
  {
    title: 'Báo cáo thông minh',
    description:
      'Theo dõi doanh thu, top món bán chạy, hiệu suất ca làm và xu hướng theo thời gian.',
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
  const token = localStorage.getItem('token');
  const isAuthed = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef5b1b] text-sm font-extrabold text-white">
                OR
              </div>
              <div className="font-extrabold text-gray-900">OrderRestaurant</div>
            </div>

            <nav className="hidden items-center gap-7 text-sm font-semibold text-gray-700 md:flex">
              <a href="#features" className="transition-colors hover:text-[#ef5b1b]">
                Tính năng
              </a>
              <a href="#pricing" className="transition-colors hover:text-[#ef5b1b]">
                Giá
              </a>
              <Link to="/order" className="transition-colors text-[#ef5b1b] hover:text-[#d44d15]">
                Đặt món
              </Link>
              <a href="#about" className="transition-colors hover:text-[#ef5b1b]">
                Giới thiệu
              </a>
              <a href="#contact" className="transition-colors hover:text-[#ef5b1b]">
                Thông tin
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
              >
                <Menu size={18} />
              </button>

              {isAuthed ? (
                <>
                  <div className="hidden text-right sm:block">
                    <div className="text-xs text-gray-500">Xin chào</div>
                    <div className="text-sm font-extrabold text-gray-900">
                      {user?.full_name || 'Người dùng'}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#ef5b1b] px-4 py-2 font-extrabold text-white shadow-sm transition-colors hover:bg-[#d44d15]"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ef5b1b] px-4 py-2 font-extrabold text-white shadow-sm transition-colors hover:bg-[#d44d15]"
                >
                  Đăng nhập
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="bg-white">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fff3ed] to-white">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-12">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#ef5b1b]">
                  Orderrestaurant
                </div>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                  Kiến tạo nghệ
                  <br />
                  thuật ẩm thực số
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
                  Vận hành nhà hàng trơn tru từ tiếp nhận đơn, gửi bếp, quản lý bàn đến thanh
                  toán. Theo dõi theo thời gian thực và ra quyết định dựa trên dữ liệu.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/order')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef5b1b] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-200 transition-colors hover:bg-[#d44d15]"
                  >
                    Đặt món ngay
                    <ArrowRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(isAuthed ? '/staff/active-orders' : '/login')}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-extrabold text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    Dành cho quản lý
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-10 -top-12 h-48 w-48 rounded-full bg-orange-100 blur-2xl" />
                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                  <img
                    src={heroImage}
                    alt="Restaurant"
                    className="h-[320px] w-full object-cover md:h-[380px]"
                    loading="eager"
                  />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 backdrop-blur">
                    <div className="text-xs font-extrabold text-gray-900">
                      Nhà hàng hoạt động ổn định
                    </div>
                    <div className="mt-2 space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-[#ef5b1b]">
                          <Check size={14} />
                        </span>
                        Đồng bộ bếp theo thời gian thực
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-50 text-[#ef5b1b]">
                          <Check size={14} />
                        </span>
                        Quản lý bàn trực quan
                      </div>
                    </div>
                  </div>
                </div>

              
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5">
                <div className="text-2xl font-extrabold text-gray-900">
                  Tinh hoa công nghệ cho
                  <br />
                  mọi không gian ẩm thực
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Một bộ công cụ thống nhất cho nhân viên, bếp và quản lý. Tối ưu trải nghiệm cho
                  khách ngay từ lần đầu.
                </p>
              </div>
              <div className="hidden lg:col-span-7 lg:flex lg:justify-end">
                <div className="h-[2px] w-10 rounded-full bg-[#ef5b1b]" />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.slice(0, 3).map((f, idx) => {
                const isHighlight = idx === 1;
                return (
                  <div
                    key={f.title}
                    className={`rounded-2xl border p-6 shadow-sm transition-all ${
                      isHighlight
                        ? 'border-[#ef5b1b]/20 bg-[#ef5b1b] text-white shadow-orange-200'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isHighlight ? 'bg-white/15' : 'bg-orange-50 text-[#ef5b1b]'
                      }`}
                    >
                      <f.icon size={20} className={isHighlight ? 'text-white' : 'text-[#ef5b1b]'} />
                    </div>
                    <div className={`mt-4 text-base font-extrabold ${isHighlight ? 'text-white' : 'text-gray-900'}`}>
                      {f.title}
                    </div>
                    <div className={`mt-2 text-sm leading-relaxed ${isHighlight ? 'text-white/85' : 'text-gray-600'}`}>
                      {f.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div className="relative">
                <div className="absolute -left-6 -top-6 h-24 w-24 rounded-3xl bg-orange-100 blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                  <img
                    src={heroImage}
                    alt="Kitchen"
                    className="h-[340px] w-full object-cover md:h-[420px]"
                    loading="lazy"
                  />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-gray-900">
                  Một nền tảng.
                  <br />
                  Một nhịp bếp.
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Đồng bộ quy trình staff → bếp → bàn theo trạng thái rõ ràng. Ghi chú món, ưu tiên
                  và thông tin bàn được hiển thị nhất quán để tránh sai sót khi đông khách.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Tự động đẩy món vào hàng đợi bếp',
                    'Theo dõi tiến độ từng món theo trạng thái',
                    'Tổng tiền & ghi chú hiển thị rõ ràng',
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-[#ef5b1b]">
                        <Check size={14} />
                      </span>
                      <div className="text-sm font-semibold text-gray-700">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-gray-900">Câu chuyện từ khách hàng</div>
              <div className="mt-2 text-sm text-gray-600">
                Những phản hồi thực tế sau khi triển khai hệ thống.
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="flex items-center gap-1 text-orange-500">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <span key={idx} className="text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-gray-700">{t.text}</div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-950 to-gray-800 p-8 text-white md:p-12">
              <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                <div>
                  <div className="text-2xl font-extrabold md:text-3xl">
                    Sẵn sàng chuyển đổi số
                    <br />
                    cho nhà hàng của bạn?
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/80">
                    Bắt đầu từ quy trình order, đồng bộ bếp và quản lý bàn. Mở rộng dần sang thanh
                    toán, voucher, loyalty và dashboard.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navigate(isAuthed ? '/staff/table-map' : '/login')}
                      className="rounded-xl bg-[#ef5b1b] px-5 py-3 text-sm font-extrabold transition-colors hover:bg-[#d44d15]"
                    >
                      Bắt đầu ngay
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-extrabold transition-colors hover:bg-white/15"
                    >
                      Nhận tư vấn
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm font-extrabold text-white/80">Roadmap triển khai</div>
                  <div className="mt-4 space-y-3 text-sm text-white/80">
                    {[
                      'Auth + phân quyền',
                      'Menu + danh mục',
                      'Order + bếp + bàn',
                      'Thanh toán + loyalty + analytics',
                    ].map((line) => (
                      <div key={line} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#ef5b1b]" />
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer id="contact" className="border-t border-gray-100 py-10">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ef5b1b] text-sm font-extrabold text-white">
                    OR
                  </div>
                  <div className="font-extrabold text-gray-900">OrderRestaurant</div>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-gray-600">
                  Hệ thống đặt món và quản trị nhà hàng hiện đại, tối ưu từ vận hành đến báo cáo.
                </div>
              </div>

              <div>
                <div className="font-extrabold text-gray-900">Liên kết</div>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <a href="#features" className="block hover:text-[#ef5b1b]">
                    Tính năng
                  </a>
                  <a href="#about" className="block hover:text-[#ef5b1b]">
                    Giới thiệu
                  </a>
                  <a href="#reviews" className="block hover:text-[#ef5b1b]">
                    Khách hàng
                  </a>
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
                  <Link to="/login" className="block hover:text-[#ef5b1b]">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="block hover:text-[#ef5b1b]">
                    Đăng ký
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} OrderRestaurant. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-[#ef5b1b]">
                  Điều khoản
                </a>
                <a href="#" className="hover:text-[#ef5b1b]">
                  Chính sách
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default HomePage;

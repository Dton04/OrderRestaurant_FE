import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Star,
  Users,
  AlertCircle,
  Info,
  TriangleAlert
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const stats = [
    { label: 'DOANH THU HÔM NAY', value: '15.250.000đ', icon: TrendingUp, change: '+12.5%', color: 'bg-green-50 text-green-600', trendColor: 'text-green-500' },
    { label: 'SỐ LƯỢNG ĐƠN HÀNG', value: '142', icon: ShoppingBag, change: '-2.1%', color: 'bg-orange-50 text-orange-600', trendColor: 'text-red-500' },
    { label: 'MÓN BÁN CHẠY NHẤT', value: 'Phở Bò Kobe', icon: Star, change: 'Top 1', color: 'bg-yellow-50 text-yellow-600', trendColor: 'text-yellow-500' },
    { label: 'HIỆU SUẤT NV', value: '88%', icon: Users, change: '+5%', color: 'bg-blue-50 text-blue-600', trendColor: 'text-blue-500' },
  ];

  const alerts = [
    { type: 'error', icon: AlertCircle, title: 'Hết nguyên liệu', desc: 'Thịt bò Kobe chỉ còn 2kg, cần nhập thêm ngay.', color: 'border-red-100 bg-red-50 text-red-600' },
    { type: 'info', icon: Info, title: 'Cập nhật Menu', desc: 'Sẽ có 3 món mới được áp dụng vào ngày mai.', color: 'border-blue-100 bg-blue-50 text-blue-600' },
    { type: 'warning', icon: TriangleAlert, title: 'Bảo trì hệ thống', desc: 'Hệ thống thanh toán bảo trì vào lúc 23:00.', color: 'border-orange-100 bg-orange-50 text-orange-600' },
  ];

  const staff = [
    { name: 'Nguyễn Văn An', role: 'Phục vụ', time: '08:00 AM', status: 'Đang làm', color: 'text-green-600 bg-green-50' },
    { name: 'Lê Thị Bình', role: 'Bếp trưởng', time: '07:30 AM', status: 'Đang làm', color: 'text-green-600 bg-green-50' },
    { name: 'Trần Hoàng Long', role: 'Thu ngân', time: '08:00 AM', status: 'Nghỉ giữa ca', color: 'text-orange-600 bg-orange-50' },
  ];

  const topDishes = [
    { name: 'Phở Bò Kobe', percentage: 42, color: 'bg-orange-500' },
    { name: 'Bún Chả Hà Nội', percentage: 28, color: 'bg-orange-400' },
    { name: 'Gỏi Cuốn Tôm', percentage: 15, color: 'bg-orange-300' },
    { name: 'Khác', percentage: 15, color: 'bg-gray-200' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Chào buổi sáng, Admin</h2>
        <p className="text-gray-400 text-xs mt-0.5 opacity-80">Hệ thống đang hoạt động ổn định.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className={`text-[10px] font-bold ${item.trendColor}`}>{item.change}</span>
            </div>
            <p className="text-gray-400 text-[9px] font-bold tracking-widest mb-0.5 uppercase">{item.label}</p>
            <p className="text-lg font-black text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 text-sm">Xu hướng doanh thu (7 ngày)</h3>
              <select className="text-[10px] border-none bg-gray-50 rounded-lg px-2 py-1 outline-none font-bold">
                <option>Tuần này</option>
                <option>Tháng này</option>
              </select>
            </div>
            <div className="flex items-end justify-between h-40 gap-1.5">
              {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                  <div className="flex flex-col-reverse w-full bg-gray-50 rounded h-full overflow-hidden">
                    <div
                      className="bg-orange-200 group-hover:bg-orange-300 transition-colors rounded-t-[1px]"
                      style={{ height: `${h}%` }}
                    ></div>
                    <div
                      className="bg-orange-50 transition-colors"
                      style={{ height: `${h / 2}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">T{i + 2}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-gray-800 text-sm">Nhân viên trong ca</h3>
              <button className="text-orange-600 text-[10px] font-bold hover:underline">Tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="pb-3 text-left">Nhân viên</th>
                    <th className="pb-3">Vị trí</th>
                    <th className="pb-3">Bắt đầu</th>
                    <th className="pb-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {staff.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                      <td className="py-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-100"></div>
                        <span className="font-bold text-gray-700">{s.name}</span>
                      </td>
                      <td className="py-3 text-gray-500 font-medium">{s.role}</td>
                      <td className="py-3 text-gray-400 font-bold">{s.time}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter ${s.color}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-4">Thông báo</h3>
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg border-l-[3px] ${a.color} space-y-0.5 shadow-sm shadow-gray-100/10`}>
                  <div className="flex items-center gap-2">
                    <a.icon size={14} />
                    <h4 className="font-black text-[10px] truncate">{a.title}</h4>
                  </div>
                  <p className="text-[10px] leading-tight opacity-75 font-medium">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-5">Món ăn bán chạy</h3>
            <div className="space-y-4">
              {topDishes.map((dish, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-gray-700">{dish.name}</span>
                    <span className="text-gray-400">{dish.percentage}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className={`h-full ${dish.color} rounded-full`} style={{ width: `${dish.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 border border-orange-100 rounded-xl text-orange-600 text-[10px] font-black hover:bg-orange-50 transition-all uppercase tracking-widest">
              Báo cáo chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

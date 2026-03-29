import React, { useState } from 'react';
import { ArrowLeft, Grip, Users, AlignLeft, ArrowRight, Home, FileText, Bell, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<string>('10');
  const [guestCount, setGuestCount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const tables = [
    { id: '10', label: '10', status: 'FREE' },
    { id: '08', label: '08', status: 'FREE' },
    { id: '09', label: '09', status: 'FREE' },
    { id: '11', label: '11', status: 'FREE' },
    { id: '12', label: '12', status: 'FREE' },
    { id: 'vip1', label: 'VIP 1', status: 'FREE' },
    { id: 'vip2', label: 'VIP 2', status: 'FREE' },
    { id: '15', label: '15', status: 'FREE' },
  ];

  const quickTags = ['VIP GUEST', 'GHẾ TRẺ EM', 'HẸN TRƯỚC'];

  const handleTagClick = (tag: string) => {
    setNote((prev) => (prev ? `${prev}, ${tag}` : tag));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans pb-24">
      {/* Header */}
      <header className="px-5 py-5 flex items-center justify-between bg-[#f8f9fa] sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#983424] hover:bg-red-50 rounded-full transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-extrabold text-[#983424]">Mở đơn tại bàn</h1>
        </div>
        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-semibold text-gray-700">Nhân viên: Trần Văn A</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-2 pb-6">
        <div className="mb-8">
          <h2 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight leading-none mb-3">Bắt đầu phục vụ</h2>
          <p className="text-gray-500 text-[15px] leading-relaxed pr-8">
            Chọn bàn trống và nhập thông tin để bắt đầu đơn hàng mới.
          </p>
        </div>

        {/* Table Map */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Grip size={22} className="text-gray-800" strokeWidth={2.5} />
              <h3 className="font-extrabold text-lg text-gray-900">Sơ đồ bàn trống</h3>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>
                <span>Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ef5b1b]"></div>
                <span>Đang chọn</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            {tables.map((table) => {
              const isSelected = selectedTable === table.id;
              return (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`relative flex flex-col items-center justify-center py-5 rounded-2xl transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#ef5b1b] shadow-lg shadow-orange-500/40 border border-transparent'
                      : 'bg-white border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md'
                  }`}
                >
                  <span
                    className={`text-xl font-extrabold ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {table.label}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold mt-1.5 tracking-widest ${
                      isSelected ? 'text-orange-100' : 'text-gray-400'
                    }`}
                  >
                    {table.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice Info */}
        <div className="bg-[#fcf5eb] border border-[#f3e6d5] rounded-[1.25rem] p-4 flex gap-3.5 mb-8">
          <div className="mt-0.5">
            <div className="w-6 h-6 rounded-full bg-[#8c6536] text-white flex items-center justify-center font-serif italic text-sm font-bold shadow-sm">
              i
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#4a361c] text-[15px] mb-1">Lưu ý cho nhân viên</h4>
            <p className="text-[13px] text-[#7a6042] leading-relaxed pr-2">
              Chỉ chọn những bàn hiển thị trạng thái 'FREE'. Nếu bàn có khách cũ chưa thanh toán, vui lòng kiểm tra lại 'Sơ đồ bàn'.
            </p>
          </div>
        </div>

        {/* Order Details Form */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-50/50 relative overflow-hidden">
          <h3 className="text-[1.35rem] font-extrabold text-gray-900 mb-6">Chi tiết đơn hàng</h3>

          <div className="space-y-6">
            {/* Selected Table Display */}
            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold text-gray-500 tracking-widest uppercase mb-1.5 ml-0.5">
                  Bàn đã chọn
                </div>
                <div className="text-3xl font-extrabold text-[#983424]">
                  Bàn {tables.find((t) => t.id === selectedTable)?.label || '—'}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2 border border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[11px] font-bold text-gray-800 tracking-widest">FREE</span>
              </div>
            </div>

            {/* Guest Count */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 tracking-widest uppercase mb-2.5 ml-1">
                Số lượng khách
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#ef5b1b]">
                  <Users size={20} className="text-gray-400 group-focus-within:text-[#ef5b1b] transition-colors" />
                </div>
                <input
                  type="number"
                  placeholder="Ví dụ: 6"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full bg-gray-100 border border-transparent rounded-2xl py-4 pl-12 pr-4 text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 focus:border-orange-200 focus:ring-4 focus:ring-orange-100/50 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 tracking-widest uppercase mb-2.5 ml-1">
                Ghi chú phục vụ
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                  <AlignLeft size={20} className="text-gray-400 group-focus-within:text-[#ef5b1b] transition-colors" />
                </div>
                <textarea
                  placeholder="Khách đoàn 6 người, cần thêm ghế trẻ em..."
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-100 border border-transparent rounded-2xl pt-4 pb-4 pl-12 pr-4 text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 focus:border-orange-200 focus:ring-4 focus:ring-orange-100/50 focus:bg-white transition-all resize-none outline-none leading-relaxed"
                />
              </div>
              <div className="flex flex-wrap gap-2.5 mt-4">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 rounded-full text-[11px] font-extrabold tracking-wider transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 text-center pb-2">
              <button className="w-full bg-[#ef5b1b] hover:bg-[#e04a09] active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl shadow-[0_8px_25px_-8px_rgba(239,91,27,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(239,91,27,0.7)] transition-all flex items-center justify-center gap-3 text-lg group">
                MỞ ĐƠN HÀNG <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <div className="text-[10px] font-extrabold text-gray-400 tracking-widest mt-4 uppercase">
                Hệ thống sẽ ghi nhận lúc: {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-2.5 pb-safe shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] z-50">
        <button className="flex flex-col items-center p-2 text-[#ef5b1b] relative group w-16">
          <div className="bg-orange-50 w-full md:w-14 h-9 rounded-xl flex items-center justify-center absolute -top-1 z-0 transition-transform group-active:scale-95"></div>
          <Home size={24} className="relative z-10" />
          <span className="text-[11px] font-extrabold mt-1.5 relative z-10">Sơ đồ bàn</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600 transition-colors w-16 group active:scale-95">
          <FileText size={24} />
          <span className="text-[11px] font-semibold mt-1.5">Đơn hàng</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600 transition-colors relative w-16 group active:scale-95">
          <Bell size={24} />
          <span className="absolute top-2 right-4 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          <span className="text-[11px] font-semibold mt-1.5">Thông báo</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-400 hover:text-gray-600 transition-colors w-16 group active:scale-95">
          <Settings size={24} />
          <span className="text-[11px] font-semibold mt-1.5">Cài đặt</span>
        </button>
      </nav>
      
      {/* SafeArea Padding for newer iPhones */}
      <div className="h-6 bg-white fixed bottom-0 left-0 right-0 z-40 block sm:hidden"></div>
    </div>
  );
};

export default ServePage;

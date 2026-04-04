import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, User, CheckCircle2 } from 'lucide-react';

const ChefDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [stats, setStats] = useState({ waiting: 12, cooking: 5, completed: 48 });

  // Handle Hoàn tất đơn hàng
  const handleCompleteOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      // 1. Gửi tin (Gọi API PATCH)
      await axios.patch(`http://localhost:3000/orders/${orderId}/status`, 
        { status: 'READY' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Dọn dẹp (Lọc bỏ đơn hàng khỏi state)
      // Ép kiểu String để đảm bảo chắn chắn khớp ID
      setOrders(prevOrders => prevOrders.filter((o: any) => String(o._id) !== String(orderId) && String(o.id) !== String(orderId)));

      // Thông báo thành công
      alert(`Đã hoàn tất đơn hàng #${orderId} thành công!`);

      // 3. Nhảy số (Giả định đơn đang ở trạng thái 'Đang nấu' chuyển thành 'Xong')
      setStats(prev => ({
        ...prev,
        cooking: prev.cooking > 0 ? prev.cooking - 1 : 0, 
        completed: prev.completed + 1
      }));
    } catch (error) {
      console.error("Lỗi khi hoàn tất đơn hàng:", error);
      alert("Lỗi kết nối máy chủ! Chưa thể hoàn tất đơn.");
    }
  };

  // Lọc đơn hàng theo Tab
  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Phòng VIP') return order?.table?.area === 'VIP';
    if (activeTab === 'Mang về') return order?.type === 'take-away' || order?.isTakeAway === true;
    return true;
  });

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

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        // Lấy Token từ localStorage để không bị lỗi 401 Unauthorized
        // Ghi chú: App đang dùng key 'token' thay vì 'access_token' nên ưu tiên 'token' trước
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');

        const response = await axios.get('http://localhost:3000/orders/active', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Cập nhật danh sách đơn hàng vào State
        setOrders(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        setIsLoading(false);
      }
    };

    fetchActiveOrders();
  }, []); // [] đảm bảo chỉ chạy 1 lần duy nhất khi load trang

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
            filteredOrders.map((order: any) => {
              // Phân loại thẻ:
              const isTakeaway = order.order_type === 'TAKE_AWAY' || order.type === 'take-away' || order.isTakeAway;
              const waitClass = getWaitTimeClass(order.created_at || order.createdAt);
              const isHighPriority = waitClass.includes('red'); // Nếu quá 10 phút => Ưu tiên cao

              let tagText = "ĐƠN MỚI";
              let tagColor = "text-gray-500";
              let borderColor = "border-gray-100";
              let sideBorder = null;
              let statusText = "ĐANG CHUẨN BỊ";
              let statusBg = "bg-[#ffba08]";

              if (isTakeaway) {
                tagText = "MANG VỀ";
              } else if (isHighPriority) {
                tagText = "ƯU TIÊN CAO";
                tagColor = "text-red-600";
                borderColor = "border-red-100";
                sideBorder = <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>;
                statusText = "CHỜ NẤU GẤP";
                statusBg = "bg-[#ef4444]";
              }

              return (
                <div key={order.id || order._id} className={`bg-white rounded-3xl p-6 shadow-sm border ${borderColor} flex flex-col h-full relative overflow-hidden`}>
                  {sideBorder}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${tagColor}`}>{tagText}</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">
                        {isTakeaway ? `#ORDER-${order.id}` : `Bàn #${order.table_id || order.table?.id || '?'}`}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className={`text-sm font-bold flex items-center gap-1 justify-end mt-1 ${waitClass}`}>
                        {Math.floor((new Date().getTime() - new Date(order.created_at || order.createdAt || Date.now()).getTime()) / 60000)} phút
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                    {/* Render các món ăn trong đơn */}
                    {(order.order_items || order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold shrink-0 ${isTakeaway ? 'bg-[#fcece6] text-[#ef5b1b]' : 'bg-[#f4f5f6] text-gray-600'}`}>
                          x{item.quantity || 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight w-2/3">
                              {item.dish?.name || item.name || 'Tên món'}
                            </h4>
                            <span className="text-sm font-bold bg-[#EAEAEA] px-2 py-0.5 rounded-full text-gray-700 whitespace-nowrap">
                              VNĐ {((item.price || item.dish?.price || item.final_amount || 0) / 1000)}k
                            </span>
                          </div>
                          {/* Nhiệm vụ 11: Hiển thị ghi chú với highlight từ khóa quan trọng */}
                          {(item.note || item.notes) && (() => {
                            const noteText = item.note || item.notes;
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
                                <span>⚠️</span>
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
                    {!(order.order_items || order.items)?.length && (
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
                      onClick={() => handleCompleteOrder(order.id || order._id)}
                      className="w-full bg-[#ef5b1b] hover:bg-[#d44d15] text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors active:scale-95"
                    >
                      <CheckCircle2 size={20} />
                      Xác nhận hoàn tất
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

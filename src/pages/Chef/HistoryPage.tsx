import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Bell, User, CheckCircle } from 'lucide-react';

const ChefHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Lọc đơn hàng theo Tab
  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Phòng VIP') return order?.table?.area === 'VIP';
    if (activeTab === 'Mang về') return order?.type === 'take-away' || order?.isTakeAway === true;
    return true;
  });

  useEffect(() => {
    const fetchHistoryOrders = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token'); 
        
        const response = await axios.get('http://localhost:3000/orders/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setOrders(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
        setIsLoading(false);
      }
    };

    fetchHistoryOrders();
  }, []);

  return (
    <div className="flex flex-col h-full relative pb-10">
      {/* Topbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold text-gray-900">Lịch sử Đơn hàng</h2>
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Đã hoàn tất
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm lịch sử..." 
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
            <h1 className="text-3xl font-extrabold text-gray-900">Đơn Hàng Đã Xong</h1>
            <p className="text-gray-500 mt-1">Tra cứu nhanh các đơn món dã chuẩn bị và phục vụ thành công.</p>
          </div>
          
          <div className="flex bg-[#F1F3F5] rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('Tất cả')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${
                activeTab === 'Tất cả' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab('Phòng VIP')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${
                activeTab === 'Phòng VIP' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              Phòng VIP
            </button>
            <button 
              onClick={() => setActiveTab('Mang về')}
              className={`px-6 py-2 rounded-md transition-all text-sm ${
                activeTab === 'Mang về' ? 'bg-white shadow-sm font-bold text-[#ef5b1b]' : 'font-medium text-gray-600 hover:text-gray-900 bg-transparent'
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
              Đang tải lịch sử...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500 font-bold">
              Chưa có đơn hàng nào trong lịch sử.
            </div>
          ) : (
            filteredOrders.map((order: any) => {
              const isTakeaway = order.order_type === 'TAKE_AWAY' || order.type === 'take-away' || order.isTakeAway;

              let tagText = "ĐÃ PHỤC VỤ";
              let tagColor = "text-gray-500";
              let borderColor = "border-gray-200";

              if (isTakeaway) {
                tagText = "MANG VỀ ĐÃ GIAO";
              }

              return (
                <div key={order.id || order._id} className={`bg-white rounded-3xl p-6 shadow-sm border ${borderColor} flex flex-col h-full relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity`}>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${tagColor}`}>{tagText}</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">
                        {isTakeaway ? `#ORDER-${order.id}` : `Bàn #${order.table_id || order.table?.id || '?'}`}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm font-bold text-gray-500 flex items-center gap-1 justify-end mt-1">
                        {new Date(order.created_at || order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            <h4 className="font-bold text-gray-600 text-lg leading-tight w-2/3">
                              {item.dish?.name || item.name || 'Tên món'}
                            </h4>
                            <span className="text-sm font-bold bg-[#EAEAEA] px-2 py-0.5 rounded-full text-gray-500 whitespace-nowrap">
                              VNĐ {((item.price || item.dish?.price || item.final_amount || 0) / 1000)}k
                            </span>
                          </div>
                          {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                        </div>
                      </div>
                    ))}
                    
                    {!(order.order_items || order.items)?.length && (
                      <p className="text-sm text-gray-400 italic">Dữ liệu món ăn trống</p>
                    )}
                  </div>

                  <div className="mt-auto border-t border-gray-100 pt-5">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                      <CheckCircle size={20} />
                      <span className="text-sm uppercase tracking-wider">Hoàn tất thành công</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefHistoryPage;

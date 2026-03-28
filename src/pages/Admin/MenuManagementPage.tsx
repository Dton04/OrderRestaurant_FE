import React from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit2, 
  Trash2,
  ChevronRight,
  ArrowUpDown,
  ChevronLeft
} from 'lucide-react';

const MenuManagementPage: React.FC = () => {
  const dishes = [
    { id: 'MENU-001', name: 'Salad Cá Ngừ Đại Dương', category: 'Khai vị', price: '185,000', status: 'Còn hàng', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
    { id: 'MENU-042', name: 'Sườn Bò Nướng Tảng BBQ', category: 'Món chính', price: '520,000', status: 'Còn hàng', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop' },
    { id: 'MENU-089', name: 'Atelier Sunset Cocktail', category: 'Đồ uống', price: '145,000', status: 'Hết hàng', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&h=100&fit=crop' },
    { id: 'MENU-112', name: 'Premium Sushi Platter', category: 'Món chính', price: '890,000', status: 'Còn hàng', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&h=100&fit=crop' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-500 text-sm">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-1.5 text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">
            <span>Quản trị</span>
            <span>›</span>
            <span className="text-orange-600">Thực đơn</span>
          </nav>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Quản lý Thực đơn</h2>
          <p className="text-gray-400 text-xs mt-0.5 opacity-80">Danh sách món ăn và trạng thái phục vụ.</p>
        </div>
        <button className="flex items-center gap-2 bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-800 transition-all shadow-md shadow-orange-100 text-xs">
          <Plus size={16} />
          Thêm món mới
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3 items-center flex-1">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Tìm tên món ăn..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-[11px] focus:ring-1 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black hover:bg-gray-100 transition-colors uppercase tracking-tight">
              <Filter size={14} />
              <span>Tất cả danh mục</span>
              <ChevronRight size={12} className="rotate-90" />
            </button>
          </div>
          <div className="flex gap-1.5">
            <button className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowUpDown size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="pb-4">Hình ảnh</th>
                <th className="pb-4">Tên món</th>
                <th className="pb-4">Danh mục</th>
                <th className="pb-4">Giá (VND)</th>
                <th className="pb-4">Trạng thái</th>
                <th className="pb-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {dishes.map((dish) => (
                <tr key={dish.id} className="border-t border-gray-50 group hover:bg-gray-50/40 transition-colors">
                  <td className="py-3">
                    <img src={dish.image} alt={dish.name} className="w-10 h-10 rounded-lg object-cover shadow-sm bg-gray-100 grayscale hover:grayscale-0 transition-all duration-500" />
                  </td>
                  <td className="py-3">
                    <p className="font-black text-gray-800">{dish.name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5 font-bold tracking-tight">ID: {dish.id}</p>
                  </td>
                  <td className="py-3 font-bold">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[9px] font-black uppercase">
                      {dish.category}
                    </span>
                  </td>
                  <td className="py-3 font-black text-gray-700">{dish.price}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight ${
                      dish.status === 'Còn hàng' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${dish.status === 'Còn hàng' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {dish.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-5 border-t border-gray-50 text-[10px] font-bold">
          <p className="text-gray-400">Hiển thị <span className="text-gray-700">1-10</span> / <span className="text-gray-700">45</span> món</p>
          <div className="flex gap-1.5">
            <button className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3, '...', 5].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg transition-all ${
                p === 1 ? 'bg-orange-700 text-white shadow shadow-orange-100' : 'text-gray-500 hover:bg-gray-50'
              }`}>
                {p}
              </button>
            ))}
            <button className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex gap-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            HỆ THỐNG: ỔN ĐỊNH
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
            CẬP NHẬT CUỐI: 2 PHÚT TRƯỚC
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">© 2024 Culinary Atelier Group. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default MenuManagementPage;

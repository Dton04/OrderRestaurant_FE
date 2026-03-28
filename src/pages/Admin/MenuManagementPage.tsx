import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit2, 
  Trash2,
  ChevronRight,
  ArrowUpDown,
  ChevronLeft,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { dishApi } from '../../api/dish';
import { categoryApi } from '../../api/category';
import type { Dish } from '../../types/dish';
import type { Category } from '../../types/category';

const MenuManagementPage: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [dishData, catData] = await Promise.all([
        dishApi.findAll(),
        categoryApi.findAll()
      ]);
      setDishes(dishData);
      setCategories(catData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError('Không thể tải dữ liệu thực đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || `ID: ${id}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 className="animate-spin text-orange-600" size={32} />
            <p className="text-xs font-black uppercase tracking-widest">Đang tải món ăn...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center space-y-3">
            <p className="text-red-600 font-bold">{error}</p>
            <button 
              onClick={fetchMenuData}
              className="px-6 py-2 bg-white border border-red-100 rounded-xl text-[10px] font-black uppercase text-red-600 hover:bg-red-100 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : (
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
                      {dish.image_url ? (
                        <img src={dish.image_url} alt={dish.name} className="w-10 h-10 rounded-lg object-cover shadow-sm bg-gray-100 grayscale hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-200">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <p className="font-black text-gray-800">{dish.name}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5 font-bold tracking-tight">ID: MENU-{dish.id.toString().padStart(3, '0')}</p>
                    </td>
                    <td className="py-3 font-bold">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[9px] font-black uppercase">
                        {getCategoryName(dish.category_id as number)}
                      </span>
                    </td>
                    <td className="py-3 font-black text-gray-700">{formatPrice(dish.price)}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight ${
                        dish.is_available !== false ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${dish.is_available !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {dish.is_available !== false ? 'Còn hàng' : 'Hết hàng'}
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
        )}

        <div className="flex justify-between items-center pt-5 border-t border-gray-50 text-[10px] font-bold">
          <p className="text-gray-400">Hiển thị <span className="text-gray-700">1-{dishes.length}</span> / <span className="text-gray-700">{dishes.length}</span> món</p>
          <div className="flex gap-1.5">
            <button className="p-1.5 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {[1].map((p, i) => (
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
            CẬP NHẬT CUỐI: VỪA XONG
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">© 2024 Culinary Atelier Group. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default MenuManagementPage;

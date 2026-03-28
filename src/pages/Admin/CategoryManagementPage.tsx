import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Layers, Loader2, Trash2 } from 'lucide-react';
import { categoryApi } from '../../api/category';
import { dishApi } from '../../api/dish';
import type { Category } from '../../types/category';
import type { Dish } from '../../types/dish';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, dishData] = await Promise.all([
        categoryApi.findAll(),
        dishApi.findAll()
      ]);
      setCategories(catData);
      setDishes(dishData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch category data:', err);
      setError('Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDishCount = (catId: number) => {
    return dishes.filter(d => d.category_id === catId).length;
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-500 text-sm">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex gap-1.5 text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">
            <span>Quản trị</span>
            <span>›</span>
            <span className="text-orange-600">Danh mục</span>
          </nav>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Danh mục Món ăn</h2>
          <p className="text-gray-400 text-xs mt-0.5 opacity-80">Quản lý các nhóm thực đơn.</p>
        </div>
        <button className="flex items-center gap-1.5 bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-800 transition-all shadow shadow-orange-100 text-[11px] tracking-tight uppercase">
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 className="animate-spin text-orange-600" size={32} />
          <p className="text-xs font-black uppercase tracking-widest">Đang tải danh mục...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center space-y-3">
          <p className="text-red-600 font-bold">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-white border border-red-100 rounded-xl text-[10px] font-black uppercase text-red-600 hover:bg-red-100 transition-colors"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer shadow-sm">
              <div className="aspect-[16/9] bg-orange-50 relative overflow-hidden flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <Layers className="text-orange-200" size={48} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-3 right-3 z-20 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-600 transition-colors shadow-sm">
                    <Edit2 size={12} />
                  </button>
                  <button className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-red-600 transition-colors shadow-sm">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-white relative">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-black text-gray-800 tracking-tight text-base">{cat.name}</h3>
                  <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-orange-100/50">
                    {getDishCount(cat.id)} món
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2 min-h-[30px]">
                  {cat.description || 'Chưa có mô tả cho danh mục này.'}
                </p>
              </div>
            </div>
          ))}
          <button className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 text-gray-300 hover:border-orange-100 hover:text-orange-400 transition-all group min-h-[200px]">
            <div className="w-10 h-10 rounded-full border border-dashed border-gray-100 flex items-center justify-center group-hover:border-orange-100 transition-all">
              <Plus size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Thêm mới</span>
          </button>
        </div>
      )}

      <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100 flex gap-3 items-center">
        <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm border border-gray-100">
          <Layers size={18} />
        </div>
        <p className="text-[11px] text-gray-500 font-medium italic">
          Các món ăn được gán vào danh mục sẽ hiển thị tương ứng trong menu của khách hàng.
        </p>
      </div>
    </div>
  );
};

export default CategoryManagementPage;

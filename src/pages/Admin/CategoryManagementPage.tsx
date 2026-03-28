import React from 'react';
import { Plus, Edit2, Layers } from 'lucide-react';

const CategoryManagementPage: React.FC = () => {
  const categories = [
    { id: 1, name: 'Khai vị', desc: 'Các món nhẹ kích thích vị giác', count: 12, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop' },
    { id: 2, name: 'Món chính', desc: 'Các món ăn no phục vụ tại bàn', count: 24, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=200&fit=crop' },
    { id: 3, name: 'Đồ uống', desc: 'Nước ép, Cocktail và Rượu vang', count: 8, image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=200&fit=crop' },
    { id: 4, name: 'Tráng miệng', desc: 'Bánh ngọt và trái cây tươi', count: 6, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=200&fit=crop' },
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer">
            <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
              <div className="absolute top-3 right-3 z-20 flex gap-1 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-orange-600 transition-colors shadow-sm">
                  <Edit2 size={12} />
                </button>
              </div>
              <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                <Layers className="text-orange-200" size={32} />
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1.5">
                <h3 className="font-black text-gray-800 tracking-tight">{cat.name}</h3>
                <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{cat.count} món</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed line-clamp-2">{cat.desc}</p>
            </div>
          </div>
        ))}
        <button className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 text-gray-300 hover:border-orange-100 hover:text-orange-400 transition-all group">
          <div className="w-10 h-10 rounded-full border border-dashed border-gray-100 flex items-center justify-center group-hover:border-orange-100 transition-all">
            <Plus size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Thêm mới</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryManagementPage;

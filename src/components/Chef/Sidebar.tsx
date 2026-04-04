import React from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, History, ChefHat } from 'lucide-react';

const ChefSidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#F8F9FA] border-r border-[#EAEAEA] flex flex-col pt-8 pb-6 px-4 z-40">
      <div className="mb-12 px-2">
        <h1 className="text-xl font-bold text-[#b43516]">Bếp Chuyên nghiệp</h1>
        <p className="text-xs text-gray-500 mt-1">Người Quản lý Ẩm thực</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink
          to="/chef/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <UtensilsCrossed size={20} />
          <span>Đơn hàng Đang hoạt động</span>
        </NavLink>
        
        <NavLink
          to="/chef/history"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <History size={20} />
          <span>Lịch sử</span>
        </NavLink>

      </nav>

      <div className="mt-auto">
        <div className="bg-white p-3 py-4 rounded-2xl flex items-center gap-3 shadow-sm border border-[#EAEAEA]">
          <div className="w-10 h-10 rounded-full bg-[#fceee9] text-[#ef5b1b] flex items-center justify-center shrink-0">
            <ChefHat size={20} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">Bếp trưởng</div>
            <div className="font-bold text-sm text-gray-900 truncate">Andre</div>
            <div className="text-[11px] text-gray-500 truncate mt-0.5">Trưởng bộ phận Bếp</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChefSidebar;

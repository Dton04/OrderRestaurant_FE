import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';

const AdminHeader: React.FC = () => {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10 ml-60 transition-all text-xs">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm hệ thống..." 
            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-xl text-[11px] focus:ring-1 focus:ring-orange-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-full relative transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Settings size={18} />
        </button>
        <div className="h-6 w-px bg-gray-100 mx-1"></div>
        <div className="flex items-center gap-2 pl-1">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-gray-800 leading-none">Admin User</p>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

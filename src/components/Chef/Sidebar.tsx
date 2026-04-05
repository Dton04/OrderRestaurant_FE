import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  History,
  ChefHat,
  Settings,
  LogOut,
  NotebookText,
} from 'lucide-react';

const ChefSidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#EAEAEA] bg-[#F8F9FA] px-4 pb-6 pt-8">
      <div className="mb-12 px-2">
        <h1 className="text-xl font-bold text-[#b43516]">Atelier Kitchen</h1>
        <p className="mt-1 text-xs text-gray-500">Main Kitchen</p>
      </div>

      <nav className="flex-1 space-y-2">
        <NavLink
          to="/chef/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <UtensilsCrossed size={20} />
          <span>Don dang hoat dong</span>
        </NavLink>

        <NavLink
          to="/chef/preparation"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <NotebookText size={20} />
          <span>Che bien va ghi chu</span>
        </NavLink>

        <NavLink
          to="/chef/history"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <History size={20} />
          <span>Lich su</span>
        </NavLink>

        <NavLink
          to="/chef/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${
              isActive
                ? 'bg-white text-[#b43516] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Settings size={20} />
          <span>Cai dat</span>
        </NavLink>
      </nav>

      <div className="mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-red-600"
        >
          <LogOut size={20} />
          <span>Dang xuat</span>
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-[#EAEAEA] bg-white p-3 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fceee9] text-[#ef5b1b]">
            <ChefHat size={20} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-gray-900">Bep truong</div>
            <div className="truncate text-sm font-bold text-gray-900">Andre</div>
            <div className="mt-0.5 truncate text-[11px] text-gray-500">Truong bo phan bep</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChefSidebar;

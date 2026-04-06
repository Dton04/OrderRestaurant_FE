import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { History, ChefHat, Settings, LogOut } from 'lucide-react';

const ChefSidebar: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 w-20 h-screen bg-white border-r border-zinc-100 flex flex-col items-center py-8 z-40 transition-all shadow-sm">
      <div 
        onClick={() => navigate('/')}
        className="mb-10 w-12 h-12 bg-[#AC3509] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#AC3509]/20 cursor-pointer active:scale-95 transition-all"
      >
        A
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        <NavLink
          to="/chef/dashboard"
          title="KDS Dashboard"
          className={({ isActive }) =>
            `p-3 rounded-2xl transition-all flex items-center justify-center ${
              isActive
                ? 'bg-[#FCECE6] text-[#AC3509] shadow-sm'
                : 'text-zinc-400 hover:text-[#AC3509]'
            }`
          }
        >
          <ChefHat size={24} />
        </NavLink>
        
        <NavLink
          to="/chef/history"
          title="History"
          className={({ isActive }) =>
            `p-3 rounded-2xl transition-all flex items-center justify-center ${
              isActive
                ? 'bg-[#FCECE6] text-[#AC3509] shadow-sm'
                : 'text-zinc-400 hover:text-[#AC3509]'
            }`
          }
        >
          <History size={24} />
        </NavLink>

        <NavLink
          to="/chef/settings"
          title="Settings"
          className={({ isActive }) =>
            `p-3 rounded-2xl transition-all flex items-center justify-center ${
              isActive
                ? 'bg-[#FCECE6] text-[#AC3509] shadow-sm'
                : 'text-zinc-400 hover:text-[#AC3509]'
            }`
          }
        >
          <Settings size={24} />
        </NavLink>
      </nav>

      <div className="mt-auto flex flex-col gap-6 items-center">
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-3 text-zinc-400 hover:text-red-500 cursor-pointer transition-all active:scale-90"
        >
          <LogOut size={24} />
        </button>
      </div>
    </aside>
  );
};

export default ChefSidebar;

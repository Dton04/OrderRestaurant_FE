import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LogOut,
  UtensilsCrossed,
  BarChart3,
  Settings,
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  let user: { full_name?: string; role?: string } | null = null;
  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      user = parsed && typeof parsed === 'object' ? (parsed as { full_name?: string; role?: string }) : null;
    } catch {
      user = null;
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Nhân viên', path: '/admin/users' },
    { icon: Users, label: 'Quản lý bàn', path: '/admin/tables' },
    { icon: UtensilsCrossed, label: 'Thực đơn', path: '/admin/menu' },
    { icon: UtensilsCrossed, label: 'Danh mục', path: '/admin/categories' },
    { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-60 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#ef5b1b] rounded-xl flex items-center justify-center text-white font-extrabold text-xs">
            OR
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-gray-900">Admin CMS</div>
            <div className="text-[10px] text-gray-400">Quản lý hệ thống</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  isActive
                    ? 'bg-orange-50 text-[#ef5b1b] font-bold'
                    : 'text-gray-500 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#ef5b1b] flex items-center justify-center font-extrabold">
            {(user?.full_name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-gray-900 truncate">
              {user?.full_name || 'Admin User'}
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {user?.role || 'ADMIN'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-white transition-colors text-gray-500"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

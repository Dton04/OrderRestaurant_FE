import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Gift,
  LayoutDashboard,
  LogOut,
  Settings,
  TicketPercent,
  Users,
  UtensilsCrossed,
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const userRaw = localStorage.getItem('user');
  let user: { full_name?: string; role?: string } | null = null;

  if (userRaw) {
    try {
      const parsed: unknown = JSON.parse(userRaw);
      user =
        parsed && typeof parsed === 'object'
          ? (parsed as { full_name?: string; role?: string })
          : null;
    } catch {
      user = null;
    }
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Nhân viên', path: '/admin/users' },
    { icon: Users, label: 'Quản lý bàn', path: '/admin/tables'},
    { icon: UtensilsCrossed, label: 'Thực đơn', path: '/admin/menu' },
    { icon: UtensilsCrossed, label: 'Danh mục', path: '/admin/categories' },
    { icon: TicketPercent, label: 'Voucher', path: '/admin/vouchers' },
    { icon: Gift, label: 'Loyalty', path: '/admin/loyalty' },
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
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-60 flex-col border-r border-gray-100 bg-white">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ef5b1b] text-xs font-extrabold text-white">
            OR
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-gray-900">Admin CMS</div>
            <div className="text-[10px] text-gray-400">Quản lý hệ thống</div>
          </div>
        </div>
      </div>

      <nav className="mt-2 flex-1 px-3">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-orange-50 font-bold text-[#ef5b1b]'
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

      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 font-extrabold text-[#ef5b1b]">
            {(user?.full_name || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold text-gray-900">
              {user?.full_name || 'Admin User'}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {user?.role || 'ADMIN'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-white"
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

import React from 'react';
import {
  Table2,
  FileText,
  Users,
  LogOut,
  HelpCircle,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const menu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
  { icon: Table2, label: 'Table Map', path: '/staff/table-map' },
  { icon: FileText, label: 'KDS View', path: '/staff/kds' },
  { icon: FileText, label: 'Billing', path: '/staff/billing' },
  { icon: Users, label: 'Staff Schedule', path: '/staff/schedule' },
  { icon: Settings, label: 'Cài đặt', path: '/staff/settings' },
];

const StaffSidebarNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let user: { full_name?: string; role?: string } | null = null;
  const userRaw = localStorage.getItem('user');
  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw);
      if (parsed && typeof parsed === 'object') {
        user = parsed as { full_name?: string; role?: string };
      }
    } catch {
      user = null;
    }
  }

  const userName = user?.full_name || 'Staff User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-zinc-200/70 bg-[#fbfbfb] py-6">
      <div className="mb-8 mt-16 px-6">
        <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">
          The Atelier
        </h2>
        <p className="text-xs font-medium text-zinc-500/80">Main Dining Room</p>
      </div>
      <div className="px-6 pb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-extrabold text-white">
          A
        </div>
        <div>
          <div className="font-extrabold text-gray-900">{userName}</div>
          <div className="text-xs text-gray-400">Staff</div>
        </div>
      </div>
      <nav className="mt-2 flex-1 px-2">
        <div className="space-y-0.5">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mx-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-orange-600'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="mt-auto px-4">
        <div className="mb-6 rounded-xl bg-orange-50 p-4">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-800">
              Kitchen Status: Live
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-orange-700/70">
            8 orders in queue. Avg wait: 14m
          </p>
        </div>
        <div className="space-y-1">
          <Link
            to="/staff/support"
            className="mx-2 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-100"
          >
            <HelpCircle size={18} />
            <span>Support</span>
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="mx-2 mt-1 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-orange-600"
        >
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebarNew;

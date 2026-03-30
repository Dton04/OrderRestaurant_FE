import React from 'react';
import { Table2, FileText, Users, LogOut, HelpCircle, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const menu = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/staff' },
  { icon: Table2, label: 'Table Map', path: '/staff/table-map' },
  { icon: FileText, label: 'KDS View', path: '/staff/kds' },
  { icon: FileText, label: 'Billing', path: '/staff/billing' },
  { icon: Users, label: 'Staff Schedule', path: '/staff/schedule' },
  { icon: HelpCircle, label: 'Support', path: '/staff/support' },
];

const statusSummary = [
  { label: 'Available', value: 12, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Occupied', value: 8, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Reserved', value: 3, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Cleaning', value: 2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
];

const StaffSidebarNew: React.FC = () => {
  const navigate = useNavigate();

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
    <aside className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">A</div>
        <div>
          <div className="font-extrabold text-gray-900">{userName}</div>
          <div className="text-xs text-gray-400">Main Dining Room</div>
        </div>
      </div>
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-0.5">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold"
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="px-5 py-3 border-t border-gray-100">
        <div className="mb-2 text-xs font-bold text-gray-500">STATUS SUMMARY</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {statusSummary.map((s) => (
            <div key={s.label} className={`rounded-lg p-2 flex flex-col items-center ${s.bg} ${s.color}`}>
              <span className="font-bold text-lg">{s.value}</span>
              <span className="text-[10px] font-bold uppercase">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Kitchen Status: Live
        </div>
      </div>
      <div className="mt-auto px-5 pb-5">
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-orange-600 text-sm font-bold">
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebarNew;

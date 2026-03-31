import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Floor Plan', path: '/staff/table-map' },
  { label: 'Active Orders', path: '/staff/active-orders' },
  { label: 'Kitchen Pulse', path: '/staff/kds' },
  { label: 'Billing', path: '/staff/billing' },
];

const StaffTopBar: React.FC = () => {
  const location = useLocation();

  return (
    <header className="fixed left-64 right-0 top-0 z-50 h-[88px] border-b border-zinc-100 bg-white/80 shadow-[0_8px_32px_rgba(172,53,9,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-8 py-4">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold italic tracking-tight text-orange-800">
            Culinary Atelier
          </span>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`border-b-2 pb-1 text-sm font-medium transition-colors ${
                    active
                      ? 'border-orange-600 text-orange-700'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-xl bg-gradient-to-br from-[#ac3509] to-[#ff7043] px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95">
            New Order
          </button>
          <div className="flex items-center gap-2">
            <button className="rounded-full p-2 text-zinc-500 transition-all hover:bg-orange-50/70">
              <Bell size={20} />
            </button>
            <button className="rounded-full p-2 text-zinc-500 transition-all hover:bg-orange-50/70">
              <Settings size={20} />
            </button>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-100 text-sm font-bold text-orange-700">
            MA
          </div>
        </div>
      </div>
    </header>
  );
};

export default StaffTopBar;

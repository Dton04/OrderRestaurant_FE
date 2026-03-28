import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Layers,
  SquareStack,
  ClipboardList,
  Users,
  LogOut,
  HelpCircle,
  PlusCircle
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UtensilsCrossed, label: 'Menu Management', path: '/admin/menu' },
    { icon: Layers, label: 'Categories', path: '/admin/categories' },
    { icon: SquareStack, label: 'Table Management', path: '/admin/tables' },
    { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
    { icon: Users, label: 'Staff', path: '/admin/staff' },
  ];

  return (
    <aside className="w-60 bg-white h-screen border-r border-gray-100 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-5">
        <div className="text-lg font-bold text-orange-800 flex items-center gap-2 whitespace-nowrap">
          <div className="w-7 h-7 bg-orange-700 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-xs">
            <UtensilsCrossed size={14} />
          </div>
          The Atelier
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 ml-9">MAIN KITCHEN</p>
      </div>

      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive
                  ? 'bg-orange-50 text-orange-700 font-medium'
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

      <div className="p-3 space-y-1.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-100 text-sm">
          <PlusCircle size={18} />
          <span className="font-medium">New Order</span>
        </button>

        <div className="pt-3 border-t border-gray-100 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <HelpCircle size={16} />
            <span className="text-xs">Help</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
            <LogOut size={16} />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

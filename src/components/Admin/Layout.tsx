import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import AdminHeader from './Header';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <AdminHeader />
        <main className="ml-60 p-6 transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

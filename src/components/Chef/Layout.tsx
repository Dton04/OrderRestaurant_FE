import React from 'react';
import { Outlet } from 'react-router-dom';
import ChefSidebar from './Sidebar';

const ChefLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      <ChefSidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ChefLayout;

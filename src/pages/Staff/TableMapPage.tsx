import React, { useState } from 'react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import TableMapNew from '../../components/staff/TableMapNew';
import TableDetails from '../../components/staff/TableDetails';

const TableMapPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-hidden">
      <StaffSidebarNew />
      <main className="ml-64 relative pt-[88px]">
        <header className="fixed top-0 right-0 left-64 z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-[0_8px_32px_rgba(172,53,9,0.04)] h-[88px]">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold italic tracking-tight text-orange-800">Culinary Atelier</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-500">
              <span className="text-zinc-800">Floor Plan</span>
              <span>Active Orders</span>
              <span>Kitchen Pulse</span>
              <span>Inventory</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-white text-sm font-semibold rounded-lg shadow-lg">New Order</button>
            <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100"><span className="material-symbols-outlined">notifications</span></button>
            <button className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100"><span className="material-symbols-outlined">settings</span></button>
          </div>
        </header>

        <section className="pt-28 pb-10 px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
            <div className="rounded-2xl min-h-[760px] p-4 bg-white border border-zinc-100 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary-container" /> Available</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Occupied</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> Reserved</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Cleaning</span>
                </div>
              </div>
              <TableMapNew onSelectTable={setSelectedTable} />
            </div>

            <div className="rounded-2xl p-5 bg-white border border-zinc-100 shadow-sm">
              <TableDetails table={selectedTable} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TableMapPage;

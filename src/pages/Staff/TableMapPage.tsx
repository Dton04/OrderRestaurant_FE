import React, { useState } from 'react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import StaffTopBar from '../../components/staff/StaffTopBar';
import TableMapNew from '../../components/staff/TableMapNew';
import TableDetails from '../../components/staff/TableDetails';

const TableMapPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);

  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-hidden">
      <StaffTopBar />
      <StaffSidebarNew />
      <main className="ml-64 relative pt-[88px]">
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

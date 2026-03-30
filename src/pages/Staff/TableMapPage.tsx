import React, { useState } from 'react';
import StaffSidebarNew from '../../components/staff/StaffSidebarNew';
import TableMapNew from '../../components/staff/TableMapNew';
import TableDetails from '../../components/staff/TableDetails';

const TableMapPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebarNew />
      <main className="flex-1 p-6 ml-64">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TableMapNew onSelectTable={setSelectedTable} />
          </div>
          <div>
            <TableDetails table={selectedTable} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableMapPage;

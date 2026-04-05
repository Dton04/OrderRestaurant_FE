import React from 'react';

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

type StaffTable = {
  id: string | number;
  table_number?: string;
  capacity?: number;
  status?: TableStatus | string;
  area_id?: number;
  guests?: number;
  guestsField?: 'guests' | 'guest_count' | 'current_guest' | 'current_guests' | 'number_of_guests';
};

const statusColor: Record<TableStatus, string> = {
  FREE: 'bg-green-500 text-white',
  OCCUPIED: 'bg-orange-500 text-white',
  RESERVED: 'bg-indigo-500 text-white',
  CLEANING: 'bg-cyan-500 text-white',
};

const statusLabel: Record<TableStatus, string> = {
  FREE: 'Free',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  CLEANING: 'Cleaning',
};

function isTableStatus(value: unknown): value is TableStatus {
  return value === 'FREE' || value === 'OCCUPIED' || value === 'RESERVED' || value === 'CLEANING';
}

const TableMapNew: React.FC<{
  tables: StaffTable[];
  onSelectTable: (table: StaffTable) => void;
}> = ({ tables, onSelectTable }) => {
  if (tables.length === 0) {
    return <div className="text-center p-8 text-gray-500">Chưa có dữ liệu bàn.</div>;
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-6 pt-5">
      {tables.map((t) => (
        (() => {
          const status: TableStatus = isTableStatus(t.status) ? t.status : 'FREE';
          return (
        <div
          key={String(t.id)}
          className={`rounded-xl p-4 shadow-md cursor-pointer flex flex-col justify-between min-h-[110px] ${statusColor[status]}`}
          onClick={() => onSelectTable(t)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold opacity-80">{t.table_number || t.id}</span>
            <span className="text-lg">{typeof t.guests === 'number' ? t.guests : ''}</span>
          </div>
          <div className="text-xs font-bold uppercase opacity-80">{statusLabel[status]}</div>
        </div>
          );
        })()
      ))}
    </div>
  );
};

export default TableMapNew;

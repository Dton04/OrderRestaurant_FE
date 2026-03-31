import React, { useEffect, useState } from 'react';
import { tableApi } from '../../api/table';

type TableStatus = 'FREE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

type StaffTable = {
  id: string | number;
  table_number?: string;
  capacity?: number;
  status?: TableStatus | string;
  guests?: number;
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

const TableMapNew: React.FC<{ onSelectTable: (table: StaffTable) => void }> = ({ onSelectTable }) => {
  const [tables, setTables] = useState<StaffTable[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const payload = await tableApi.findAll();

        if (Array.isArray(payload)) {
          setTables(payload as StaffTable[]);
        } else {
          setTables([]);
          console.warn('TableMapNew: unexpected response payload from tableApi.findAll()', payload);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch tables in TableMapNew:', err);
        setError('Không tải được danh sách bàn. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return <div className="text-center p-8 text-gray-500">Đang tải sơ đồ bàn...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
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
